#!/usr/bin/env python3
"""
LUDERBEIN Image Pipeline (simple + safe)

What it does:
- Reads images from ./incoming/<category>/** (jpg/png/webp)
- Creates optimized WebP images:
  - assets/<category>/reel/<category>-reel-01.webp  (max edge 1200)
  - assets/<category>/thumbs/<category>-thumb-01.webp (square 900x900 center-crop)
- Writes assets/<category>/reel/manifest.json with the reel images in order.

Order:
- Alphabetical by source filename (so prefix with 01_, 02_ ... if you want strict order)

Does NOT delete anything by default.
Use --clean to remove previously generated *-reel-*.webp and *-thumb-*.webp for the processed categories.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

from PIL import Image, ImageOps


SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class OutSpec:
    kind: str  # "reel" or "thumb"
    max_edge: int
    crop_square: bool


REEL = OutSpec(kind="reel", max_edge=1200, crop_square=False)
THUMB = OutSpec(kind="thumb", max_edge=900, crop_square=True)


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in SUPPORTED_EXT


def safe_slug(name: str) -> str:
    name = name.strip().lower()
    name = name.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    name = re.sub(r"[^a-z0-9\-_/]+", "-", name)
    name = re.sub(r"-{2,}", "-", name).strip("-")
    return name or "misc"


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def resize_keep_aspect(img: Image.Image, max_edge: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_edge:
        return img
    if w >= h:
        new_w = max_edge
        new_h = int(round(h * (max_edge / w)))
    else:
        new_h = max_edge
        new_w = int(round(w * (max_edge / h)))
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def make_thumb_square(img: Image.Image, size: int) -> Image.Image:
    # Center-crop to square, then resize
    img = ImageOps.exif_transpose(img)
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img


def normalize_img(img: Image.Image) -> Image.Image:
    # Fix orientation from EXIF
    img = ImageOps.exif_transpose(img)
    # Convert to RGB for consistent output
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.mode == "RGBA":
        # flatten on black-ish background (fits site)
        bg = Image.new("RGB", img.size, (14, 6, 11))
        bg.paste(img, mask=img.getchannel("A"))
        img = bg
    return img.convert("RGB")


def save_webp(img: Image.Image, out_path: Path, quality: int = 82) -> None:
    ensure_dir(out_path.parent)
    img.save(out_path, format="WEBP", quality=quality, method=6)


def list_generated_files(dest_category: Path) -> List[Path]:
    files = []
    for sub in ("reel", "thumbs"):
        d = dest_category / sub
        if d.exists():
            files.extend(d.glob("*.webp"))
    return files


def clean_generated(dest_category: Path, category_slug: str) -> None:
    # Only remove files matching our naming pattern
    patterns = [
        re.compile(rf"^{re.escape(category_slug)}-reel-\d{{2}}\.webp$"),
        re.compile(rf"^{re.escape(category_slug)}-thumb-\d{{2}}\.webp$"),
    ]
    for p in list_generated_files(dest_category):
        if any(rx.match(p.name) for rx in patterns):
            p.unlink()


def process_category(src_cat: Path, assets_root: Path, clean: bool) -> Tuple[str, int]:
    cat_slug = safe_slug(src_cat.name)
    dest_cat = assets_root / cat_slug
    dest_reel = dest_cat / "reel"
    dest_thumbs = dest_cat / "thumbs"

    if clean:
        ensure_dir(dest_cat)
        clean_generated(dest_cat, cat_slug)

    images = sorted([p for p in src_cat.rglob("*") if is_image(p)], key=lambda p: str(p).lower())
    if not images:
        return cat_slug, 0

    manifest = []

    for idx, src in enumerate(images, start=1):
        n = f"{idx:02d}"

        try:
            img = Image.open(src)
        except Exception as e:
            print(f"[SKIP] {src} (cannot open: {e})")
            continue

        img = normalize_img(img)

        # REEL
        reel_img = resize_keep_aspect(img, REEL.max_edge)
        reel_out = dest_reel / f"{cat_slug}-reel-{n}.webp"
        save_webp(reel_img, reel_out)

        # THUMB
        thumb_img = make_thumb_square(img, THUMB.max_edge)
        thumb_out = dest_thumbs / f"{cat_slug}-thumb-{n}.webp"
        save_webp(thumb_img, thumb_out)

        manifest.append({
            "src": f"/assets/{cat_slug}/reel/{reel_out.name}",
            "thumb": f"/assets/{cat_slug}/thumbs/{thumb_out.name}",
            "alt": f"{src_cat.name} – Beispiel {n}",
        })

    ensure_dir(dest_reel)
    (dest_reel / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return cat_slug, len(manifest)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="incoming", help="Source folder with category subfolders (default: incoming)")
    ap.add_argument("--assets", default="assets", help="Assets root folder (default: assets)")
    ap.add_argument("--clean", action="store_true", help="Delete previously generated files for processed categories")
    args = ap.parse_args()

    src_root = Path(args.src)
    assets_root = Path(args.assets)

    if not src_root.exists():
        print(f"[ERR] Source folder not found: {src_root.resolve()}")
        print("Create it like: incoming/metall, incoming/glas, incoming/schiefer ...")
        return 2

    categories = [p for p in src_root.iterdir() if p.is_dir()]
    if not categories:
        print(f"[ERR] No category folders found in: {src_root.resolve()}")
        return 2

    total = 0
    for cat in sorted(categories, key=lambda p: p.name.lower()):
        slug, count = process_category(cat, assets_root, clean=args.clean)
        print(f"[OK] {cat.name} → /assets/{slug}/ (images: {count})")
        total += count

    print(f"[DONE] Total processed images: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
