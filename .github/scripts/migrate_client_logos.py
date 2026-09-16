from __future__ import annotations

import io
import re
import shutil
import time
import unicodedata
from collections import deque
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)
REFERENCE_URL = "https://calibergestao.com.br/"
MIN_LOGOS = 9

CLIENTS = [
    ("Claro", "claro", ["claro"]),
    ("NET", "net", ["net"]),
    ("Megasom", "megasom", ["megasom", "logo megasom sem fundo"]),
    ("Leo Madeiras", "leo-madeiras", ["leo madeiras"]),
    ("Procria", "procria", ["procria"]),
    ("LEGO", "lego", ["lego"]),
    ("Maxvinil", "maxvinil", ["maxvinil"]),
    ("Tupperware", "tupperware", ["tupperware"]),
    ("Águas de Sorriso", "aguas-de-sorriso", ["aguas de sorriso"]),
    ("Aliança", "alianca", ["alianca", "aliança"]),
    ("Campo Solar", "campo-solar", ["campo solar"]),
    ("Cobertura Imasa", "cobertura-imasa", ["cobertura imasa"]),
    ("Eletricidade Paraense", "eletricidade-paraense", ["eletricidade paraense"]),
    ("Fatex", "fatex", ["fatex"]),
    ("Frota", "frota", ["frota"]),
    ("Octech", "octech", ["octech"]),
    ("Pantanal", "pantanal", ["pantanal"]),
    ("Tempermat", "tempermat", ["tempermat"]),
    ("Prime Lente", "prime-lente", ["prime lente", "prime lente gradual", "prime-lente-logo-gradual"]),
    ("Trevo", "trevo", ["trevo"]),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Referer": REFERENCE_URL,
}


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value).strip().lower()
    return re.sub(r"\s+", " ", value)


def image_urls(img) -> list[str]:
    urls: list[str] = []
    for attr in ("data-lazy-src", "data-src", "data-original", "data-orig-file", "data-full-url", "src"):
        value = img.get(attr)
        if value and not value.startswith("data:"):
            urls.append(urljoin(REFERENCE_URL, value))
    for attr in ("data-srcset", "srcset"):
        value = img.get(attr)
        if not value:
            continue
        for part in value.split(","):
            candidate = part.strip().split()[0] if part.strip() else ""
            if candidate and not candidate.startswith("data:"):
                urls.append(urljoin(REFERENCE_URL, candidate))
    return list(dict.fromkeys(urls))


def discover_sources() -> dict[str, list[str]]:
    page_headers = dict(HEADERS)
    page_headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    response = requests.get(REFERENCE_URL, headers=page_headers, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    images = soup.find_all("img")
    print(f"REFERENCE PAGE status={response.status_code} bytes={len(response.content)} images={len(images)}")
    result: dict[str, list[str]] = {}
    for display, slug, aliases in CLIENTS:
        aliases_n = [norm(alias) for alias in aliases]
        ranked: list[tuple[int, list[str]]] = []
        for img in images:
            fields = [
                norm(img.get("alt", "")), norm(img.get("title", "")),
                norm(" ".join(img.get("class", []))),
                norm(" ".join(str(img.get(a, "")) for a in ("src", "data-src", "data-lazy-src", "srcset", "data-srcset"))),
            ]
            score = 0
            for alias in aliases_n:
                for field in fields:
                    if field == alias: score = max(score, 100)
                    elif alias and alias in field: score = max(score, 80)
                    elif alias and all(token in field for token in alias.split()): score = max(score, 60)
            urls = image_urls(img)
            if score and urls: ranked.append((score, urls))
        if ranked:
            ranked.sort(key=lambda item: item[0], reverse=True)
            urls: list[str] = []
            for _score, group in ranked: urls.extend(group)
            result[slug] = list(dict.fromkeys(urls))
            print(f"DISCOVERED {display}: {len(result[slug])} candidate URL(s); top={result[slug][0]}")
    return result


def add_query(url: str, params: dict[str, str]) -> str:
    parsed = urlparse(url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    for key, value in params.items(): query[key] = [value]
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def expand_url(url: str) -> list[str]:
    urls = [url]
    parsed = urlparse(url)
    host, path = parsed.netloc.lower(), parsed.path
    if host in {"i0.wp.com", "i1.wp.com", "i2.wp.com", "i3.wp.com"} and path.startswith("/calibergestao.com.br/"):
        relative = path[len("/calibergestao.com.br"):]
        urls.append(f"https://calibergestao.com.br{relative}")
        query = parse_qs(parsed.query)
        fit = query.get("fit", [""])[0]
        dims = re.split(r"[,x]", fit) if fit else []
        width = dims[0] if dims and dims[0].isdigit() else ""
        height = dims[1] if len(dims) > 1 and dims[1].isdigit() else ""
        for wp_host in ("i0.wp.com", "i1.wp.com", "i2.wp.com", "i3.wp.com"):
            base = f"https://{wp_host}/calibergestao.com.br{relative}"
            urls.append(add_query(base, {"ssl":"1"}))
            if fit: urls.append(add_query(base, {"fit":fit,"ssl":"1"}))
            if width: urls.append(add_query(base, {"w":width,"ssl":"1"}))
            if width and height: urls.append(add_query(base, {"resize":f"{width},{height}","ssl":"1"}))
    return list(dict.fromkeys(urls))


def fetch_image(session: requests.Session, urls: list[str], label: str) -> tuple[bytes, str] | None:
    candidates: list[str] = []
    for url in urls: candidates.extend(expand_url(url))
    candidates = list(dict.fromkeys(candidates))
    user_agents = [
        HEADERS["User-Agent"],
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
    ]
    for round_no in range(1, 3):
        for index, candidate in enumerate(candidates):
            try:
                headers = dict(HEADERS)
                headers["User-Agent"] = user_agents[(round_no + index) % len(user_agents)]
                if round_no > 1: headers["Cache-Control"] = "no-cache"
                response = session.get(candidate, headers=headers, timeout=8, allow_redirects=True)
                if response.status_code != 200 or len(response.content) < 100: continue
                if "text/html" in response.headers.get("content-type", "").lower(): continue
                probe = Image.open(io.BytesIO(response.content)); probe.verify()
                print(f"FETCH OK {label}: round={round_no} bytes={len(response.content)} url={candidate}")
                return response.content, candidate
            except Exception:
                continue
        print(f"RETRY ROUND {round_no} exhausted for {label} ({len(candidates)} candidates)")
        time.sleep(0.6 * round_no)
    return None


def color_distance(a, b) -> float:
    return ((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2) ** 0.5


def transparentize_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA"); width, height = rgba.size; px = rgba.load()
    border = [px[x,y] for x in range(width) for y in (0,height-1)] + [px[x,y] for y in range(height) for x in (0,width-1)]
    if min(p[3] for p in border) < 250: return rgba
    channels = list(zip(*[(p[0],p[1],p[2]) for p in border]))
    bg = tuple(sorted(c)[len(c)//2] for c in channels)
    deviations = sorted(color_distance(p,bg) for p in border); p90 = deviations[int((len(deviations)-1)*.90)]
    neutral_light = max(bg)-min(bg) <= 50 and min(bg) >= 115; uniform = p90 <= 32
    if not (neutral_light or uniform): return rgba
    threshold = 78 if neutral_light else 46; seen = bytearray(width*height); queue: deque[tuple[int,int]] = deque()
    def add(x:int,y:int)->None:
        idx=y*width+x
        if seen[idx]: return
        seen[idx]=1; r,g,b,a=px[x,y]
        if a<=25 or color_distance((r,g,b),bg)<=threshold: queue.append((x,y))
    for x in range(width): add(x,0); add(x,height-1)
    for y in range(height): add(0,y); add(width-1,y)
    while queue:
        x,y=queue.popleft(); r,g,b,_=px[x,y]; px[x,y]=(r,g,b,0)
        if x: add(x-1,y)
        if x+1<width: add(x+1,y)
        if y: add(x,y-1)
        if y+1<height: add(x,y+1)
    return rgba


def process_asset(raw: bytes, destination: Path, label: str) -> None:
    source=Image.open(io.BytesIO(raw)); source.load(); image=transparentize_edge_background(source)
    alpha=image.getchannel("A"); amin,amax=alpha.getextrema()
    if amax==0 or amin==255: raise RuntimeError(f"{label}: no safe true transparency")
    bbox=alpha.point(lambda a:255 if a>=12 else 0).getbbox()
    if not bbox: raise RuntimeError(f"{label}: no visible pixels")
    image=image.crop(bbox); pad=max(10,round(max(image.size)*.06))
    canvas=Image.new("RGBA",(image.width+2*pad,image.height+2*pad),(0,0,0,0)); canvas.alpha_composite(image,(pad,pad)); canvas.save(destination,"PNG",optimize=True)
    verify=Image.open(destination).convert("RGBA"); va0,va1=verify.getchannel("A").getextrema(); corners=[verify.getpixel((0,0))[3],verify.getpixel((verify.width-1,0))[3],verify.getpixel((0,verify.height-1))[3],verify.getpixel((verify.width-1,verify.height-1))[3]]
    if va0!=0 or va1==0 or any(corners): raise RuntimeError(f"{label}: final alpha validation failed")
    print(f"ASSET OK {label}: source={source.format} {source.width}x{source.height}; final={verify.width}x{verify.height}; alpha={va0}-{va1}")


def write_component(successes: list[tuple[str,str]]) -> None:
    rows="\n".join(f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},' for name,slug in successes)
    (ROOT/"src/components/site/client-logos.tsx").write_text(f'''import "./client-logos.css";

const clientLogos = [
{rows}
] as const;

function LogoGroup({{ clone = false }}: {{ clone?: boolean }}) {{
  return <div className="client-logos-group" aria-hidden={{clone || undefined}} data-clone={{clone ? "true" : undefined}}>{{clientLogos.map((logo) => <div className="client-logo-item" key={{`${{clone ? "clone-" : ""}}${{logo.name}}`}}><img src={{logo.src}} alt={{clone ? "" : logo.name}} aria-hidden={{clone || undefined}} decoding="async" draggable={{false}} /></div>)}}</div>;
}}

export function ClientLogos({{ className = "" }}: {{ className?: string }}) {{
  return <section className={{`client-logos ${{className}}`}} aria-label="Parceiros e clientes da Cáliber"><div className="client-logos-heading"><span>Algumas das empresas que confiam no nosso trabalho</span><h3>Parceiros &amp; Clientes</h3></div><div className="client-logos-viewport"><div className="client-logos-track"><LogoGroup /><LogoGroup clone /></div></div></section>;
}}
''',encoding="utf-8")


def write_css() -> None:
    (ROOT/"src/components/site/client-logos.css").write_text('''.client-logos{position:relative;width:100%;max-width:100%;min-width:0;overflow:hidden;background:transparent}.client-logos-heading{display:flex;flex-direction:column;align-items:center;padding:0 20px;text-align:center}.client-logos-heading>span{color:hsl(var(--primary));font-size:11px;font-weight:650;letter-spacing:.22em;line-height:1.55;text-transform:uppercase}.client-logos-heading h3{max-width:760px;margin:14px 0 0;color:hsl(var(--foreground));font-size:clamp(34px,4vw,56px);font-weight:750;letter-spacing:-.035em;line-height:1;text-wrap:balance}.client-logos-viewport{position:relative;width:100%;max-width:100%;min-width:0;margin-top:38px;overflow:hidden;background:transparent;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}.client-logos-track{display:flex;width:max-content;max-width:none;align-items:center;animation:client-logos-marquee 46s linear infinite;will-change:transform}.client-logos-group{display:flex;flex:0 0 auto;align-items:center;gap:clamp(42px,4.5vw,76px);padding-right:clamp(42px,4.5vw,76px)}.client-logo-item{display:flex;width:clamp(120px,12vw,176px);height:78px;flex:0 0 auto;align-items:center;justify-content:center;background:transparent}.client-logo-item img{display:block;width:auto;max-width:100%;height:auto;max-height:70px;object-fit:contain;background:transparent;user-select:none}@keyframes client-logos-marquee{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}@media(hover:hover) and (pointer:fine){.client-logos-viewport:hover .client-logos-track{animation-play-state:paused}}@media(max-width:720px){.client-logos-heading{padding-inline:14px}.client-logos-heading>span{max-width:330px;font-size:9px;letter-spacing:.16em}.client-logos-heading h3{max-width:340px;margin-top:12px;font-size:clamp(32px,10vw,42px)}.client-logos-viewport{margin-top:28px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent);mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)}.client-logos-track{animation-duration:40s}.client-logos-group{gap:30px;padding-right:30px}.client-logo-item{width:112px;height:62px}.client-logo-item img{max-height:54px}}@media(prefers-reduced-motion:reduce){.client-logos-viewport{-webkit-mask-image:none;mask-image:none}.client-logos-track{width:100%;max-width:100%;animation:none;transform:none;will-change:auto}.client-logos-group{width:100%;flex-wrap:wrap;justify-content:center;gap:28px 38px;padding-right:0}.client-logos-group[data-clone="true"]{display:none}}''',encoding="utf-8")


def cleanup(selected:set[str])->None:
    for path in OUT.glob("*.png"):
        if path.stem not in selected: path.unlink()
    for path in [ROOT/"src/assets/client-logo-transparent-webp-base64.ts",ROOT/"src/components/site/client-logos-local.ts",ROOT/"src/components/site/client-logos-strip-placeholder.txt"]:
        if path.exists(): path.unlink()
    chunks=ROOT/"src/assets/client-logo-strip"
    if chunks.exists(): shutil.rmtree(chunks)


sources=discover_sources(); session=requests.Session(); successes:list[tuple[str,str]]=[]
for display,slug,_aliases in CLIENTS:
    urls=sources.get(slug,[])
    if not urls: continue
    fetched=fetch_image(session,urls,display)
    if not fetched:
        print(f"SKIP unavailable source: {display}"); continue
    raw,_source_url=fetched
    try:
        process_asset(raw,OUT/f"{slug}.png",display); successes.append((display,slug))
    except Exception as exc: print(f"SKIP unsafe asset {display}: {exc}")
if len(successes)<MIN_LOGOS: raise RuntimeError(f"Only {len(successes)} valid real logos recovered; need at least {MIN_LOGOS}")
write_component(successes); write_css(); cleanup({slug for _name,slug in successes})
print(f"SUCCESS: {len(successes)} independent real local transparent logos implemented: {[name for name,_ in successes]}")
