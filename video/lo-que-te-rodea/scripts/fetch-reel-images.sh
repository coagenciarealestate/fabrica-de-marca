#!/bin/bash
# Descarga las 22 imágenes v3 del reel "Lo que te rodea cambia" (Higgsfield, 9:16; prompts en
# PROMPTS-v3.md) como assets/reel-v3/NNN.jpg a 1080×1920, que es lo que usa compositions/reel.html.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/reel-v3
B=https://d8j0ntlcm91z4.cloudfront.net/user_37xL8uQkAiExL4l53S1OQTuJqcT
while read -r n f; do
  [ -f "assets/reel-v3/$n.jpg" ] && continue
  curl -sSfL </dev/null -o "assets/reel-v3/$n.png" "$B/$f"
  ffmpeg -nostdin -loglevel error -y -i "assets/reel-v3/$n.png" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -q:v 3 "assets/reel-v3/$n.jpg"
  rm "assets/reel-v3/$n.png"
  echo "ok $n"
done <<'LIST'
203 hf_20260928_043539_6090e6f5-2239-42ef-98d4-0b6990261751.png
204 hf_20260928_043539_d3a4d8d4-99e4-4754-a8d5-8a6893759ac2.png
205 hf_20260928_043539_e4d0ead8-61ef-4996-a687-a4317507bc7e.png
207 hf_20260928_043539_3a057fa9-2f86-447b-85aa-9611b2ff7c87.png
211 hf_20260928_043541_55aea414-1e50-4b08-ba51-d72073f8296b.png
200 hf_20260928_051721_a7ba9d98-db9a-41aa-a6aa-0d1a89681ede.png
201 hf_20260928_051749_b7bbeabb-d33c-4248-977f-dd204f4adc4f.png
202 hf_20260928_051825_d32919bc-f65f-43f8-b667-f0a445468c43.png
206 hf_20260928_051850_678596bf-1fc1-4415-b25b-12d11239fec8.png
208 hf_20260928_051909_6ead41c6-96a6-47b6-a463-7f14053cedbf.png
209 hf_20260928_052040_ae3a76af-ae32-4da4-aef0-2041d7beffde.png
210 hf_20260928_052049_985af95e-5816-41b9-b9ff-5f45edbb1767.png
212 hf_20260928_052101_269f5dd7-d94f-44e9-8bcc-c49109d6f6a3.png
213 hf_20260928_052114_812e0629-7286-4a1c-82e2-d56193f89ba5.png
214 hf_20260928_052322_8d3243bf-70bf-4265-b228-61be1056fe9d.png
215 hf_20260928_052335_1421207a-ae94-45d7-b2f7-d92c77751aa2.png
216 hf_20260928_052354_0c712ba5-a1b5-4173-84ac-251e95158962.png
217 hf_20260928_052403_4a54ce5f-aa36-4e95-8050-d536e24887cf.png
218 hf_20260928_052536_47dfd8dd-35ef-4e14-90c5-710783003c02.png
219 hf_20260928_052547_c4790dc0-f0fb-4a6f-94d6-08bb6d1ae134.png
220 hf_20260928_052557_2a0810e9-758c-44ee-98fd-ac192b21b1e6.png
221 hf_20260928_052615_b70df8cf-2e9e-444f-b0ab-6534027c10d5.png
LIST
node scripts/build-reel.mjs  # re-mide el tono del texto con las imágenes reales
