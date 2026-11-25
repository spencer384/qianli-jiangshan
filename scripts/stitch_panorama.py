#!/usr/bin/env python3
"""將重疊的 16:9 實景段落依序進行色彩微調與餘弦羽化，無縫拼接為超寬長幅全景照片。"""

import argparse
import math
from pathlib import Path
import numpy as np
from PIL import Image


def cosine_blend_mask(overlap_w: int, height: int) -> np.ndarray:
    t = np.linspace(0.0, 1.0, overlap_w, dtype=np.float32)
    alpha = 0.5 * (1.0 - np.cos(math.pi * t))
    return np.tile(alpha[np.newaxis, :, np.newaxis], (height, 1, 3))


def stitch_images(
    image_paths: list[Path],
    output_path: Path,
    overlap_ratio: float = 0.25,
    target_width: int = 1920,
    target_height: int = 1080,
) -> Path:
    if not image_paths:
        raise ValueError("No input images provided for stitching.")

    overlap_w = int(target_width * overlap_ratio)
    step = target_width - overlap_w
    total_w = target_width + step * (len(image_paths) - 1)

    canvas = np.zeros((target_height, total_w, 3), dtype=np.float32)
    mask = cosine_blend_mask(overlap_w, target_height)

    for idx, p in enumerate(image_paths):
        im = Image.open(p).convert("RGB").resize((target_width, target_height), Image.Resampling.LANCZOS)
        arr = np.asarray(im, dtype=np.float32)

        x_start = idx * step
        if idx == 0:
            canvas[:, 0:target_width, :] = arr
        else:
            # Gentle exposure/color balance match across the overlap strip
            prev_overlap = canvas[:, x_start : x_start + overlap_w, :]
            curr_overlap = arr[:, 0:overlap_w, :]
            prev_mean = np.mean(prev_overlap, axis=(0, 1)) + 1e-5
            curr_mean = np.mean(curr_overlap, axis=(0, 1)) + 1e-5
            gain = np.clip(prev_mean / curr_mean, 0.88, 1.12)
            arr = np.clip(arr * gain, 0.0, 255.0)

            blended = prev_overlap * (1.0 - mask) + arr[:, 0:overlap_w, :] * mask
            canvas[:, x_start : x_start + overlap_w, :] = blended
            canvas[:, x_start + overlap_w : x_start + target_width, :] = arr[:, overlap_w:, :]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out_img = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8), mode="RGB")
    out_img.save(output_path, quality=95)
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="長卷無縫羽化全景拼接工具")
    parser.add_argument("inputs", nargs="+", type=Path, help="依序排列的實景切片圖片路徑")
    parser.add_argument("-o", "--output", type=Path, required=True, help="輸出全景圖路徑")
    parser.add_argument("--overlap", type=float, default=0.25, help="重疊比例 (預設 0.25)")
    args = parser.parse_args()

    out = stitch_images(args.inputs, args.output, overlap_ratio=args.overlap)
    print(f"已無縫拼接 {len(args.inputs)} 張圖片至 {out}")


if __name__ == "__main__":
    main()
