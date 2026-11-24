# 《方琮仿王希孟江山千里卷》現實擬真化探索紀錄

> 本分支 (`temp/photorealistic-scroll`) 記錄於 `2026-11-24` 針對《方琮仿王希孟江山千里卷.png》進行現實擬真化（Photorealistic Conversion）的技術盤點、切片前處理與生成方案。

---

## 1. ArtCraft 工具體系盤點結果

透過 `artcraft_hub.py status` 檢查本機已安裝的 8 套 ArtCraft 工具：

| 軟體 | 用途 | 適用性評估 |
| :--- | :--- | :--- |
| **FilmCraft** | 影片剪輯與時間軸運鏡 | ⚠️ **僅適合後期動態展示**（例如將長卷或擬真圖製成橫向漫遊影片），不具備 AI 風格轉寫真功能。 |
| **CADCraft / SolidCraft** | 2D/3D 工程製圖與實體建模 | ❌ 不適合 |
| **TextureCraft** | 3D PBR 材質繪製與貼圖烘焙 | ❌ 不適合 |
| **DeckCraft / GridCraft / PdfCraft / WordCraft** | 簡報、試算表、PDF、文件編輯 | ❌ 不適合 |

**結論**：ArtCraft 目前沒有「國畫轉現實擬真風景照片（Image-to-Image / Generative Photorealism）」工具。

---

## 2. 原圖規格與技術瓶頸診斷

- **檔案**：`方琮仿王希孟江山千里卷.png`
- **原始尺寸**：`47,242 × 2,072` 像素（約 97.8 百萬像素，接近 PIL 解壓縮保護上限）
- **長寬比**：`22.8 : 1`
- **直接生成失敗原因**：
  1. 直接將超寬原圖送入圖像生成 API 會觸發 `400 INVALID_ARGUMENT (INVALID_MEDIA)`。
  2. 先行裁切為標準比例並縮放至 `1920 × 1080` 可徹底解決輸入格式限制。

---

## 3. 切片素材與前處理腳本

- 範例切片（長卷約 52% 中央主峰與水鄉段落）：[`assets/sample_section.png`](../assets/sample_section.png)（`1920 × 1080`）
- 批量滑動切片腳本：[`scripts/slice_scroll.py`](../scripts/slice_scroll.py)

使用範例：
```bash
python scripts/slice_scroll.py "C:\Users\readb\Downloads\方琮仿王希孟江山千里卷.png" -o output_slices --overlap 0.2
```

---

## 4. 現實擬真攝影 Prompt（可直接用於圖生圖 / ControlNet）

### 英文版（針對 `assets/sample_section.png`）

```text
Transform this classical Chinese landscape painting into a breathtaking, ultra-high-resolution real-world aerial drone photograph (National Geographic / Hasselblad medium format style) set in a vast mountain lake in southern China at golden dawn, faithfully preserving the exact composition and spatial layout of the reference image.

In the bottom-left foreground, a steep rugged limestone rocky headland and low mossy reefs jut out of crystal-clear emerald-turquoise water, topped with real weathered ancient pine trees; moored beside the rocky spit is an authentic traditional wooden Chinese river sailboat with a woven bamboo canopy and wooden mast.

Stretching across the left background is an expansive, glassy turquoise-green lake reaching a distant low tree-lined peninsula and faint misty hills on the horizon.

Dominating the center-right and right side are majestic, towering steep mountain ranges with rugged karst and granite cliff faces, earthy ochre soil bases, slate-gray rock ridges, and dense verdant subtropical forest and mossy greenery catching the warm morning sunlight.

Tucked peacefully inside the sheltered bay between the central and right mountain massifs sits an authentic historic southern Chinese riverside village with weathered gray-tile stone houses, warm timber eaves, and small wooden fishing docks nestled among trees.

On the calm reflective water in the lower-right and middle-left are a few tiny traditional wooden fishing boats creating subtle ripples. Above, a wide serene morning sky glowing with soft golden-cream dawn light and ethereal mist clinging to the valleys and horizon, with a distant flock of wild birds soaring gracefully across the hazy sky above the central cliff headland.

Shot on Hasselblad H6D-100c, ultra-sharp 8K natural textures, realistic water reflections, authentic atmospheric depth, crisp sunlight and shadow. Purely real-world photography—no painting, no brushstrokes, no watercolor, no paper or silk texture. Aspect ratio 16:9.
```

---

## 5. 雲端生圖執行狀態紀錄

- 本次對話期間多次呼叫內建 `generate_image`（底層路由至 `gemini-3.1-flash-image`），均因伺服器算力暫時耗盡回傳 `503 Service Unavailable (MODEL_CAPACITY_EXHAUSTED)`。
- 後續可待伺服器算力恢復時直接以 `assets/sample_section.png` 重試，或透過外部工具（ComfyUI + ControlNet Depth/Canny、Midjourney、Photoshop AI）載入切片與上述 Prompt 完成渲染。
