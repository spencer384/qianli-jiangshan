#!/usr/bin/env python3
"""將超寬長卷畫作（如《千里江山圖》）依指定長寬比（預設 16:9）自動分段裁切為標準解析度圖片。"""

import argparse
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None


def slice_scroll(
    input_path: Path,
    output_dir: Path,
    overlap_ratio: float = 0.2,
    target_width: int = 1920,
    target_height: int = 1080,
) -> list[Path]:
    """依重疊比例滑動裁切長卷並縮放至目標解析度。"""
    img = Image.open(input_path)
    w, h = img.size
    aspect = target_width / target_height
    crop_w = int(h * aspect)
    step = max(1, int(crop_w * (1.0 - overlap_ratio)))

    output_dir.mkdir(parents=True, exist_ok=True)
    saved_paths: list[Path] = []

    idx = 1
    x = 0
    while x < w:
        right = min(w, x + crop_w)
        left = max(0, right - crop_w)
        cropped = img.crop((left, 0, right, h))
        resized = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)

        out_file = output_dir / f"{input_path.stem}_part_{idx:02d}.png"
        resized.save(out_file, format="PNG")
        saved_paths.append(out_file)

        if right >= w:
            break
        x += step
        idx += 1

    return saved_paths


def main() -> None:
    parser = argparse.ArgumentParser(description="長卷 16:9 滑動分段裁切工具")
    parser.add_argument("input", type=Path, help="來源長卷圖片路徑")
    parser.add_argument("-o", "--output-dir", type=Path, default=Path("slices"), help="輸出資料夾")
    parser.add_argument("--overlap", type=float, default=0.2, help="相鄰切片重疊比例 (預設 0.2)")
    parser.add_argument("--width", type=int, default=1920, help="輸出寬度 (預設 1920)")
    parser.add_argument("--height", type=int, default=1080, help="輸出高度 (預設 1080)")
    args = parser.parse_args()

    files = slice_scroll(args.input, args.output_dir, args.overlap, args.width, args.height)
    print(f"已完成裁切，共產出 {len(files)} 張圖片至 {args.output_dir}")


if __name__ == "__main__":
    main()
