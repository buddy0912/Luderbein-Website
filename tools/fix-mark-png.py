#!/usr/bin/env python3
"""
Entfernt den Hintergrund aus mark.png und macht ihn transparent
"""

from PIL import Image
from pathlib import Path

MARK_PNG = Path(__file__).parent.parent / "assets" / "brand" / "mark.png"

if not MARK_PNG.exists():
    print(f"❌ {MARK_PNG} nicht gefunden!")
    exit(1)

# Lade PNG
img = Image.open(MARK_PNG).convert("RGBA")
print(f"✓ PNG geladen: {img.size}")

# Konvertiere zu RGB für Analyse
img_rgb = img.convert("RGB")

# Hole Farbe der Ecke (oben-links = wahrscheinlich Hintergrund)
corner_color = img_rgb.getpixel((0, 0))
print(f"Eckenfarbe (Hintergrund): RGB{corner_color}")

# Mache diese Farbe transparent (mit Toleranz)
data = img.getdata()
new_data = []
tolerance = 30

for item in data:
    r, g, b, a = item
    # Wenn Farbe ähnlich wie Eckenfarbe
    if (abs(r - corner_color[0]) < tolerance and
        abs(g - corner_color[1]) < tolerance and
        abs(b - corner_color[2]) < tolerance):
        new_data.append((r, g, b, 0))  # transparent
    else:
        new_data.append(item)

img.putdata(new_data)

# Speichere
img.save(MARK_PNG)
print(f"✓ Gespeichert: Hintergrund ist jetzt transparent!")
