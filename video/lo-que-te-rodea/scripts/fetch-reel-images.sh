#!/bin/bash
# Descarga las 20 imágenes del reel "Lo que te rodea cambia" generadas en Higgsfield
# (proyecto "C&O Reel — Lo que te rodea cambia", gpt_image_2_5, 9:8) y las deja
# como assets/reel/NN.jpg, que es lo que referencia compositions/reel.html.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/reel
B=https://d8j0ntlcm91z4.cloudfront.net/user_37xL8uQkAiExL4l53S1OQTuJqcT
while read -r n f; do
  [ -f "assets/reel/$n.jpg" ] && continue
  curl -sSfL -o "assets/reel/$n.png" "$B/$f"
  ffmpeg -loglevel error -y -i "assets/reel/$n.png" -q:v 3 "assets/reel/$n.jpg"
  rm "assets/reel/$n.png"
  echo "ok $n"
done <<'LIST'
00 hf_20260928_002233_89dd8bb1-27a1-4056-8a4b-a881e7180232.png
01 hf_20260928_002233_9909629e-a55a-490f-ac5c-1c6699eebdbd.png
02 hf_20260928_002234_9d648eeb-904e-48cb-8da9-ebed40d76217.png
03 hf_20260928_002234_1d7d90db-d54c-413e-a829-bb0190809fb5.png
04 hf_20260928_002234_a6c980cd-5e93-4835-a293-b3dd82c8c4e0.png
05 hf_20260928_002305_d067a3b2-5954-4e75-9324-2c1ee7bfda58.png
06 hf_20260928_002234_f10ef10d-ac31-4a3e-8692-3aea484dce77.png
07 hf_20260928_002233_8514ee86-e53c-4369-bc5c-92afdb2101de.png
08 hf_20260928_002233_6ee8cc22-3bba-4568-8aab-15b29806bd0c.png
09 hf_20260928_002234_9620a17b-eb20-44f3-b20a-6f18bf93fe84.png
10 hf_20260928_002234_6d50510e-df28-40dd-acd8-6280aeb01297.png
11 hf_20260928_002234_6dfada19-3df2-4a99-b1e0-55b9b4415b7c.png
12 hf_20260928_002305_1d01a987-a57c-4647-ba8e-2066378eb474.png
13 hf_20260928_002305_ca386682-996e-424a-a3cd-46b2f569cddd.png
14 hf_20260928_002305_cbff4ec0-82dd-4821-8df0-473646a610eb.png
15 hf_20260928_002305_81de291e-c1db-411c-9d38-b4aa3d9d193d.png
16 hf_20260928_002305_1ef2e48e-5d6b-4347-ab1a-28d1fabd88f7.png
17 hf_20260928_002305_72e0bcbe-a72a-4693-98b9-02a403454e0c.png
18 hf_20260928_002305_2c3bf97c-511f-4d0f-9012-c121ea628237.png
19 hf_20260928_002305_c07446bb-1809-4e8e-a73f-7250fa9eecfd.png
LIST
