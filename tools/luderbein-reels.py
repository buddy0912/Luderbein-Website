#!/usr/bin/env python3
"""
LUDERBEIN – One-Button Feed Builder (Werkstatt + Kategorien)

Fix: Erzeugt die erwarteten JSON-Dateien IMMER (auch wenn noch keine Bilder da sind),
damit der GitHub Action "link_check" nicht wegen fehlender Targets scheitert.

Input (lokal, NICHT committen/deployen):
  ../luderbein-incoming/
    werkstatt/** (Bilder für Werkstatt-Reel)
    metall/**, holz/**, schiefer/** ... (Bilder für Leistungs-Reels)

Output (ins Repo, wird deployed):
  assets/reel-werkstatt.json                 (IMMER vorhanden, notfalls [])
  assets/reel/reel-01.webp ...               (nur wenn Bilder vorhanden)
  assets/reel-<kategorie>.json               (IMMER vorhanden bei --category-reels, notfalls [])
  assets/<kategorie>/*.webp                  (nur wenn Bilder vorhanden)

Requirements:
  python3 -m pip install --user pillow
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image, ImageOps

SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class ImgSpec:
    max_edge: int
    square: bool


SPEC_REEL = ImgSpec(max_edge=1200, square=False)
SPEC_THUMB = ImgSpec(max_edge=900, square=True)
SPEC_COVER = ImgSpec(max_edge=1200, square=False)
SPEC_COVER_SQ = ImgSpec(max_edge=900, square=True)


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in SUPPORTED_EXT


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def slug(s: str) -> str:
    s = s.strip().lower()
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "misc"


def normalize_img(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (14, 6, 11))
        bg.paste(img, mask=img.getchannel("A"))
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
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


def render_variant(img: Image.Image, spec: ImgSpec) -> Image.Image:
    img = normalize_img(img)
    if spec.square:
        return center_crop_square(img, spec.max_edge)
    return resize_keep_aspect(img, spec.max_edge)


def save_webp(img: Image.Image, out_path: Path, quality: int) -> None:
    ensure_dir(out_path.parent)
    img.save(out_path, format="WEBP", quality=quality, method=6)


def split_tags(name: str) -> List[str]:
    raw = slug(name)
    parts = re.split(r"[\-]+", raw)
    return [p for p in parts if p]


def cats_from_relative(rel: Path) -> List[str]:
    cats: List[str] = []
    for part in rel.parts[:-1]:
        cats.extend(split_tags(part))
    seen = set()
    ordered = []
    for c in cats:
        if c not in seen:
            seen.add(c)
            ordered.append(c)
    return ordered


def find_cover_file(cat_dir: Path) -> Optional[Path]:
    rx = re.compile(r"(cover|kachel|thumb)", re.IGNORECASE)
    if not cat_dir.exists():
        return None
    for p in sorted([x for x in cat_dir.iterdir() if is_image(x)], key=lambda x: x.name.lower()):
        if rx.search(p.stem):
            return p
    return None


def list_category_images(cat_dir: Path) -> List[Path]:
    if not cat_dir.exists():
        return []
    imgs = [p for p in cat_dir.rglob("*") if is_image(p)]
    rx = re.compile(r"(cover|kachel|thumb)", re.IGNORECASE)
    imgs = [p for p in imgs if not rx.search(p.stem)]
    return sorted(imgs, key=lambda p: str(p).lower())


def clean_prefix(folder: Path, prefix_rx: re.Pattern) -> int:
    if not folder.exists():
        return 0
    n = 0
    for p in folder.glob("*.webp"):
        if prefix_rx.match(p.name):
            p.unlink(missing_ok=True)
            n += 1
    return n


def write_json(path: Path, data: List[Dict]) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_werkstatt(
    incoming_root: Path,
    assets_root: Path,
    quality: int,
    clean: bool,
) -> Tuple[int, Path]:
    """
    Always writes: assets/reel-werkstatt.json  (empty list if no images)
    If images exist, also writes: assets/reel/reel-XX.webp
    """
    src_root = incoming_root / "werkstatt"
    out_img_dir = assets_root / "reel"
    out_json = assets_root / "reel-werkstatt.json"

    ensure_dir(out_img_dir)

    if clean:
        clean_prefix(out_img_dir, re.compile(r"^reel-\d{2}\.webp$"))
        out_json.unlink(missing_ok=True)

    images: List[Path] = []
    if src_root.exists():
        images = sorted([p for p in src_root.rglob("*") if is_image(p)], key=lambda p: str(p).lower())

    items: List[Dict] = []
    for i, src in enumerate(images, start=1):
        n = f"{i:02d}"
        rel = src.relative_to(src_root)
        cats = cats_from_relative(rel) or ["werkstatt"]

        with Image.open(src) as im:
            out_img = render_variant(im, SPEC_REEL)
        out_path = out_img_dir / f"reel-{n}.webp"
        save_webp(out_img, out_path, quality=quality)

        items.append({
            "src": f"/assets/reel/{out_path.name}",
            "alt": "Werkstatt – Einblick",
            "cap": "Werkstatt – Einblick",
            "cats": cats
        })

    # IMPORTANT: always write JSON (even if empty)
    write_json(out_json, items)
    return len(items), out_json


def build_category_assets(
    cat_name: str,
    cat_dir: Path,
    assets_root: Path,
    quality: int,
    clean: bool,
) -> Dict[str, int | str]:
    """
    Creates cover + reel + thumbs for category folder if images exist.
    Does NOT write reel-<cat>.json here (handled separately).
    """
    cat = slug(cat_name)
    out_dir = assets_root / cat
    ensure_dir(out_dir)

    if clean:
        clean_prefix(out_dir, re.compile(rf"^{re.escape(cat)}-(reel|thumb)-\d{{2}}\.webp$"))
        (out_dir / "cover.webp").unlink(missing_ok=True)
        (out_dir / "cover-square.webp").unlink(missing_ok=True)

    cover_src = find_cover_file(cat_dir)
    imgs = list_category_images(cat_dir)

    if not imgs and not cover_src:
        return {"category": cat, "count": 0}

    cover_pick = cover_src or imgs[0]
    with Image.open(cover_pick) as im:
        cover = render_variant(im, SPEC_COVER)
        cover_sq = render_variant(im, SPEC_COVER_SQ)
    save_webp(cover, out_dir / "cover.webp", quality=quality)
    save_webp(cover_sq, out_dir / "cover-square.webp", quality=quality)

    items_built = 0
    for i, src in enumerate(imgs, start=1):
        n = f"{i:02d}"
        with Image.open(src) as im:
            reel_img = render_variant(im, SPEC_REEL)
            thumb_img = render_variant(im, SPEC_THUMB)

        out_reel = out_dir / f"{cat}-reel-{n}.webp"
        out_thumb = out_dir / f"{cat}-thumb-{n}.webp"
        save_webp(reel_img, out_reel, quality=quality)
        save_webp(thumb_img, out_thumb, quality=quality)
        items_built += 1

    return {"category": cat, "count": items_built}


def build_category_reel_json(
    cat_slug: str,
    assets_root: Path,
    cat_display: str,
) -> Path:
    """
    Always writes assets/reel-<cat>.json.
    If category images exist in assets/<cat>/<cat>-reel-XX.webp, list them; else [].
    """
    out_json = assets_root / f"reel-{cat_slug}.json"
    out_dir = assets_root / cat_slug
    items: List[Dict] = []

    if out_dir.exists():
        reel_imgs = sorted(out_dir.glob(f"{cat_slug}-reel-*.webp"), key=lambda p: p.name.lower())
        for p in reel_imgs:
            items.append({
                "src": f"/assets/{cat_slug}/{p.name}",
                "alt": f"{cat_display} – Einblick",
                "cap": f"{cat_display} – Beispiel",
                "cats": [cat_slug]
            })

    write_json(out_json, items)
    return out_json


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="incoming", help="Input root (default: incoming)")
    ap.add_argument("--assets", default="assets", help="Assets root (default: assets)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality (default: 82)")
    ap.add_argument("--clean", action="store_true", help="Remove previously generated webp/json for processed targets")
    ap.add_argument("--category-reels", action="store_true", help="Write /assets/reel-<cat>.json for each category (always, even empty)")
    args = ap.parse_args()

    incoming_root = Path(args.src)
    assets_root = Path(args.assets)

    if not assets_root.exists():
        print(f"[ERR] missing assets root: {assets_root.resolve()}")
        return 2

    # Werkstatt (always writes JSON)
    w_count, w_json = build_werkstatt(incoming_root, assets_root, args.quality, args.clean)
    print(f"[OK] Werkstatt JSON: {w_json.as_posix()} (items: {w_count})")

    # Categories
    cats: List[Path] = []
    if incoming_root.exists():
        cats = [p for p in incoming_root.iterdir() if p.is_dir() and p.name.lower() != "werkstatt"]

    total = 0
    for cat_dir in sorted(cats, key=lambda p: p.name.lower()):
        res = build_category_assets(
            cat_name=cat_dir.name,
            cat_dir=cat_dir,
            assets_root=assets_root,
            quality=args.quality,
            clean=args.clean,
        )
        print(f"[OK] {res['category']}: assets gebaut (count: {res['count']})")
        total += int(res["count"])

        if args.category_reels:
            # IMPORTANT: always write reel-<cat>.json (even if empty)
            build_category_reel_json(str(res["category"]), assets_root, cat_dir.name)

    if args.category_reels and not cats:
        # Even if there are no incoming categories, still nothing to do. (Werkstatt JSON already exists.)
        pass

    print(f"[DONE] Kategorie-Assets verarbeitet: {total}")
    if args.category_reels:
        print("[DONE] reel-<kategorie>.json Dateien sind erzeugt (auch leer, damit link_check happy ist).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())