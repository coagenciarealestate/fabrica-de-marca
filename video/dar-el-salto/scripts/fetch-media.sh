#!/bin/bash
# Descarga las imágenes y clips del reel "Dar el salto" generados en Higgsfield
# (proyecto "C&O Reel — Lo que te rodea cambia"). Deja assets/salto/<id>.jpg|mp4.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/salto
B=https://d8j0ntlcm91z4.cloudfront.net/user_37xL8uQkAiExL4l53S1OQTuJqcT
while read -r n f; do
  ext="${f##*.}"; out="assets/salto/$n.$([ "$ext" = png ] && echo jpg || echo "$ext")"
  [ -f "$out" ] && continue
  curl -sSfL </dev/null -o "assets/salto/$n.$ext" "$B/$f"
  if [ "$ext" = png ]; then
    ffmpeg -nostdin -loglevel error -y -i "assets/salto/$n.png" -q:v 2 "$out" && rm "assets/salto/$n.png"
  fi
  echo "ok $out"
done <<'LIST'
rabbit hf_20260928_023001_6b45a0e6-577c-4398-a169-523f4450ed3b.png
201 hf_20260928_023142_2ea9c9cc-ecc9-4419-9529-2611e522d393.png
202 hf_20260928_023114_ff88b438-5adf-4fbf-aef9-3c634d123632.png
203 hf_20260928_023114_9924e996-d770-4855-a332-47de6dff26c2.png
204 hf_20260928_023115_944b47d6-6836-4783-9a1a-9b96d27aec65.png
205 hf_20260928_023114_1f7752ff-dd44-4a5e-8392-50150946b2e2.png
206 hf_20260928_023114_cf6360a1-65be-41bb-b458-d6fdee9529db.png
207 hf_20260928_023115_16c7c28b-f6f9-4bd8-906f-fd6e40b7f5d8.png
208 hf_20260928_023114_79c79b10-80e9-42a4-b4f7-3f92942bf617.png
209 hf_20260928_023114_5bc8d746-136b-4e16-916c-0857732efd84.png
210 hf_20260928_023115_10b9e01f-5909-40bf-9f30-510d8e822a1d.png
211 hf_20260928_023115_aec69644-eb03-47f7-83ea-e70e20e37f06.png
301 hf_20260928_023249_af197ecb-5914-44db-bab3-e190f1e5f653.mp4
302 hf_20260928_023242_0783479d-e136-4ea8-a3da-ef2ad2308696.mp4
LIST
