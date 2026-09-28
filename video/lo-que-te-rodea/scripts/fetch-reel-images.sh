#!/bin/bash
# Descarga las 22 imágenes del reel "Lo que te rodea cambia" generadas en Higgsfield
# (proyecto "C&O Reel — Lo que te rodea cambia", gpt_image_2_5, 9:16, calidad medium) y las deja
# como assets/reel/NN.jpg, que es lo que referencia compositions/reel.html.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/reel
B=https://d8j0ntlcm91z4.cloudfront.net/user_37xL8uQkAiExL4l53S1OQTuJqcT
while read -r n f; do
  [ -f "assets/reel/$n.jpg" ] && continue
  curl -sSfL </dev/null -o "assets/reel/$n.png" "$B/$f"
  ffmpeg -nostdin -loglevel error -y -i "assets/reel/$n.png" -q:v 3 "assets/reel/$n.jpg"
  rm "assets/reel/$n.png"
  echo "ok $n"
done <<'LIST'
100 hf_20260928_003851_948208f4-d973-4ea2-8ac5-6a8060b64812.png
101 hf_20260928_003851_fc9e702f-9a25-4d41-bf2f-eee8e4f66d4e.png
102 hf_20260928_003851_c0e9b7ea-055a-4fe2-bcbd-409e5214723d.png
103 hf_20260928_003851_739a53c4-cb31-4db8-a9f2-fc76d2fae9c7.png
104 hf_20260928_003851_9e3f71f2-89a5-4d2d-8188-93d5de8c2064.png
105 hf_20260928_003851_80bf91aa-e148-4157-b1e9-abea5bc5736a.png
106 hf_20260928_003851_c2a751dc-6b06-4b01-a62e-e688feae7ca0.png
107 hf_20260928_003851_5b4c353a-7cfe-4a0b-8db4-e56b393f1e91.png
108 hf_20260928_003851_a0b4bda9-740c-42f6-8b07-dd53e81ea12a.png
109 hf_20260928_003851_192304ac-b11e-41e2-aef3-b1416c2d06fd.png
110 hf_20260928_003851_0d1b5d3c-830b-4cdb-aa8b-b5b6496fa53b.png
111 hf_20260928_003937_ef4fe88e-cd65-4f14-9626-ea3ffaba655e.png
112 hf_20260928_003936_19bc4f4e-e79a-4b8f-ae99-29f357bc250b.png
113 hf_20260928_003936_3fd1e2ce-3b58-4872-94d4-05d42a03f708.png
114 hf_20260928_003937_1f7ad34d-499a-4450-9b27-66a42c3e07ba.png
115 hf_20260928_003937_25736c72-8cde-4719-adc5-17f9502a7ffe.png
116 hf_20260928_003937_466a0260-d613-4be5-a21a-1c9160efb682.png
117 hf_20260928_003937_4f52f05f-efd8-4994-81a4-c1599c642002.png
118 hf_20260928_003936_e7a7264a-86da-4c9c-b915-aa67830962cd.png
119 hf_20260928_003937_f355c73f-a5b1-4aa7-9ef4-77d28f642aca.png
120 hf_20260928_003937_8d860576-4bd4-4f9c-a1d7-1b234c1db1e9.png
121 hf_20260928_003937_5b5ab599-36c1-4ac9-9d5a-554a8bb69d02.png
LIST
node scripts/build-reel.mjs  # re-mide el tono del texto con las imágenes reales
