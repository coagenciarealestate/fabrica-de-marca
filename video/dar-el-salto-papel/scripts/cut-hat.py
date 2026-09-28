"""Recorta el FRENTE del sombrero de e08 (ala delantera + copa) con alfa, para que el conejo
pase por detrás y parezca entrar. Guarda assets/papel/hat-front.png y su caja en fracciones."""
import json, numpy as np
from PIL import Image
im = np.asarray(Image.open("assets/papel/e08-sombrero.png").convert("RGB")).astype(np.float32)
H, W, _ = im.shape
x0, x1, y0, y1 = 280, 490, 612, 752   # desde la línea central del ala hacia abajo
c = im[y0:y1, x0:x1]
r, g, b = c[..., 0], c[..., 1], c[..., 2]
luma = 0.3 * r + 0.59 * g + 0.11 * b
black = (luma < 62) & (b < 70)                          # fieltro negro (el cielo es azul)
ochre = (r > 150) & (g > 100) & (b < 120) & (r - b > 60)  # la cinta
a = (black | ochre).astype(np.float32)
# suaviza el borde 1px
a = (a + np.roll(a, 1, 0) + np.roll(a, -1, 0) + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 5
out = np.dstack([c, a * 255]).clip(0, 255).astype(np.uint8)
Image.fromarray(out, "RGBA").save("assets/papel/hat-front.png")
box = {"x": x0 / W, "y": y0 / H, "w": (x1 - x0) / W, "h": (y1 - y0) / H, "mouth_x": 384 / W, "mouth_y": 612 / H}
json.dump(box, open("assets/papel/hat-front.json", "w"), indent=1)
print(box)
