---
name: excalidraw-architecture-diagrams
description: Create readable, hand-drawn Excalidraw architecture diagrams with clear containment, hierarchy, and low-crossing connectors. Use when explaining software architecture, agent loops, data flow, system layers, or blog concepts visually; do not use for decorative illustrations.
---

# Excalidraw Architecture Diagrams

Create an editable Excalidraw source file first, then export the diagram to SVG (preferred) or PNG for the consuming blog/page. The source of truth is the `.excalidraw` file; the exported asset is a delivery artifact.

## Start with the relationship model

Before drawing, classify every relationship:

- **Contains**: use an outer frame with nested regions or cards. Do not replace containment with a chain of arrows.
- **Calls / sends / reads**: use one-direction arrows with short labels.
- **Shares / depends on**: use a dashed connector or a small side annotation.
- **Lifecycle**: use a separate timeline or numbered flow, not the main containment map.

If the user gives a reference like a hand-drawn architecture screenshot, preserve its visual grammar: one large system frame, a few colored zones, rounded boxes, black/near-black strokes, short labels, and generous whitespace.

## Layout rules

1. Draw the outer system boundary first, with the system name in its header.
2. Place 2–5 semantic zones inside it (for example Storage, Runtime, Reliability, UI). Each zone gets one color family.
3. Put concrete components inside their owning zone. Use nested frames when a component itself contains subcomponents.
4. Route connectors around boxes. Avoid diagonal crossings, edge-to-edge tangles, and arrows that pass through text.
5. Keep one visual reading direction. If the primary relationship is containment, use alignment and nesting—not arrows—to communicate it.
6. Add a small legend only when color or line style has semantic meaning.

## Visual tokens

- Canvas: white or warm off-white (`#fffdf7`); use dark backgrounds only when the page theme requires it.
- Stroke: near-black (`#1e293b`), 2–3 px, roughness 1–2.
- Font: Excalidraw/Virgil-style hand lettering; use a readable sans fallback for Chinese.
- Palette: blue for input/storage, violet for runtime/performance, teal or green for reliability/output, amber only for warnings or boundaries.
- Use at most four accent colors. Do not turn every node into a different color.
- Titles 28–36 px, zone labels 22–28 px, node text 16–22 px. Keep labels short; move explanations into a caption below the diagram.

## Excalidraw data requirements

When writing `.excalidraw` JSON:

- Include `type: "excalidraw"`, `version: 2`, and an `elements` array.
- Give every element a stable unique `id`.
- For text inside a shape, set the text element's `containerId` and the shape's `boundElements` entry.
- Use `roughness: 1` or `2` for hand-drawn edges and `roughness: 0` for the background.
- Bind arrows to their source/target shapes when the connector represents a real relationship.
- Keep the JSON valid and reopen it in Excalidraw before publishing.

Existing repository examples are useful references:

- `docs/diagrams/deepseek-harness/cordis-core-overview.excalidraw`
- `docs/diagrams/deepseek-harness/cordis-effect-lifecycle.excalidraw`
- `docs/diagrams/deepseek-harness/turn-step-agent-loop.excalidraw`

## Blog delivery

For this Astro blog:

- Store editable sources in `docs/diagrams/<topic>/`.
- Store exports in `public/images/blog/<topic>/`.
- Prefer SVG so text stays sharp and the asset remains inspectable.
- Use a descriptive alt text that states the relationship being explained.
- If the article is Notion-backed, update the Notion source after the public asset is deployed; use the repository's `blog-notion-publish-workflow` skill for publishing and verification.

## Quality check before handoff

- Can a reader identify the outer system and its zones in three seconds?
- Are containment relationships visible without reading every arrow?
- Are there fewer than five crossing connectors?
- Is every label readable at the article's display width?
- Does the diagram explain one idea instead of trying to show the entire system?
- Is the editable `.excalidraw` source kept beside the exported asset?

Do not use image generation for precise architecture diagrams unless the user explicitly wants a decorative illustration. Raster generation tends to corrupt labels and invent relationships; structured Excalidraw elements preserve both meaning and editability.
