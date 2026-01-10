DATEI: /tools/luderbein-images.py

#!/usr/bin/env python3
"""
LUDERBEIN Image Pipeline – simpel, schnell, ohne Drama

Input:
  ./incoming/<kategorie>/**/*.jpg|png|webp
  optional: ./incoming/<kategorie>/cover.jpg (oder cover.png)

Output:
  ./assets/<kategorie>/
    <kategorie>-reel-01.webp ... (max Kante 1200)
    <kategorie>-thumb-01.webp ... (1:1, 900x900)
    cover.webp
    cover-square.webp
    manifest.json

manifest.json ist eine Liste mit:
  [{ "src": "...reel..webp", "thumb": "...thumb..webp", "alt": "..." }, ...]

Reihenfolge:
  Alphabetisch nach Dateiname. (Du musst sie NICHT steuern – passt so.)

Wichtig:
- cover.* wird NICHT in den Feed aufgenommen (nur als Vorschaubild genutzt).
- Script löscht nichts, außer du nutzt --clean.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

from PIL import Image, ImageOps


SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class Spec:
    max_edge: int
    square: bool


SPEC_REEL = Spec(max_edge=1200, square=False)
SPEC_THUMB = Spec(max_edge=900, square=True)
SPEC_COVER = Spec(max_edge=1200, square=False)
SPEC_COVER_SQ = Spec(max_edge=900, square=True)


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in SUPPORTED_EXT


def slug(s: str) -> str:
    s = s.strip().lower()
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "misc"


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def normalize_img(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    if img.mode == "RGBA":
        # flatten on dark bg (fits Luderbein look)
        bg = Image.new("RGB", img.size, (14, 6, 11))
        bg.paste(img, mask=img.getchannel("A"))
        return bg
    if img.mode != "RGB":
        return img.convert("RGB")
    return img


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


def center_crop_square(img: Image.Image, size: int) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    return img.resize((size, size), Image.Resampling.LANCZOS)


def save_webp(img: Image.Image, out: Path, quality: int = 82) -> None:
    ensure_dir(out.parent)
    img.save(out, format="WEBP", quality=quality, method=6)


def find_cover_file(cat_dir: Path) -> Optional[Path]:
    for name in ("cover.jpg", "cover.jpeg", "cover.png", "cover.webp", "_cover.jpg", "_cover.png", "_cover.webp"):
        p = cat_dir / name
        if p.exists() and is_image(p):
            return p
    return None


def list_source_images(cat_dir: Path) -> List[Path]:
    imgs = [p for p in cat_dir.rglob("*") if is_image(p)]
    # exclude cover.*
    imgs = [p for p in imgs if p.name.lower() not in {
        "cover.jpg", "cover.jpeg", "cover.png", "cover.webp",
        "_cover.jpg", "_cover.png", "_cover.webp"
    }]
    return sorted(imgs, key=lambda p: str(p).lower())


def clean_generated(dest_dir: Path, cat_slug: str) -> None:
    # only remove our generated patterns
    rx = re.compile(rf"^{re.escape(cat_slug)}-(reel|thumb)-\d{{2}}\.webp$")
    for p in dest_dir.glob("*.webp"):
        if rx.match(p.name) or p.name in ("cover.webp", "cover-square.webp"):
            p.unlink(missing_ok=True)
    (dest_dir / "manifest.json").unlink(missing_ok=True)


def render_variant(img: Image.Image, spec: Spec) -> Image.Image:
    img = normalize_img(img)
    if spec.square:
        return center_crop_square(img, spec.max_edge)
    return resize_keep_aspect(img, spec.max_edge)


def process_category(src_cat: Path, assets_root: Path, do_clean: bool) -> Tuple[str, int]:
    cat_slug = slug(src_cat.name)
    dest = assets_root / cat_slug
    ensure_dir(dest)

    if do_clean:
        clean_generated(dest, cat_slug)

    images = list_source_images(src_cat)
    if not images:
        # still try to build cover if present
        cover_src = find_cover_file(src_cat)
        if cover_src:
            with Image.open(cover_src) as im:
                cover = render_variant(im, SPEC_COVER)
                save_webp(cover, dest / "cover.webp")
                cover_sq = render_variant(im, SPEC_COVER_SQ)
                save_webp(cover_sq, dest / "cover-square.webp")
        return cat_slug, 0

    # Cover: explicit cover.* else first image
    cover_src = find_cover_file(src_cat) or images[0]
    with Image.open(cover_src) as im:
        cover = render_variant(im, SPEC_COVER)
        save_webp(cover, dest / "cover.webp")
        cover_sq = render_variant(im, SPEC_COVER_SQ)
        save_webp(cover_sq, dest / "cover-square.webp")

    manifest = []
    for i, src in enumerate(images, start=1):
        n = f"{i:02d}"
        try:
            with Image.open(src) as im:
                reel = render_variant(im, SPEC_REEL)
                thumb = render_variant(im, SPEC_THUMB)
        except Exception as e:
            print(f"[SKIP] {src} (cannot open: {e})")
            continue

        out_reel = dest / f"{cat_slug}-reel-{n}.webp"
        out_thumb = dest / f"{cat_slug}-thumb-{n}.webp"
        save_webp(reel, out_reel)
        save_webp(thumb, out_thumb)

        manifest.append({
            "src": f"/assets/{cat_slug}/{out_reel.name}",
            "thumb": f"/assets/{cat_slug}/{out_thumb.name}",
            "alt": f"{src_cat.name} – Beispiel {n}",
        })

    (dest / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    return cat_slug, len(manifest)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="incoming", help="Source folder (default: incoming)")
    ap.add_argument("--assets", default="assets", help="Assets root (default: assets)")
    ap.add_argument("--clean", action="store_true", help="Remove previously generated webp/manifest for processed categories")
    args = ap.parse_args()

    src_root = Path(args.src)
    assets_root = Path(args.assets)

    if not src_root.exists():
        print(f"[ERR] Source folder not found: {src_root.resolve()}")
        print("Create e.g.: incoming/metall incoming/glas incoming/werkstatt ...")
        return 2

    cats = [p for p in src_root.iterdir() if p.is_dir()]
    if not cats:
        print(f"[ERR] No category folders found in: {src_root.resolve()}")
        return 2

    total = 0
    for cat in sorted(cats, key=lambda p: p.name.lower()):
        slugged, count = process_category(cat, assets_root, args.clean)
        print(f"[OK] {cat.name} → /assets/{slugged}/ (items: {count})")
        total += count

    print(f"[DONE] Total feed images processed: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
