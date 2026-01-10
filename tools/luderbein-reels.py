#!/usr/bin/env python3
"""
LUDERBEIN – One-Button Feed Builder (Werkstatt + Kategorien)

Ziel:
- Bilder reinwerfen -> Script laufen lassen -> assets + JSON committen -> fertig.

Input (lokal, NICHT committen/deployen):
incoming/
  werkstatt/
    schiefer/      (cats = ["schiefer"])
    metall/        (cats = ["metall"])
    metall_acryl/  (cats = ["metall","acryl"])
    schwibbogen/holz/ (cats = ["schwibbogen","holz"])
  metall/
  glas/
  holz/
  acryl/
  schiefer/
  custom/
  ...

Output (ins Repo, wird deployed):
assets/
  reel/
    reel-01.webp
    reel-02.webp
    ...
  reel-werkstatt.json
  reel-metall.json        (optional, per --category-reels)
  metall/
    metall-reel-01.webp
    metall-thumb-01.webp
    cover.webp
    cover-square.webp
  glas/
    ...

Werkstatt JSON-Format (wie dein bestehendes):
[
  {
    "src": "/assets/reel/reel-01.webp",
    "alt": "Werkstatt – Einblick",
    "cap": "Werkstatt – Einblick",
    "cats": ["metall","acryl"],
    "tag": "Schwibbogen"   (optional)
  }
]

Reihenfolge:
- alphabetisch nach Dateiname innerhalb eines Ordners (du musst nix steuern)

Cover/Kachelbild:
- Wenn du pro Kategorie ein bestimmtes Vorschaubild willst:
  Lege in incoming/<kategorie>/ eine Datei mit 'cover' oder 'kachel' oder 'thumb' im Namen ab,
  z.B. cover.jpg oder kachel_metall.jpg
  -> erzeugt assets/<kategorie>/cover.webp + cover-square.webp
  (Cover wird NICHT automatisch in den Feed aufgenommen.)

Requirements:
pip install pillow
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
        # flatten on dark background (fits site)
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
    """
    Splits folder names like:
      'metall_acryl' -> ['metall','acryl']
      'metall+acryl' -> ['metall','acryl']
      'schwibbogen-holz' -> ['schwibbogen','holz']
    """
    raw = slug(name)
    parts = re.split(r"[\-]+", raw)
    out: List[str] = []
    for p in parts:
        if not p:
            continue
        # allow secondary split on common separators before slugging (already slugged though)
        out.append(p)
    return [t for t in out if t]


def cats_from_relative(rel: Path) -> List[str]:
    """
    rel is path relative to incoming/werkstatt, like:
      metall_acryl/reel-06.jpg -> cats ["metall","acryl"]
      schwibbogen/holz/x.jpg   -> cats ["schwibbogen","holz"]
    """
    cats: List[str] = []
    for part in rel.parts[:-1]:  # folder parts only
        cats.extend(split_tags(part))
    # de-dup keep order
    seen = set()
    ordered = []
    for c in cats:
        if c not in seen:
            seen.add(c)
            ordered.append(c)
    return ordered


def find_cover_file(cat_dir: Path) -> Optional[Path]:
    rx = re.compile(r"(cover|kachel|thumb)", re.IGNORECASE)
    for p in sorted([x for x in cat_dir.iterdir() if is_image(x)], key=lambda x: x.name.lower()):
        if rx.search(p.stem):
            return p
    return None


def list_category_images(cat_dir: Path) -> List[Path]:
    imgs = [p for p in cat_dir.rglob("*") if is_image(p)]
    # exclude obvious cover files
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


def build_werkstatt(
    incoming_root: Path,
    assets_root: Path,
    quality: int,
    clean: bool,
) -> Tuple[int, Path]:
    """
    Builds:
      assets/reel/reel-XX.webp
      assets/reel-werkstatt.json
    from:
      incoming/werkstatt/** images
    """
    src_root = incoming_root / "werkstatt"
    out_img_dir = assets_root / "reel"
    out_json = assets_root / "reel-werkstatt.json"

    if not src_root.exists():
        return 0, out_json

    ensure_dir(out_img_dir)

    if clean:
        clean_prefix(out_img_dir, re.compile(r"^reel-\d{2}\.webp$"))
        out_json.unlink(missing_ok=True)

    images = sorted([p for p in src_root.rglob("*") if is_image(p)], key=lambda p: str(p).lower())
    if not images:
        return 0, out_json

    items: List[Dict] = []
    for i, src in enumerate(images, start=1):
        n = f"{i:02d}"
        rel = src.relative_to(src_root)
        cats = cats_from_relative(rel)
        if not cats:
            cats = ["werkstatt"]

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

    out_json.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(items), out_json


def build_category(
    cat_name: str,
    cat_dir: Path,
    assets_root: Path,
    quality: int,
    clean: bool,
    build_reel_json: bool,
) -> Dict[str, str | int]:
    """
    Builds:
      assets/<cat>/<cat>-reel-XX.webp
      assets/<cat>/<cat>-thumb-XX.webp
      assets/<cat>/cover.webp + cover-square.webp
      optional: assets/reel-<cat>.json (Reel format)
    """
    cat = slug(cat_name)
    out_dir = assets_root / cat
    ensure_dir(out_dir)

    if clean:
        clean_prefix(out_dir, re.compile(rf"^{re.escape(cat)}-(reel|thumb)-\d{{2}}\.webp$"))
        (out_dir / "cover.webp").unlink(missing_ok=True)
        (out_dir / "cover-square.webp").unlink(missing_ok=True)
        (assets_root / f"reel-{cat}.json").unlink(missing_ok=True)

    cover_src = find_cover_file(cat_dir)
    imgs = list_category_images(cat_dir)
    if not imgs and not cover_src:
        return {"category": cat, "count": 0}

    # Cover: explicit cover else first image
    cover_pick = cover_src or imgs[0]
    with Image.open(cover_pick) as im:
        cover = render_variant(im, SPEC_COVER)
        cover_sq = render_variant(im, SPEC_COVER_SQ)
    save_webp(cover, out_dir / "cover.webp", quality=quality)
    save_webp(cover_sq, out_dir / "cover-square.webp", quality=quality)

    # Feed items (exclude cover file if it was inside and matched by name)
    items: List[Dict] = []
    for i, src in enumerate(imgs, start=1):
        n = f"{i:02d}"
        with Image.open(src) as im:
            reel_img = render_variant(im, SPEC_REEL)
            thumb_img = render_variant(im, SPEC_THUMB)
        out_reel = out_dir / f"{cat}-reel-{n}.webp"
        out_thumb = out_dir / f"{cat}-thumb-{n}.webp"
        save_webp(reel_img, out_reel, quality=quality)
        save_webp(thumb_img, out_thumb, quality=quality)

        items.append({
            "src": f"/assets/{cat}/{out_reel.name}",
            "alt": f"{cat_name} – Einblick",
            "cap": f"{cat_name} – Beispiel",
            "cats": [cat]
        })

    if build_reel_json:
        out_json = assets_root / f"reel-{cat}.json"
        out_json.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    return {"category": cat, "count": len(items)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="incoming", help="Input root (default: incoming)")
    ap.add_argument("--assets", default="assets", help="Assets root (default: assets)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality (default: 82)")
    ap.add_argument("--clean", action="store_true", help="Remove previously generated webp/json for processed targets")
    ap.add_argument("--category-reels", action="store_true", help="Also write /assets/reel-<cat>.json for each category")
    args = ap.parse_args()

    incoming_root = Path(args.src)
    assets_root = Path(args.assets)

    if not incoming_root.exists():
        print(f"[ERR] missing input root: {incoming_root.resolve()}")
        return 2
    if not assets_root.exists():
        print(f"[ERR] missing assets root: {assets_root.resolve()}")
        return 2

    # 1) Werkstatt
    w_count, w_json = build_werkstatt(incoming_root, assets_root, args.quality, args.clean)
    if w_count:
        print(f"[OK] Werkstatt: {w_count} Bilder -> {w_json.as_posix()}")
    else:
        print("[INFO] Werkstatt: kein incoming/werkstatt oder keine Bilder gefunden (übersprungen)")

    # 2) Categories: every folder in incoming_root except 'werkstatt'
    cats = [p for p in incoming_root.iterdir() if p.is_dir() and p.name.lower() != "werkstatt"]
    if not cats:
        print("[INFO] Keine Kategorienordner gefunden (incoming/<kategorie>/...).")
        return 0

    total = 0
    for cat_dir in sorted(cats, key=lambda p: p.name.lower()):
        res = build_category(
            cat_name=cat_dir.name,
            cat_dir=cat_dir,
            assets_root=assets_root,
            quality=args.quality,
            clean=args.clean,
            build_reel_json=args.category_reels,
        )
        print(f"[OK] {res['category']}: {res['count']} feed-bilder (+ cover) -> /assets/{res['category']}/")
        total += int(res["count"])

    print(f"[DONE] Kategorien-Feeeds verarbeitet: {total}")
    if args.category_reels:
        print("[DONE] Zusätzlich: /assets/reel-<kategorie>.json erzeugt (Reel-Format).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
