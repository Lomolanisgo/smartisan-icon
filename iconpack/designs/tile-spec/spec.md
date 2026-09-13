# Smartisan rectangular tile spec

Measured from `iconpack/overrides/icons/com.bilibili.app.in.png` (256x256 RGBA). I read the edges from each row's summed alpha coverage, which gives sub-pixel positions.

## Silhouette

| Item | Value |
|---|---|
| Canvas | 256 x 256, transparent |
| Left / right edge | x = 3.06 / 252.94 (symmetric about x = 128) |
| Top / bottom edge | y = 23.00 / 232.93 |
| Size | 249.88 x 209.93 (about 250 x 210, ratio 1.19) |
| Centre | (128, 127.97) |
| Corner | **Superellipse, not a circular arc**: \|x/r\|^3 + \|y/r\|^3 = 1, r = 24 |
| Corner fit error | superellipse n=3, r=24: 0.047 px rms · n=2.5, r=20.5: 0.058 · best circle (r=17): 0.201 |
| SVG corner | one cubic per corner, handles 18.80 px from each end: h = r(8·2^(-1/n) − 4)/3 |

Checked by rendering `tile.svg` in headless Chrome and comparing with the reference row by row:
- **Rows 23–231:** edge error 0.11 px rms, 0.83 px max.
- **Row 232:** bilibili's bottom-most row is only 93% covered, and its bottom corners end about 1 px wider on that row. That one row can't be reproduced exactly and adds about 0.5 px to the full-height rms.

The outline also closely matches `overlay.png` (red = spec outline, cyan dashed = best circular r=17 corner, top-left only).

## Shadow

**None.** All 686 semi-transparent pixels sit inside the tile bbox and are edge anti-aliasing. Nothing is drawn outside the silhouette. Depth comes entirely from the rim and inner shading below. Do **not** add an outer drop shadow, or the tile will look bigger and softer than its neighbours.

## Rim and fill (neutral base)

| Layer | Measured |
|---|---|
| Outer rim, 1 px inside the edge | top #C6C6C6 · sides #CFCFCF (y60) → #DADADA (y200) · bottom about #CECECE–#D6D6D6 |
| Top inner highlight | 1 px #FFFFFF directly under the top rim, then a faint 3 px dip (#FBFBFB → #F6F6F6) |
| Side inner shade | 1–2 px: #F2F2F2 / #EFEFEF next to the rim, #FDFDFD / #F4F4F4 interior |
| Bottom inner shade | 2 rows above the rim: #E6E6E6, #EFEFEF |
| Fill | vertical linear gradient, #FFFFFF at y=23 → #F2F2F2 at y=233 (about −1 level per 15 px) |

For a coloured tile, keep the same structure: rim about 25–30% darker than the fill, a 1 px lighter line under the top rim, and a slightly darker bottom.

## Paste-in snippet (viewBox 0 0 256 256)

```svg
<defs>
  <path id="tile" d="M27.06 23H228.94C247.74 23 252.94 28.2 252.94 47V208.93C252.94 227.73 247.74 232.93 228.94 232.93H27.06C8.26 232.93 3.06 227.73 3.06 208.93V47C3.06 28.2 8.26 23 27.06 23Z"/>
  <clipPath id="tileClip"><use href="#tile"/></clipPath>
  <linearGradient id="tileFill" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2F2F2"/>
  </linearGradient>
  <linearGradient id="tileRim" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#C6C6C6"/><stop offset="0.2" stop-color="#CFCFCF"/>
    <stop offset="0.85" stop-color="#DADADA"/><stop offset="1" stop-color="#D0D0D0"/>
  </linearGradient>
</defs>
<!-- base -->
<use href="#tile" fill="url(#tileFill)"/>
<!-- rim + inner shading; strokes are clipped so nothing leaves the silhouette -->
<g clip-path="url(#tileClip)" fill="none">
  <use href="#tile" stroke="#000" stroke-opacity="0.05" stroke-width="5"/>
  <use href="#tile" stroke="#000" stroke-opacity="0.07" stroke-width="4" transform="translate(0 -1.5)"/>
  <use href="#tile" stroke="#FFFFFF" stroke-width="2" transform="translate(0 1)"/>
  <use href="#tile" stroke="url(#tileRim)" stroke-width="2"/>
</g>
<!-- icon content goes here; clip it with clip-path="url(#tileClip)" if it touches the edges -->
<!-- shadow filter: intentionally none (reference has no outer shadow) -->
```

Rectangle fallback if a superellipse isn't possible: `<rect x="3.06" y="23" width="249.88" height="209.93" rx="17"/>`. Its corners are visibly rounder and tighter, about 0.2 px rms off.

## Files

- `tile.svg`: the bare tile built from this spec. `tile.png`: its Chrome render.
- `overlay.png`: the bilibili PNG at 3x (nearest-neighbour) with the spec outline in red.
- `overlay-corners.png`: top-left and bottom-right corners, zoomed a further 2x from the overlay.
- `verify.ps1 [-Target x.svg -Png x.png]`: renders an SVG in headless Chrome and reports edge error against the reference.
