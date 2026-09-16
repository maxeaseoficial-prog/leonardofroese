from __future__ import annotations

import base64
import io
import re
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

# Order matches the legacy strip currently used by the Leonardo site.
TARGETS = [
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


def load_strip() -> Image.Image:
    source = OUT / "clients-strip.b64.txt"
    if not source.exists():
        raise RuntimeError("Missing temporary legacy logo strip source")
    encoded = re.sub(r"\s+", "", source.read_text(encoding="utf-8"))
    raw = base64.b64decode(encoded, validate=True)
    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    image.load()
    print(f"SOURCE {source}: {image.width}x{image.height} mode={image.mode}")
    return image


def distance(pixel, background) -> float:
    return sum((pixel[i] - background[i]) ** 2 for i in range(3)) ** 0.5


def transparentize_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = []
    for x in range(width):
        border.extend((pixels[x, 0], pixels[x, height - 1]))
    for y in range(height):
        border.extend((pixels[0, y], pixels[width - 1, y]))

    if sum(1 for p in border if p[3] <= 20) / max(1, len(border)) >= 0.60:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(distance(p, background) for p in opaque)
    p90 = deviations[min(len(deviations) - 1, int(len(deviations) * 0.90))]
    neutral_light = max(background) - min(background) <= 42 and min(background) >= 145
    uniform = p90 <= 34

    if not (neutral_light or uniform):
        raise RuntimeError(
            f"Logo slot has no safe removable edge background: bg={background}, p90={p90:.1f}"
        )

    threshold = 80 if neutral_light else 46
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if seen[index]:
            return
        seen[index] = 1
        p = pixels[x, y]
        if p[3] <= 25 or distance(p, background) <= threshold:
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    return rgba


def save_logo(slot: Image.Image, destination: Path) -> None:
    logo = transparentize_edge_background(slot)
    bbox = logo.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels found in {destination.name}")
    logo = logo.crop(bbox)

    pad = max(10, round(max(logo.size) * 0.05))
    canvas = Image.new("RGBA", (logo.width + 2 * pad, logo.height + 2 * pad), (0, 0, 0, 0))
    canvas.alpha_composite(logo, (pad, pad))
    canvas.save(destination, "PNG", optimize=True)

    verify = Image.open(destination).convert("RGBA")
    alpha_min, alpha_max = verify.getchannel("A").getextrema()
    corners = [
        verify.getpixel((0, 0))[3],
        verify.getpixel((verify.width - 1, 0))[3],
        verify.getpixel((0, verify.height - 1))[3],
        verify.getpixel((verify.width - 1, verify.height - 1))[3],
    ]
    if alpha_min != 0 or alpha_max == 0 or any(corners):
        raise RuntimeError(
            f"Transparency validation failed for {destination.name}: "
            f"alpha={alpha_min}-{alpha_max}, corners={corners}"
        )
    print(
        f"ASSET {destination.name}: {verify.width}x{verify.height} "
        f"alpha={alpha_min}-{alpha_max} corners={corners}"
    )


def write_component() -> None:
    items = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug in TARGETS
    )
    content = f'''import "./client-logos.css";

const clientLogos = [
{items}
] as const;

function LogoGroup({{ clone = false }}: {{ clone?: boolean }}) {{
  return (
    <div
      className="client-logos-group"
      aria-hidden={{clone || undefined}}
      data-clone={{clone ? "true" : undefined}}
    >
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


def write_css() -> None:
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
  padding-inline: 20px;
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
  .client-logos-group { width: 100%; flex-wrap: wrap; justify-content: center; gap: 28px 38px; padding-right: 0; }
  .client-logos-group[data-clone="true"] { display: none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(content, encoding="utf-8")


strip = load_strip()
count = len(TARGETS)
if strip.width % count != 0:
    raise RuntimeError(f"Strip width {strip.width} is not divisible by {count} logos")
slot_width = strip.width // count
if slot_width < 80 or strip.height < 40:
    raise RuntimeError(f"Unexpected strip dimensions: {strip.width}x{strip.height}")
print(f"SPLIT {strip.width}x{strip.height}: {count} slots of {slot_width}x{strip.height}")

expected = set()
for index, (name, slug) in enumerate(TARGETS):
    slot = strip.crop((index * slot_width, 0, (index + 1) * slot_width, strip.height))
    destination = OUT / f"{slug}.png"
    save_logo(slot, destination)
    expected.add(destination.name)
    print(f"DONE {index + 1:02d}/{count}: {name} -> {destination.relative_to(ROOT)}")

for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

write_component()
write_css()

for obsolete in (
    ROOT / "src/assets/client-logo-transparent-webp-base64.ts",
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
):
    if obsolete.exists():
        obsolete.unlink()
chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

print(f"Generated {count} independent local PNG logo assets with real alpha transparency.")
