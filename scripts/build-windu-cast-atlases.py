#!/usr/bin/env python3
"""Build the /control Miles Windu web atlases from a COS Control DefaultPet folder.

The app ships Miles Windu Version 15 as horizontal PNG strips (1x, and 2x from the
retina block of session-pet-states.json), with three or four shuffled opponent casts
per running state. Each cast has three layers:

  full   the whole scene, drawn before the handoff frame
  entry  the incoming cast arriving, drawn in the tail (under body)
  body   the hero plus the outgoing cast, drawn in the tail (over entry)

The web player only ever draws `full` before the handoff and `entry`+`body` from the
handoff on (PetEncounterRotation.layers in the app), so each layer is cut to the frames
it is drawn on, cropped to its union alpha box, and written as WebP rows of at most
8192 px and 2.5 MP each. The player decodes only the rows about to play (a 2x cast
decoded whole is 40 to 90 MB; a row is at most 10 MB), the same idea as the app
decoding casts for the state on screen only. manifest.json records cell size, crop
boxes, frames per row and the row files so every layer lands at its cell position.

Usage:
  python3 scripts/build-windu-cast-atlases.py \
    --src /path/to/cos-control-macos/Resources/DefaultPet \
    --control-version 0.5.332 --out control/assets/session-command/windu-v15
Needs Pillow with WebP support.
"""
import argparse
import hashlib
import json
import math
import os
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

MAX_W = 8192
ROW_PX = 2_500_000
CAST_POSES = ("working", "duel", "trio", "swarm")
SINGLE_POSES = ("done", "waiting", "idle")
PAD = 2


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_strip(src, files):
    files = [files] if isinstance(files, str) else files
    ims = [Image.open(os.path.join(src, f)).convert("RGBA") for f in files]
    if len(ims) == 1:
        return ims[0]
    out = Image.new("RGBA", (sum(i.width for i in ims), ims[0].height))
    x = 0
    for im in ims:
        out.paste(im, (x, 0))
        x += im.width
    return out


def union_box(strip, cw, ch, frames):
    box = None
    for k in frames:
        b = strip.crop((k * cw, 0, (k + 1) * cw, ch)).getchannel("A").getbbox()
        if b:
            box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    if box is None:
        return None
    return (max(0, box[0] - PAD), max(0, box[1] - PAD), min(cw, box[2] + PAD), min(ch, box[3] + PAD))


def pack(job):
    """Crop frames [start, start+count) of a strip to box and write them as WebP rows."""
    src, files, frames_total, start, count, box, out_base, quality = job
    strip = load_strip(src, files)
    cw, ch = strip.width // frames_total, strip.height
    bw, bh = box[2] - box[0], box[3] - box[1]
    # Fewest rows within both budgets, then the fewest frames per row for that row
    # count, so the last row is never needlessly short.
    per_row = max(1, min(count, MAX_W // bw, ROW_PX // (bw * bh)))
    rows = math.ceil(count / per_row)
    cols = math.ceil(count / rows)
    out = []
    for r in range(rows):
        n = min(cols, count - r * cols)
        row = Image.new("RGBA", (n * bw, bh), (0, 0, 0, 0))
        for i in range(n):
            k = start + r * cols + i
            row.paste(strip.crop((k * cw + box[0], box[1], k * cw + box[2], box[3])), (i * bw, 0))
        path = f"{out_base}-r{r}.webp"
        row.save(path, "WEBP", quality=quality, method=6, alpha_quality=100, exact=False)
        out.append((os.path.basename(path), os.path.getsize(path), row.width * row.height * 4))
    return cols, out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--control-version", required=True)
    ap.add_argument("--quality", type=int, default=86)
    a = ap.parse_args()

    poses = json.load(open(os.path.join(a.src, "session-pet-states.json")))["poses"]
    manifest = {"pack": "Miles Windu Version 15", "control": a.control_version,
                "statesSha256": sha(os.path.join(a.src, "session-pet-states.json")),
                "poses": {}}
    jobs, slots = [], []

    def scale_sources(p):
        out = {"1": {"file": p["file"], "variants": (p.get("rotation") or {}).get("variants")}}
        if p.get("retina"):
            out["2"] = {"file": p["retina"]["file"], "variants": p["retina"].get("variants")}
        return out

    for pose in CAST_POSES + SINGLE_POSES:
        p = poses[pose]
        n = p["frames"]
        entry = {"frames": n, "interval": p.get("interval", 0.28 if pose == "idle" else 0.14),
                 "renderScale": p.get("renderScale", 1.0), "scales": {}}
        handoff = (p.get("rotation") or {}).get("handoffFrame")
        if pose in CAST_POSES:
            entry["handoff"] = handoff
        for scale, s in scale_sources(p).items():
            d = os.path.join(a.out, f"{scale}x")
            os.makedirs(d, exist_ok=True)
            probe = load_strip(a.src, s["file"])
            if probe.width % n:
                raise SystemExit(f"{pose} {scale}x: width {probe.width} is not a multiple of {n} frames")
            cw, ch = probe.width // n, probe.height
            sc = {"cell": [cw, ch]}
            if pose in CAST_POSES:
                pre = list(range(0, handoff - 1))
                tail = list(range(handoff - 1, n))
                layers = {"full": (pre, "file"), "entry": (tail, "entryFile"), "body": (tail, "bodyFile")}
                boxes = {}
                for layer, (frames, key) in layers.items():
                    box = None
                    for v in s["variants"]:
                        b = union_box(load_strip(a.src, v[key]), cw, ch, frames)
                        if b is None:
                            continue
                        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
                    boxes[layer] = box
                # A layer that is transparent on every frame of every cast (Session 1 has
                # no arriving cast to draw under the body) ships no atlas at all.
                sc["layers"] = {layer: {"box": [b[0], b[1], b[2] - b[0], b[3] - b[1]] if b else None,
                                        "start": layers[layer][0][0], "count": len(layers[layer][0])}
                                for layer, b in boxes.items()}
                sc["variants"] = []
                for v in s["variants"]:
                    rec = {"id": v["id"]}
                    for layer, (frames, key) in layers.items():
                        if boxes[layer] is None:
                            continue
                        name = f"{v['id']}-{layer}"
                        jobs.append((a.src, v[key], n, frames[0], len(frames), boxes[layer], os.path.join(d, name), a.quality))
                        slots.append((rec, layer, f"{scale}x"))
                    sc["variants"].append(rec)
            else:
                box = union_box(probe, cw, ch, range(n)) or (0, 0, cw, ch)
                sc["box"] = [box[0], box[1], box[2] - box[0], box[3] - box[1]]
                jobs.append((a.src, s["file"], n, 0, n, box, os.path.join(d, pose), a.quality))
                slots.append((sc, None, f"{scale}x"))
            entry["scales"][scale] = sc
        manifest["poses"][pose] = entry

    with ProcessPoolExecutor() as ex:
        results = list(ex.map(pack, jobs))
    total = {}
    for (rec, layer, folder), (cols, rows) in zip(slots, results):
        val = {"cols": cols, "rows": [f"{folder}/{name}" for name, _, _ in rows]}
        if layer:
            rec[layer] = val
        else:
            rec.update(val)
        for name, size, dec in rows:
            total[folder] = total.get(folder, 0) + size
            total[folder + " largest row decoded"] = max(total.get(folder + " largest row decoded", 0), dec)
        print(f"{folder}/{rows[0][0][:-8]:22s} rows={len(rows)} cols={cols:2d} "
              f"{sum(s for _, s, _ in rows) / 1e6:5.2f} MB  row decoded max {max(d for _, _, d in rows) / 1e6:5.1f} MB", flush=True)
    with open(os.path.join(a.out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1)
        f.write("\n")
    for k, v in sorted(total.items()):
        print(f"total {k}: {v / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
