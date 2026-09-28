"""Mide la curva del planeta (y de la superficie por columna) en cada escenario.
Imprime y guarda assets/papel/ground.json: {escena: {"size":[w,h], "xs":[...], "ys":[...]}} en fracciones."""
import json, numpy as np
from PIL import Image
S = ["e01-madriguera","e02-cabana","e03-faro","e04-edificio","e05-arbol","e06-iglu","e07-castillo","e08-sombrero"]
out = {}
for s in S:
    im = np.asarray(Image.open(f"assets/papel/{s}.png").convert("RGB")).astype(np.float32)
    h, w, _ = im.shape
    xs, ys = [], []
    for fx in np.linspace(0.08, 0.92, 22):
        x = int(fx * w)
        col = im[:, max(0, x-3):x+4].mean(1)
        sky = np.median(col[int(h*0.18):int(h*0.3)], 0)
        d = np.linalg.norm(col - sky, axis=1)
        y = None
        for yy in range(int(h*0.3), int(h*0.8)):
            if (d[yy:yy+10] > 45).all():
                y = yy; break
        xs.append(round(float(fx), 3)); ys.append(round(y / h, 4) if y else None)
    out[s] = {"size": [w, h], "xs": xs, "ys": ys}
    print(s, " ".join(f"{x:.2f}:{(y or 0):.3f}" for x, y in zip(xs, ys)))
json.dump(out, open("assets/papel/ground.json", "w"), indent=1)
