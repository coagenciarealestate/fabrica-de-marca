"""Recorta las poses del conejo de las hojas sobre verde croma.
Uso: python3 scripts/cut-sprites.py   (desde video/dar-el-salto-papel)
Genera assets/papel/rabbit-<n>.png con alfa, recortadas al contenido y a la MISMA escala."""
import numpy as np
from PIL import Image
from collections import deque

def key(path):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    # cuánto "más verde" que el resto: 0 = papel, alto = fondo
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1 - (greenness - 25) / 60, 0, 1)
    # despill: quita el reflejo verde del borde
    g2 = np.minimum(g, np.maximum(r, b) + 4)
    rgb = np.stack([r, g2, b], -1)
    return rgb, alpha

def components(mask, min_px):
    h, w = mask.shape
    seen = np.zeros_like(mask, bool)
    out = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny, nx = cy+dy, cx+dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if len(pts) >= min_px:
                    ys, xs = zip(*pts)
                    out.append((min(ys), min(xs), max(ys), max(xs), pts))
    return out

# orden de salida → nombre de la pose
NAMES = ["r-sit", "r-peek", "r-lookback", "r-crouch", "r-leap", "r-land", "r-back", "r-up"]
n = 0
for sheet in ["c01-poses", "c02-poses"]:
    rgb, a = key(f"assets/papel/{sheet}.png")
    # dilatar la máscara para unir orejas/patas finas al cuerpo
    m = a > 0.5
    md = m.copy()
    for _ in range(6):
        md = md | np.roll(md, 1, 0) | np.roll(md, -1, 0) | np.roll(md, 1, 1) | np.roll(md, -1, 1)
    comps = components(md, 4000)  # los números impresos son pequeños: se descartan
    comps.sort(key=lambda c: (round(c[0] / 300), c[1]))
    for (y0, x0, y1, x1, pts) in comps:
        own = np.zeros_like(md)
        ys, xs = zip(*pts)
        own[list(ys), list(xs)] = True  # solo la figura de este componente (sin números impresos)
        pad = 4
        y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
        y1, x1 = min(a.shape[0], y1 + pad), min(a.shape[1], x1 + pad)
        crop = np.dstack([rgb[y0:y1, x0:x1], a[y0:y1, x0:x1] * own[y0:y1, x0:x1] * 255]).clip(0, 255).astype(np.uint8)
        n += 1
        Image.fromarray(crop, "RGBA").save(f"assets/papel/{NAMES[n - 1]}.png")
        print(sheet, n, "bbox", x0, y0, x1 - x0, y1 - y0)
