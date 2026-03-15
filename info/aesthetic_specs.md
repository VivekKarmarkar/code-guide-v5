# Aesthetic Specs

## 1. Dark/Light Mode

- Toggle between dark and light mode
- Must be available globally across all views (top level and code level)

## 2. Component Rectangles

- Translucent, minimal flat colored rectangles (thin border, subtle fill, no shadows or gloss — per brainstorming decision)
- Must be sized to fully house the complete text inside them with margins on all sides
- Text must never overflow or be clipped

## 3. Text and Data Flow Lines

- NEVER render text strings to label the dashed data flow paths — edges are unlabeled, always
- NEVER render dashed flow paths that enter the component rectangles
- Text only exists inside component rectangles, nowhere else on the diagram
- Text and lines must be clearly separated — layout must enforce this

## 4. Data Flow Lines

- Data flow lines must be dashed
- Animated particles/movement travel along the dashed lines to show direction of flow

## 5. No Clutter

- Visuals must have NO CLUTTER
- Every element on screen must earn its place
- Whitespace is a feature, not wasted space
