"""Render two structural figures for the context-compaction article.

Requires Pillow. DIAGRAM_FONT may point to another Chinese font.
Blocks show sequence, never token length or measured cache reuse.
"""

from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont


OUT = Path(__file__).resolve().parents[3] / "public/images/blog/context-compaction"
FONT = os.environ.get("DIAGRAM_FONT", "/System/Library/Fonts/STHeiti Medium.ttc")
SCALE = 2
WIDTH = 1540
COLORS = {
    "bg": "#FCFCFA", "text": "#202B37", "muted": "#586675",
    "line": "#D4DBE2", "base": "#ECEFF2", "same": "#DCE9FB",
    "new": "#F5E7C7", "blue": "#245294", "ochre": "#775415",
}


class Figure:
    def __init__(self, height):
        self.image = Image.new("RGB", (WIDTH * SCALE, height * SCALE), COLORS["bg"])
        self.draw = ImageDraw.Draw(self.image)

    def font(self, size):
        return ImageFont.truetype(FONT, round(size * SCALE))

    def text(self, x, y, value, size=25, color="text"):
        self.draw.text((x * SCALE, y * SCALE), value, font=self.font(size), fill=COLORS[color])

    def line(self, y):
        self.draw.line((48 * SCALE, y * SCALE, (WIDTH - 48) * SCALE, y * SCALE),
                       fill=COLORS["line"], width=SCALE)

    def block(self, x, y, label, kind="base"):
        size = 26
        bounds = self.draw.textbbox((0, 0), label, font=self.font(size))
        width = (bounds[2] - bounds[0]) / SCALE + 40
        self.draw.rounded_rectangle((x * SCALE, y * SCALE, (x + width) * SCALE, (y + 62) * SCALE),
                                    radius=5 * SCALE, fill=COLORS[kind])
        color = "blue" if kind == "same" else "ochre" if kind == "new" else "text"
        self.text(x + 20, y + 15, label, size=size, color=color)
        return width

    def row(self, y, name, blocks):
        self.text(48, y + 16, name, size=27)
        x = 213
        for i, (label, kind) in enumerate(blocks):
            x += self.block(x, y, label, kind)
            if i < len(blocks) - 1:
                self.text(x + 10, y + 14, "→", size=25, color="muted")
                x += 43
        if x > WIDTH - 45:
            raise ValueError(f"Row exceeds canvas: {name}, right={x}")

    def legend(self, y):
        x = 48
        for label, kind in [("比较基准", "base"), ("连续相同的前缀", "same"), ("新增 / 首次差异之后", "new")]:
            self.draw.rectangle((x * SCALE, y * SCALE, (x + 19) * SCALE, (y + 19) * SCALE), fill=COLORS[kind])
            self.text(x + 29, y - 4, label, size=23, color="muted")
            x += 245 if kind == "base" else 360

    def save(self, name):
        OUT.mkdir(parents=True, exist_ok=True)
        self.image.save(OUT / name, optimize=True)


def prefix():
    f = Figure(910)
    f.text(48, 34, "动态上下文怎么加入长对话", size=40)
    f.text(48, 98, "同一轮写入一次；下一轮读取新版本，保留旧版本。", size=26, color="muted")
    f.legend(165)
    f.line(217)
    f.text(48, 247, "临时注入：下一轮丢掉了 D16", size=30)
    f.row(311, "第 16 轮", [("P", "base"), ("H1–15", "base"), ("D16 + U16", "base")])
    f.row(391, "第 17 轮", [("P", "same"), ("H1–15", "same"), ("U16", "new"),
                             ("A16", "new"), ("D17 + U17", "new")])
    f.text(213, 475, "历史重建后出现差异，连续相同的前缀在 D16 之前结束。", color="muted")
    f.line(535)
    f.text(48, 566, "逐轮快照：D16 随历史保存", size=30)
    f.row(630, "第 16 轮", [("P", "base"), ("H1–15", "base"), ("D16 + U16", "base")])
    f.row(710, "第 17 轮", [("P", "same"), ("H1–15", "same"), ("D16 + U16", "same"),
                             ("A16", "new"), ("D17 + U17", "new")])
    f.text(213, 794, "D17 可以读取新记忆；已经保存的 D16 保持不变。", color="muted")
    f.line(844)
    f.text(48, 864, "P 固定规则与工具 · H 此前历史 · D 本轮快照 · U 问题 · A 回复及工具过程", size=22, color="muted")
    f.save("turn-prefix.png")


def window():
    f = Figure(760)
    f.text(48, 34, "压缩一次，再从新的窗口继续追加", size=40)
    f.text(48, 98, "假设第 22 轮达到阈值，预算恰好保留第 19–21 轮原文。", size=26, color="muted")
    f.legend(162)
    f.line(216)
    f.row(252, "压缩前", [("P", "base"), ("T1–21", "base"), ("D22 + U22", "base")])
    f.text(213, 337, "旧摘要（若有）+ 待移除的历史 → 新的交接摘要 S1", size=25, color="muted")
    f.row(405, "压缩后", [("P", "same"), ("S1", "new"), ("T19–21", "new"), ("D22 + U22", "new")])
    f.text(213, 490, "S1 改变前缀，首次请求可能减少旧缓存的复用。", size=25, color="muted")
    f.row(558, "再追问", [("P", "same"), ("S1", "same"), ("T19–21", "same"),
                          ("D22 + U22", "same"), ("A22", "new"), ("D23 + U23", "new")])
    f.text(213, 643, "沿用 S1 与保留原文，新回复和新问题继续向后追加。", size=25, color="muted")
    f.line(699)
    f.text(48, 720, "S 交接摘要 · T 完整历史轮次（含快照）· 轮号、保留轮数及色块均为结构示意", size=22, color="muted")
    f.save("compaction-window.png")


if __name__ == "__main__":
    prefix()
    window()
    print(f"Rendered two figures in {OUT}")
