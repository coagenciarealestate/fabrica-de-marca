# Mide la cima del borde de cada imagen v3 (% de la altura): primera fila, en la franja central,
# que se aparta del color liso de arriba. Copia los valores a `edge` en build-reel.mjs.
from PIL import Image
import numpy as np, glob, os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "assets", "reel-v3"))
for f in sorted(glob.glob("2*.jpg")):
    a = np.asarray(Image.open(f).convert("RGB")).astype(float)
    H, W, _ = a.shape
    s = a[:, int(W * .42):int(W * .58)].mean(1)
    ref = np.median(s[int(H * .08):int(H * .25)], 0)
    d = np.abs(s - ref).sum(1)
    y = next(i for i in range(int(H * .25), H - 3) if (d[i:i + 3] > 40).all())
    print(f[:-4], round(100 * y / H, 1))
