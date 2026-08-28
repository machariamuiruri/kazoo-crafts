#!/usr/bin/env python3
"""Generate the Kazoo Crafts raster icons from the master mark geometry.

Run from the repo root:

    python3 scripts/render-icons.py

Requires Pillow (`pip install Pillow`). Regenerate whenever the mark changes —
the geometry below must stay in step with src/app/icon.svg,
public/logo-mark.svg and src/components/ui/Logo.tsx.
"""

import io
import math
import os
import struct

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_APP = os.path.join(ROOT, "src", "app")
OUT_PUB = os.path.join(ROOT, "public")

LEATHER = (0x6B, 0x3A, 0x19, 255)
CREAM = (0xF9, 0xF6, 0xF0, 255)
GOLD = (0xD4, 0xAF, 0x37, 230)

SS = 8  # supersample factor — PIL doesn't anti-alias polygon fills
VB = 64.0  # SVG viewBox units

# Monogram K. Arm and leg spring from one vertex on the stem's right edge;
# offsetting them makes the junction read as a blob rather than a letter.
STROKES = [
    ((22, 17), (22, 47), 7.0),      # stem
    ((25.5, 32), (43, 17), 6.0),    # upper arm
    ((25.5, 32), (44.5, 47), 6.5),  # lower leg
]


def thick_line(p0, p1, width):
    """Rectangle covering a butt-capped stroke from p0 to p1."""
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    ox, oy = -dy / length * width / 2, dx / length * width / 2
    return [
        (x0 + ox, y0 + oy),
        (x1 + ox, y1 + oy),
        (x1 - ox, y1 - oy),
        (x0 - ox, y0 - oy),
    ]


def draw_mark(size, stitch=True):
    """Render the mark at `size` px. Set stitch=False below 32px."""
    px = size * SS
    scale = px / VB
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = lambda v: v * scale  # noqa: E731

    d.rounded_rectangle([0, 0, px - 1, px - 1], radius=s(13), fill=LEATHER)

    if stitch:
        y = 14.0
        while y < 50.0:
            d.line(
                [(s(9.5), s(y)), (s(9.5), s(min(y + 3.2, 50.0)))],
                fill=GOLD,
                width=max(1, int(s(1.6))),
            )
            y += 6.6

    for p0, p1, w in STROKES:
        d.polygon([(s(x), s(y)) for x, y in thick_line(p0, p1, w)], fill=CREAM)

    return img.resize((size, size), Image.LANCZOS)


def write_ico(path, images):
    """Write an ICO containing one embedded PNG per image.

    Pillow's own ICO writer can't do this: it derives every frame by
    downscaling one source image and silently drops requested sizes larger
    than that source. Building the container by hand keeps genuinely
    different artwork per size.
    """
    blobs = []
    for im in images:
        buf = io.BytesIO()
        im.save(buf, format="PNG")
        blobs.append(buf.getvalue())

    out = [struct.pack("<HHH", 0, 1, len(blobs))]  # ICONDIR
    offset = 6 + 16 * len(blobs)
    for im, blob in zip(images, blobs):
        w, h = im.size
        out.append(
            struct.pack(
                "<BBBBHHII",
                w if w < 256 else 0,  # 0 encodes 256
                h if h < 256 else 0,
                0,  # palette size (0 = truecolour)
                0,  # reserved
                1,  # colour planes
                32,  # bits per pixel
                len(blob),
                offset,
            )
        )
        offset += len(blob)
    out.extend(blobs)

    with open(path, "wb") as fh:
        fh.write(b"".join(out))


def main():
    # Apple touch icon needs an opaque background: iOS composites onto white
    # and square-crops, so transparency would show as white corners.
    mark180 = draw_mark(180)
    apple = Image.new("RGBA", (180, 180), LEATHER)
    apple.paste(mark180, (0, 0), mark180)
    apple.convert("RGB").save(os.path.join(OUT_APP, "apple-icon.png"))

    draw_mark(192).save(os.path.join(OUT_PUB, "icon-192.png"))
    draw_mark(512).save(os.path.join(OUT_PUB, "icon-512.png"))

    # Stitch detail is dropped below 32px, where it renders as noise.
    sizes = [16, 24, 32, 48, 64]
    write_ico(
        os.path.join(OUT_APP, "favicon.ico"),
        [draw_mark(n, stitch=(n >= 32)) for n in sizes],
    )

    for rel in [
        "src/app/favicon.ico",
        "src/app/apple-icon.png",
        "public/icon-192.png",
        "public/icon-512.png",
    ]:
        print(f"  {rel:28} {os.path.getsize(os.path.join(ROOT, rel)):>7,} bytes")


if __name__ == "__main__":
    main()
