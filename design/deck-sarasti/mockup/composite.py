import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

scene_path, screen_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
scene = Image.open(scene_path).convert('RGB')
screen = Image.open(screen_path).convert('RGB')

TL, TR, BR, BL = [np.array(p, float) for p in [(612, 491), (1323, 363), (1440, 867), (727, 1029)]]


def P(u, v):
    top = TL + (TR - TL) * u
    bot = BL + (BR - BL) * u
    return top + (bot - top) * v


# display area inside the bezel
u0, u1, v0, v1 = 0.010, 0.990, 0.014, 0.962
dst = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]
W, H = screen.size
src = [(0, 0), (W, 0), (W, H), (0, H)]


def coeffs(dst_pts, src_pts):
    # maps output (scene) coordinates -> input (screen) coordinates
    A, b = [], []
    for (x, y), (X, Y) in zip(dst_pts, src_pts):
        A.append([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.append(X)
        A.append([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.append(Y)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


SS = 2  # supersample for clean edges
big_size = (scene.width * SS, scene.height * SS)
dst_big = [(x * SS, y * SS) for x, y in dst]
warped = screen.transform(big_size, Image.PERSPECTIVE, coeffs(dst_big, src), Image.BICUBIC)
mask = Image.new('L', big_size, 0)
ImageDraw.Draw(mask).polygon(dst_big, fill=255)
warped = warped.resize(scene.size, Image.LANCZOS)
mask = mask.resize(scene.size, Image.LANCZOS)

out = scene.copy()
out.paste(warped, (0, 0), mask)

# subtle diagonal glass glare
glare = Image.new('L', scene.size, 0)
g = np.zeros((scene.height, scene.width), float)
yy, xx = np.mgrid[0:scene.height, 0:scene.width]
band = (xx - 612) * 0.55 - (yy - 491)
g = np.clip(1 - np.abs(band - 120) / 260, 0, 1) * 0.07
glare = Image.fromarray((g * 255).astype(np.uint8))
glare_mask = Image.fromarray((np.asarray(mask).astype(float) / 255 * np.asarray(glare)).astype(np.uint8))
out.paste(Image.new('RGB', scene.size, (255, 255, 255)), (0, 0), glare_mask)

out.save(out_path)
print(out.size)
