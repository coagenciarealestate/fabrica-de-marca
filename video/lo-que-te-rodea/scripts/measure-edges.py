# Mide el borde de cada imagen v3: la cima (edge, % de la altura) y su curvatura (curve), que es
# k en y = cima + k·(x − 540)², en px de un cuadro de 1080×1920. Copia los valores a build-reel.mjs.
from PIL import Image
import numpy as np, glob, os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "assets", "reel-v3"))

def edge_at(a, x0, x1, H):
    s = a[:, x0:x1].mean(1)
    ref = np.median(s[int(H * .08):int(H * .25)], 0)
    d = np.abs(s - ref).sum(1)
    return next((i for i in range(int(H * .2), H - 3) if (d[i:i + 3] > 40).all()), None)

for f in sorted(glob.glob("2*.jpg")):
    a = np.asarray(Image.open(f).convert("RGB")).astype(float)
    H, W, _ = a.shape
    xs, ys = [], []
    for c in (0.22, 0.34, 0.5, 0.66, 0.78):
        y = edge_at(a, int(W * (c - .04)), int(W * (c + .04)), H)
        if y is not None:
            xs.append(W * c - W / 2); ys.append(y)
    k, _, y0 = np.polyfit(xs, ys, 2)
    print(f"{f[:-4]} edge {100 * edge_at(a, int(W * .42), int(W * .58), H) / H:.1f} curve {max(0.0, k):.6f}")
