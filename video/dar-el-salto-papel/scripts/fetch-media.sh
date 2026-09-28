#!/bin/bash
# Descarga los escenarios y hojas de poses del conejo de papel (Higgsfield, Nano Banana 2,
# generados por la usuaria en la web). Deja assets/papel/<id>.png
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/papel
B=https://d8j0ntlcm91z4.cloudfront.net/user_37xL8uQkAiExL4l53S1OQTuJqcT
while read -r n f; do
  [ -f "assets/papel/$n.png" ] && continue
  curl -sSfL </dev/null -o "assets/papel/$n.png" "$B/$f"
  echo "ok $n"
done <<'LIST'
e01-madriguera hf_20260928_030418_fdcf1835-595d-490b-8f14-fb283288c57d.png
e02-cabana hf_20260928_030434_4446be1d-4be1-4bfd-a8cd-2cbc8df2b30f.png
e03-faro hf_20260928_030446_2bb58222-8520-4ed2-be40-8b1520c9baff.png
e04-edificio hf_20260928_030500_b4e6e905-1726-44d6-a47f-59c99f8a1b5e.png
e05-arbol hf_20260928_030655_248d95d7-30e4-451a-803d-6c30a58fae60.png
e06-iglu hf_20260928_031431_9b4268a3-ad9f-42ee-a2dc-d08757c416ed.png
e07-castillo hf_20260928_030729_cf2f581f-09d4-4157-9419-bf5a07eaa766.png
e08-sombrero hf_20260928_030739_944f3c10-32d6-4d96-89d9-78249740aa1c.png
e09-adentro hf_20260928_030937_99a0bf3d-f0d2-42a6-a177-baae7ead1af9.png
c01-poses hf_20260928_030946_6749b24e-4e02-4d58-af9c-9c2e668b7c1c.png
c02-poses hf_20260928_030958_fcb8b221-304c-4755-9e88-ddeb0489e2c9.png
LIST
