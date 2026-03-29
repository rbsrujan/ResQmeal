#!/usr/bin/env python3
"""
Analyzes the Kaggle fresh/rotten food dataset to extract
visual characteristics for AI prompt calibration.
"""
import os
import json
import zipfile
import numpy as np
from pathlib import Path

try:
    from PIL import Image
    import io
except ImportError:
    print("Installing pillow...")
    os.system("pip install pillow numpy")
    from PIL import Image
    import io

# Extract dataset
zip_path = "archive.zip"
extract_path = Path("kaggle_dataset")

if not extract_path.exists():
    print(f"Extracting {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(extract_path)
    print("Extracted.")

# Find all image folders
print("\n=== Dataset Structure ===")
categories = {}
for root, dirs, files in os.walk(extract_path):
    imgs = [f for f in files 
            if f.lower().endswith(('.jpg','.jpeg','.png'))]
    if imgs:
        rel = Path(root).relative_to(extract_path)
        categories[str(rel)] = imgs
        print(f"{rel}: {len(imgs)} images")

# Analyze color profiles
def analyze_image(path):
    try:
        img = Image.open(path).convert('RGB').resize((64,64))
        arr = np.array(img, dtype=float)
        r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
        gray = arr.mean(axis=2)
        return {
            'mean_r': r.mean(), 'mean_g': g.mean(),
            'mean_b': b.mean(),
            'std': gray.std(),
            'dark_ratio': (gray < 60).mean(),
            'brown_ratio': ((r > 100) & (g < 80) & (b < 60)).mean(),
            'green_ratio': ((g > r) & (g > b) & (g > 80)).mean(),
            'gray_ratio': (
                (abs(r-g) < 20) & (abs(g-b) < 20) & (gray > 80)
            ).mean()
        }
    except:
        return None

profiles = {'fresh': [], 'rotten': []}

for cat_path, imgs in categories.items():
    cat_lower = cat_path.lower()
    is_fresh = any(w in cat_lower for w in 
        ['fresh', 'good', 'ripe', 'unrotten'])
    is_rotten = any(w in cat_lower for w in 
        ['rotten', 'bad', 'spoil', 'stale', 'overripe'])

    if not is_fresh and not is_rotten:
        continue

    key = 'fresh' if is_fresh else 'rotten'
    folder = extract_path / cat_path

    for img_name in imgs[:30]:
        result = analyze_image(folder / img_name)
        if result:
            profiles[key].append(result)

def avg(lst, key):
    vals = [x[key] for x in lst if x]
    return round(np.mean(vals), 4) if vals else 0

print("\n=== Visual Profile Analysis ===")
results = {}

for label in ['fresh', 'rotten']:
    if not profiles[label]:
        print(f"No {label} images found!")
        continue

    p = profiles[label]
    results[label] = {
        'mean_r':      avg(p, 'mean_r'),
        'mean_g':      avg(p, 'mean_g'),
        'mean_b':      avg(p, 'mean_b'),
        'std':         avg(p, 'std'),
        'dark_ratio':  avg(p, 'dark_ratio'),
        'brown_ratio': avg(p, 'brown_ratio'),
        'green_ratio': avg(p, 'green_ratio'),
        'gray_ratio':  avg(p, 'gray_ratio'),
        'sample_count': len(p)
    }
    print(f"\n{label.upper()} ({len(p)} samples):")
    for k, v in results[label].items():
        print(f"  {k}: {v}")

# Save calibration
with open('scripts/calibration.json', 'w') as f:
    json.dump(results, f, indent=2)
print("\nCalibration saved to scripts/calibration.json")

# Generate threshold summary
if 'fresh' in results and 'rotten' in results:
    f = results['fresh']
    r = results['rotten']
    print("\n=== Key Discriminators ===")
    print(f"Brown ratio: fresh={f['brown_ratio']:.3f} "
          f"vs rotten={r['brown_ratio']:.3f}")
    print(f"Dark ratio:  fresh={f['dark_ratio']:.3f}  "
          f"vs rotten={r['dark_ratio']:.3f}")
    print(f"Green ratio: fresh={f['green_ratio']:.3f} "
          f"vs rotten={r['green_ratio']:.3f}")
    print(f"Std dev:     fresh={f['std']:.1f} "
          f"vs rotten={r['std']:.1f}")
