#!/bin/bash
cd "$(dirname "$0")"
D=$(cat knot.d)
T='translate(128,123) scale(4.5) translate(-54,-53.8)'
ext() { # color depth
  local s=""; for i in $(seq 1 $2); do s+="<use href=\"#kn\" y=\"$i\" fill=\"$1\"/>"; done; echo "$s"; }
bevel='<filter id="bev" x="-10%" y="-10%" width="120%" height="120%">
 <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="b"/>
 <feSpecularLighting in="b" surfaceScale="3" specularConstant="1" specularExponent="26" lighting-color="#fff" result="s"><feDistantLight azimuth="260" elevation="52"/></feSpecularLighting>
 <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
 <feOffset in="SourceAlpha" dy="-2.2" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="edge"/>
 <feGaussianBlur in="edge" stdDeviation="1.2" result="eb"/>
 <feFlood flood-color="#000" flood-opacity="SHADOP"/><feComposite in2="eb" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="lo"/>
 <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k2="1" k3="SPEC" result="lit"/>
 <feMerge><feMergeNode in="lit"/><feMergeNode in="lo"/></feMerge>
</filter>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="SHOP"/></filter>'
base_defs="<path id=\"kp\" d=\"$D\"/><g id=\"kn\" transform=\"$T\"><use href=\"#kp\"/></g>"

# A: black glossy extruded
cat > opt-A.svg <<S
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>$base_defs
<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6a6d"/><stop offset=".45" stop-color="#262627"/><stop offset="1" stop-color="#0c0c0c"/></linearGradient>
<linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1b1b"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="cp"><use href="#kn"/></clipPath>
${bevel//SHADOP/.55}
</defs>
<g filter="url(#sh)">$(ext '#0a0a0a' 9)</g>
<g filter="url(#bev)"><use href="#kn" fill="url(#top)"/></g>
<rect x="20" y="20" width="216" height="104" fill="url(#gl)" clip-path="url(#cp)"/>
</svg>
S
sed -i 's/SHOP/.45/;s/SPEC/.55/' opt-A.svg

# B: green glossy
cat > opt-B.svg <<S
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>$base_defs
<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fd8b0"/><stop offset=".5" stop-color="#12a881"/><stop offset="1" stop-color="#0a7c5f"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="cp"><use href="#kn"/></clipPath>
${bevel//SHADOP/.4}
</defs>
<g filter="url(#sh)">$(ext '#075a45' 9)</g>
<g filter="url(#bev)"><use href="#kn" fill="url(#top)"/></g>
<rect x="20" y="20" width="216" height="104" fill="url(#gl)" clip-path="url(#cp)"/>
</svg>
S
sed -i 's/SHOP/.4/;s/SPEC/.6/' opt-B.svg

# C: white ceramic disc with raised white knot
base_defs="<path id=\"kp\" d=\"$D\"/><g id=\"kn\" transform=\"translate(128,125) scale(3.6) translate(-54,-53.8)\"><use href=\"#kp\"/></g>"
cat > opt-C.svg <<S
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>$base_defs
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9bcbf"/></linearGradient>
<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9cdd2"/><stop offset="1" stop-color="#eceef0"/></linearGradient>
<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe2e5"/></linearGradient>
${bevel//SHADOP/.25}
<filter id="ks" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1d2226" flood-opacity=".55"/></filter>
<filter id="in" x="-10%" y="-10%" width="120%" height="120%"><feOffset in="SourceAlpha" dy="3"/><feGaussianBlur stdDeviation="3" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out"/><feFlood flood-color="#000" flood-opacity=".22"/><feComposite in2="SourceAlpha" operator="in" result="sh"/><feComposite in="SourceAlpha" in2="o" operator="out"/><feComposite in="sh" in2="SourceGraphic" operator="over"/></filter>
</defs>
<circle cx="128" cy="132" r="116" fill="#000" opacity=".28" filter="url(#sh)"/>
<circle cx="128" cy="128" r="116" fill="url(#rim)"/>
<circle cx="128" cy="128" r="104" fill="url(#face)"/>
<circle cx="128" cy="128" r="104" fill="none" stroke="#9fa4a9" stroke-opacity=".5" stroke-width="1.5"/>
<g filter="url(#ks)">$(ext '#9aa0a6' 6)</g>
<g filter="url(#bev)"><use href="#kn" fill="url(#top)"/></g>
</svg>
S
sed -i 's/SHOP/.5/;s/SPEC/.35/' opt-C.svg
