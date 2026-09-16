from __future__ import annotations

import base64
import io
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

LOGOS = [
    ("Frota", "frota"),
    ("Octech", "octech"),
    ("Pantanal", "pantanal"),
    ("Tempermat", "tempermat"),
    ("Prime Lente", "prime-lente"),
    ("Trevo", "trevo"),
    ("Claro", "claro"),
    ("NET", "net"),
    ("Megasom", "megasom"),
]
SOURCE = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"


def distance(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def clear_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    border = [px[x, y] for x in range(w) for y in (0, h - 1)]
    border += [px[x, y] for y in range(h) for x in (0, w - 1)]

    if sum(p[3] <= 20 for p in border) / max(1, len(border)) >= 0.55:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    bg = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(distance(p, bg) for p in opaque)
    p90 = deviations[int((len(deviations) - 1) * 0.90)]
    neutral_light = max(bg) - min(bg) <= 42 and min(bg) >= 135
    uniform = p90 <= 26
    if not (neutral_light or uniform):
        return rgba

    tolerance = 72 if neutral_light else 42
    seen = bytearray(w * h)
    queue = deque()

    def add(x, y):
        i = y * w + x
        if seen[i]:
            return
        seen[i] = 1
        p = px[x, y]
        if p[3] <= 25 or distance(p, bg) <= tolerance:
            queue.append((x, y))

    for x in range(w):
        add(x, 0)
        add(x, h - 1)
    for y in range(h):
        add(0, y)
        add(w - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        if x:
            add(x - 1, y)
        if x + 1 < w:
            add(x + 1, y)
        if y:
            add(x, y - 1)
        if y + 1 < h:
            add(x, y + 1)

    return rgba


def load_strip() -> Image.Image:
    text = SOURCE.read_text(encoding="utf-8")
    token = "clientLogoTransparentWebpBase64"
    pos = text.find(token)
    if pos < 0:
        raise RuntimeError("Legacy logo constant not found")
    start = text.find('"', pos)
    end = text.find('";', start + 1)
    if start < 0 or end < 0:
        raise RuntimeError(f"Legacy base64 delimiters not found. prefix={text[:120]!r}")

    encoded = "".join(text[start + 1:end].split())
    encoded += "=" * ((4 - len(encoded) % 4) % 4)
    raw = base64.b64decode(encoded, validate=False)
    if raw[:4] != b"RIFF" or raw[8:12] != b"WEBP":
        raise RuntimeError(f"Legacy payload is not WebP: {raw[:12]!r}")

    declared = int.from_bytes(raw[4:8], "little") + 8
    if len(raw) < declared:
        raise RuntimeError(f"Incomplete WebP: decoded={len(raw)} declared={declared}")
    raw = raw[:declared]

    strip = Image.open(io.BytesIO(raw)).convert("RGBA")
    strip.load()
    if strip.width < len(LOGOS) * 40 or strip.height < 20:
        raise RuntimeError(f"Unexpected strip dimensions: {strip.width}x{strip.height}")
    print(f"LEGACY STRIP {strip.width}x{strip.height} RGBA")
    return strip


def validate_png(path: Path):
    image = Image.open(path).convert("RGBA")
    image.load()
    amin, amax = image.getchannel("A").getextrema()
    corners = [
        image.getpixel((0, 0))[3],
        image.getpixel((image.width - 1, 0))[3],
        image.getpixel((0, image.height - 1))[3],
        image.getpixel((image.width - 1, image.height - 1))[3],
    ]
    if image.width <= 0 or image.height <= 0 or amin != 0 or amax == 0 or any(corners):
        raise RuntimeError(
            f"Invalid alpha asset {path.name}: {image.size} alpha={amin}-{amax} corners={corners}"
        )
    print(f"ASSET {path.name}: {image.width}x{image.height} alpha={amin}-{amax} corners={corners}")


def extract():
    strip = load_strip()
    n = len(LOGOS)
    edges = [round(i * strip.width / n) for i in range(n + 1)]
    print("CELLS", [edges[i + 1] - edges[i] for i in range(n)])

    for i, (name, slug) in enumerate(LOGOS):
        cell = strip.crop((edges[i], 0, edges[i + 1], strip.height))
        cell = clear_edge_background(cell)
        alpha = cell.getchannel("A").point(lambda a: 255 if a >= 12 else 0)
        bbox = alpha.getbbox()
        if not bbox:
            raise RuntimeError(f"No visible pixels for {name}")
        cell = cell.crop(bbox)
        pad = max(10, round(max(cell.size) * 0.06))
        final = Image.new("RGBA", (cell.width + 2 * pad, cell.height + 2 * pad), (0, 0, 0, 0))
        final.alpha_composite(cell, (pad, pad))
        path = OUT / f"{slug}.png"
        final.save(path, "PNG", optimize=True)
        validate_png(path)


def existing_assets_valid():
    try:
        for _name, slug in LOGOS:
            validate_png(OUT / f"{slug}.png")
        return True
    except Exception:
        return False


def write_component():
    items = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug in LOGOS
    )
    content = f'''import "./client-logos.css";

const clientLogos = [
{items}
] as const;

function LogoGroup({{ clone = false }}: {{ clone?: boolean }}) {{
  return (
    <div className="client-logos-group" aria-hidden={{clone || undefined}} data-clone={{clone ? "true" : undefined}}>
      {{clientLogos.map((logo) => (
        <div className="client-logo-item" key={{`${{clone ? "clone-" : ""}}${{logo.src}}`}}>
          <img
            src={{logo.src}}
            alt={{clone ? "" : logo.name}}
            aria-hidden={{clone || undefined}}
            decoding="async"
            draggable={{false}}
          />
        </div>
      ))}}
    </div>
  );
}}

export function ClientLogos({{ className = "" }}: {{ className?: string }}) {{
  return (
    <section className={{`client-logos ${{className}}`}} aria-label="Parceiros e clientes da Cáliber">
      <div className="client-logos-heading">
        <span>Algumas das empresas que confiam no nosso trabalho</span>
        <h3>Parceiros &amp; Clientes</h3>
      </div>
      <div className="client-logos-viewport">
        <div className="client-logos-track">
          <LogoGroup />
          <LogoGroup clone />
        </div>
      </div>
    </section>
  );
}}
'''
    (ROOT / "src/components/site/client-logos.tsx").write_text(content, encoding="utf-8")


def write_css():
    content = r'''.client-logos {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  background: transparent;
}

.client-logos-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  text-align: center;
}

.client-logos-heading > span {
  color: hsl(var(--primary));
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .22em;
  line-height: 1.55;
  text-transform: uppercase;
}

.client-logos-heading h3 {
  max-width: 760px;
  margin: 14px 0 0;
  color: hsl(var(--foreground));
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 750;
  letter-spacing: -.035em;
  line-height: 1;
  text-wrap: balance;
}

.client-logos-viewport {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 38px;
  overflow: hidden;
  background: transparent;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}

.client-logos-track {
  display: flex;
  width: max-content;
  align-items: center;
  animation: client-logos-marquee 42s linear infinite;
  will-change: transform;
}

.client-logos-group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: clamp(42px, 4.5vw, 76px);
  padding-right: clamp(42px, 4.5vw, 76px);
}

.client-logo-item {
  display: flex;
  width: clamp(120px, 12vw, 176px);
  height: 78px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.client-logo-item img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 70px;
  object-fit: contain;
  background: transparent;
  user-select: none;
}

@keyframes client-logos-marquee {
  from { transform: translate3d(-50%, 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}

@media (hover: hover) and (pointer: fine) {
  .client-logos-viewport:hover .client-logos-track { animation-play-state: paused; }
}

@media (max-width: 720px) {
  .client-logos-heading { padding-inline: 14px; }
  .client-logos-heading > span { max-width: 330px; font-size: 9px; letter-spacing: .16em; }
  .client-logos-heading h3 { max-width: 340px; margin-top: 12px; font-size: clamp(32px, 10vw, 42px); }
  .client-logos-viewport {
    margin-top: 28px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
  }
  .client-logos-track { animation-duration: 36s; }
  .client-logos-group { gap: 30px; padding-right: 30px; }
  .client-logo-item { width: 112px; height: 62px; }
  .client-logo-item img { max-height: 54px; }
}

@media (prefers-reduced-motion: reduce) {
  .client-logos-viewport { -webkit-mask-image: none; mask-image: none; }
  .client-logos-track { width: 100%; animation: none; transform: none; will-change: auto; }
  .client-logos-group {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 28px 38px;
    padding-right: 0;
  }
  .client-logos-group[data-clone="true"] { display: none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(content, encoding="utf-8")


if SOURCE.exists():
    extract()
elif not existing_assets_valid():
    raise RuntimeError("Legacy strip is gone and the nine final transparent assets are incomplete")
else:
    print("Existing local logo assets validated.")

write_component()
write_css()

expected = {f"{slug}.png" for _name, slug in LOGOS}
for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

for path in [
    SOURCE,
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
]:
    if path.exists():
        path.unlink()

chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

for _name, slug in LOGOS:
    validate_png(OUT / f"{slug}.png")

print("Generated 9 independent transparent local client logos.")
