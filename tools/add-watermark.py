#!/usr/bin/env python3
"""
LUDERBEIN Watermark – Fügt das LB-Logo rechts unten als Wasserzeichen hinzu

Usage:
  python3 add-watermark.py                    # alle Bilder in assets/
  python3 add-watermark.py --source incoming/ # von incoming/ Ordner
  python3 add-watermark.py --help             # mehr Optionen

Das Logo wird als PNG auf die Bilder gelegt:
  - Größe: ~10% der Bildkante (proportional)
  - Position: rechts unten mit 20px Abstand
  - Deckkraft: 0.8 (leicht transparent)
  - Sichert Original: _original_watermark Suffix

Falls SVG zu PNG:
  Das SVG wird bei Bedarf zu PNG konvertiert (braucht cairosvg oder ImageMagick)
"""

import argparse
import json
from pathlib import Path
from typing import Optional, Tuple
import sys

try:
    from PIL import Image
    import io
except ImportError:
    print("ERROR: PIL (Pillow) wird benötigt. Install mit: pip install Pillow")
    sys.exit(1)

# cairosvg ist optional - nur bei Bedarf laden
HAS_CAIROSVG = False

WORKSPACE_ROOT = Path(__file__).parent.parent
ASSETS_DIR = WORKSPACE_ROOT / "assets"
BRAND_DIR = ASSETS_DIR / "brand"
SVG_LOGO = BRAND_DIR / "mark.svg"

# Unterstützte Bildformate
SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def svg_to_png(svg_path: Path, output_size: int = 256, color: str = "black") -> Optional[Image.Image]:
    """
    Konvertiert SVG zu PNG - behält natürliche Form (kein erzwungenes Quadrat).
    
    Args:
        svg_path: Pfad zur SVG-Datei
        output_size: Größe in Pixel
        color: Farbe ('black' oder 'white')
    
    Returns:
        PIL Image (RGBA) mit natürlicher Form oder None bei Fehler
    """
    if not svg_path.exists():
        print(f"❌ SVG nicht gefunden: {svg_path}")
        return None
    
    try:
        import subprocess
        # Einfach rendern: SVG → PNG ohne Größen-Erzwingung
        # Das Symbol behält seine natürliche Form (nicht-perfekter Kreis)
        png_bytes = subprocess.check_output([
            "convert",
            f"{svg_path}",
            "-background", "none",
            "-fill", color,
            "+opaque", "black",
            "-density", "150",  # höhere Qualität
            "png:-"
        ], stderr=subprocess.DEVNULL)
        result = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        
        # Skaliere proportional (behält Seitenverhältnis)
        result.thumbnail((output_size, output_size), Image.Resampling.LANCZOS)
        return result
    except (FileNotFoundError, subprocess.CalledProcessError) as e:
        print(f"❌ ImageMagick-Konvertierung fehlgeschlagen: {e}")
        return None


def get_watermark_png(size: int = 128, color: str = "black") -> Optional[Image.Image]:
    """
    Lädt das Wasserzeichen direkt vom SVG - einfach und sauber.
    
    Args:
        size: Größe des Wasserzeichens in Pixel
        color: 'black' oder 'white'
    
    Returns:
        PIL Image (RGBA) oder None bei Fehler
    """
    # SVG rendern - minimalistisch
    logo_png = svg_to_png(SVG_LOGO, output_size=size, color=color)
    return logo_png


def add_watermark(
    image_path: Path,
    opacity: float = 0.35,
    padding: int = 20
) -> Optional[Image.Image]:
    """
    Fügt Wasserzeichen rechts unten hinzu mit adaptiver Farbe.
    
    Args:
        image_path: Pfad zur Eingabe-Bilddatei
        opacity: Deckkraft 0.0–1.0 (default: 0.35 = subtiler)
        padding: Abstand von rechts/unten in Pixel
    
    Returns:
        PIL Image mit Wasserzeichen oder None bei Fehler
    """
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"❌ Bild konnte nicht geladen werden: {image_path}")
        print(f"   Fehler: {e}")
        return None
    
    # Wasserzeichen-Größe: ~10% der größeren Kante
    img_max_edge = max(img.size)
    watermark_size = int(img_max_edge * 0.1)
    watermark_size = max(64, min(watermark_size, 256))  # zwischen 64–256px
    
    # Bestimme Helligkeit der unteren rechten Ecke (wo das Wasserzeichen kommt)
    corner_width = min(200, img.width // 4)
    corner_height = min(200, img.height // 4)
    corner_box = (
        img.width - corner_width,
        img.height - corner_height,
        img.width,
        img.height
    )
    corner = img.crop(corner_box)
    corner_gray = corner.convert("L")  # zu Grayscale
    corner_brightness = sum(corner_gray.getdata()) / (corner_width * corner_height)
    
    # Adaptive Farbe: Wenn hell (>150), verwende schwarz; sonst weiß
    use_white = corner_brightness < 150
    color = "white" if use_white else "black"
    
    # Lade Wasserzeichen in der passenden Farbe
    watermark = get_watermark_png(size=watermark_size, color=color)
    if not watermark:
        print(f"❌ Wasserzeichen konnte nicht geladen werden für {image_path}")
        return None
    
    # Opacity anwenden (0–255)
    if watermark.mode == "RGBA":
        alpha = watermark.split()[3]
        alpha = alpha.point(lambda p: int(p * opacity))
        watermark.putalpha(alpha)
    
    # Position: rechts unten mit padding
    x = img.width - watermark_size - padding
    y = img.height - watermark_size - padding
    x = max(0, x)
    y = max(0, y)
    
    # Watermark auf Bild legen
    img_with_watermark = img.copy()
    img_with_watermark.paste(watermark, (x, y), watermark)
    
    return img_with_watermark


def process_images(
    source_dir: Path = None,
    dry_run: bool = False,
    verbose: bool = False
):
    """
    Verarbeitet alle Bilder und fügt Wasserzeichen hinzu.
    
    Args:
        source_dir: Verzeichnis mit Bildern (default: assets/)
        dry_run: Zeige nur, was gemacht würde
        verbose: Ausführliche Ausgabe
    """
    if source_dir is None:
        source_dir = ASSETS_DIR
    
    if not source_dir.exists():
        print(f"❌ Verzeichnis nicht gefunden: {source_dir}")
        return
    
    # Finde alle Bilder
    image_files = []
    for ext in SUPPORTED_EXT:
        image_files.extend(source_dir.rglob(f"*{ext}"))
        image_files.extend(source_dir.rglob(f"*{ext.upper()}"))
    
    image_files = sorted(set(image_files))
    
    if not image_files:
        print(f"ℹ️  Keine Bilder in {source_dir} gefunden.")
        return
    
    print(f"\n🖼️  Verarbeite {len(image_files)} Bilder...\n")
    
    success = 0
    failed = 0
    
    for idx, img_path in enumerate(image_files, 1):
        rel_path = img_path.relative_to(WORKSPACE_ROOT)
        
        # Überspringe bereits markierte Bilder
        if "_original_watermark" in img_path.name:
            if verbose:
                print(f"⊘ ({idx}) {rel_path} – schon markiert")
            continue
        
        if verbose:
            print(f"→ ({idx}) {rel_path}")
        
        # Füge Wasserzeichen hinzu
        result = add_watermark(img_path)
        if not result:
            failed += 1
            print(f"  ❌ Fehler beim Verarbeiten")
            continue
        
        if not dry_run:
            # Sicherte Original (mit sprechenden Namen)
            orig_path = img_path.parent / f"{img_path.stem}_original_watermark{img_path.suffix}"
            img_path.replace(orig_path)
            
            # Speichere neue Version mit Wasserzeichen
            try:
                result.save(img_path, quality=95)
                success += 1
                print(f"  ✓ Wasserzeichen hinzugefügt")
            except Exception as e:
                print(f"  ❌ Fehler beim Speichern: {e}")
                # Restore original
                orig_path.replace(img_path)
                failed += 1
        else:
            success += 1
            print(f"  [DRY RUN] würde bearbeitet")
    
    print(f"\n{'='*50}")
    print(f"✓ Erfolgreich: {success}")
    print(f"❌ Fehler: {failed}")
    if dry_run:
        print("\n💡 Tip: Ohne --dry-run werden Änderungen gespeichert")


def main():
    parser = argparse.ArgumentParser(
        description="Fügt LB-Logo-Wasserzeichen zu Bildern hinzu",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python3 add-watermark.py                      # alle Bilder in assets/
  python3 add-watermark.py --source incoming/   # custom Pfad
  python3 add-watermark.py --dry-run            # nur zeigen, nicht speichern
  python3 add-watermark.py -v                   # verbose
        """
    )
    
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Quelle-Verzeichnis (default: assets/)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Nur zeigen, nicht speichern"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Ausführliche Ausgabe"
    )
    
    args = parser.parse_args()
    
    process_images(
        source_dir=args.source,
        dry_run=args.dry_run,
        verbose=args.verbose
    )


if __name__ == "__main__":
    main()
