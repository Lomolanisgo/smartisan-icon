D=/c/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/designs/edge; cd $D
MASK=$(cat _mask.txt)
img(){ # h cx cy
 awk -v h=$1 -v cx=$2 -v cy=$3 -v m="$MASK" 'BEGIN{w=h*441/480;printf "<image href=\"%s\" x=\"%.2f\" y=\"%.2f\" width=\"%.2f\" height=\"%.2f\"/>",m,cx-w/2,cy-h/2,w,h}'; }
mask(){ echo "<mask id=\"$1\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"256\" height=\"256\">$(img $2 $3 $4)</mask>"; }
head_(){ echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><defs>'; }
common(){ # blurStd surfaceScale k3 gradY1 gradY2
cat <<EOF
<filter id="blur4" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="blur3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="emb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="$1" result="b"/><feSpecularLighting in="b" surfaceScale="$2" specularConstant=".9" specularExponent="22" lighting-color="#fff" result="s"><fePointLight x="70" y="-60" z="220"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3="$3" k4="0"/></filter>
<linearGradient id="face" gradientUnits="userSpaceOnUse" x1="0" y1="$4" x2="0" y2="$5"><stop offset="0" stop-color="$L"/><stop offset=".5" stop-color="$M"/><stop offset="1" stop-color="$K"/></linearGradient>
<linearGradient id="gl" gradientUnits="userSpaceOnUse" x1="0" y1="$4" x2="0" y2="$5"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E3ECF5"/></linearGradient>
<radialGradient id="disc" cx=".5" cy=".28" r=".8"><stop offset="0" stop-color="$L"/><stop offset=".55" stop-color="$M"/><stop offset="1" stop-color="$X"/></radialGradient>
<linearGradient id="hi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
EOF
}
mk(){ # suffix L M K X T R
S=$1; L=$2; M=$3; K=$4; X=$5; T=$6; R=$7
# A: silver rim + glossy disc + white e (360 / Baidu)
{ head_; common 2 3 .45 60 200; mask m 132 129 128; mask ms 132 129 133
cat <<EOF
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D3D8DE"/></linearGradient>
<linearGradient id="groove" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9B1BA"/><stop offset="1" stop-color="#F3F5F7"/></linearGradient>
<clipPath id="dc"><circle cx="128" cy="128" r="100"/></clipPath>
</defs>
<circle cx="128" cy="133" r="119" fill="#000" opacity=".32" filter="url(#blur4)"/>
<circle cx="128" cy="128" r="120" fill="url(#rim)" stroke="#BCC2C9" stroke-width="1"/>
<circle cx="128" cy="128" r="104" fill="url(#groove)"/>
<circle cx="128" cy="128" r="100" fill="url(#disc)"/>
<g clip-path="url(#dc)"><ellipse cx="128" cy="62" rx="92" ry="58" fill="url(#hi)" opacity=".7"/><ellipse cx="128" cy="236" rx="90" ry="40" fill="$L" opacity=".35" filter="url(#blur4)"/></g>
<rect width="256" height="256" fill="$X" opacity=".55" mask="url(#ms)" filter="url(#blur3)"/>
<g filter="url(#emb)"><rect width="256" height="256" fill="url(#white)" mask="url(#m)"/></g>
</svg>
EOF
} > edge2-A-$S.svg
# B: full-bleed 3D e (Opera O / 360 e)
{ head_; common 3 5 .32 8 248
for o in 0 2 4 6 9; do mask m$o 240 128 $((124+o)); done
cat <<EOF
</defs>
<rect width="256" height="256" fill="#000" opacity=".35" mask="url(#m9)" filter="url(#blur4)"/>
<rect width="256" height="256" fill="$X" mask="url(#m6)"/>
<rect width="256" height="256" fill="$K" mask="url(#m4)"/>
<rect width="256" height="256" fill="$K" mask="url(#m2)"/>
<g filter="url(#emb)"><rect width="256" height="256" fill="url(#face)" mask="url(#m0)"/></g>
<rect width="256" height="256" fill="url(#gl)" mask="url(#m0)"/>
</svg>
EOF
} > edge2-B-$S.svg
# C: glass globe disc, no rim (Maxthon / Samsung / QQ)
{ head_; common 2 3 .4 60 200; mask m 146 130 128; mask ms 146 130 134
cat <<EOF
<clipPath id="dc"><circle cx="128" cy="128" r="118"/></clipPath>
<linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
</defs>
<circle cx="128" cy="133" r="117" fill="#000" opacity=".32" filter="url(#blur4)"/>
<circle cx="128" cy="128" r="118" fill="url(#disc)"/>
<g clip-path="url(#dc)" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="2">
<ellipse cx="128" cy="128" rx="40" ry="118"/><ellipse cx="128" cy="128" rx="84" ry="118"/><line x1="128" y1="0" x2="128" y2="256"/>
<ellipse cx="128" cy="128" rx="118" ry="30"/><path d="M14,82 Q128,108 242,82 M14,174 Q128,148 242,174"/>
<ellipse cx="128" cy="250" rx="100" ry="46" fill="$L" stroke="none" opacity=".45" filter="url(#blur4)"/>
</g>
<circle cx="128" cy="128" r="116.5" fill="none" stroke="url(#edge)" stroke-width="2.5"/>
<rect width="256" height="256" fill="$X" opacity=".6" mask="url(#ms)" filter="url(#blur3)"/>
<g filter="url(#emb)"><rect width="256" height="256" fill="url(#white)" mask="url(#m)"/></g>
<g clip-path="url(#dc)"><ellipse cx="128" cy="40" rx="104" ry="62" fill="url(#hi)" opacity=".45"/></g>
</svg>
EOF
} > edge2-C-$S.svg
# D: pale porcelain disc + coloured 3D e (Quark / QQ Music rim)
{ head_; common 2 3 .3 55 205
for o in 0 2 4 8; do mask m$o 150 129 $((126+o)); done
cat <<EOF
<radialGradient id="pale" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="$T"/><stop offset="1" stop-color="#D9DFE6"/></radialGradient>
</defs>
<circle cx="128" cy="133" r="119" fill="#000" opacity=".28" filter="url(#blur4)"/>
<circle cx="128" cy="128" r="120" fill="url(#pale)" stroke="$R" stroke-width="1.5"/>
<circle cx="128" cy="128" r="110" fill="none" stroke="$R" stroke-opacity=".45" stroke-width="1"/>
<circle cx="128" cy="128" r="118" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/>
<rect width="256" height="256" fill="$X" opacity=".35" mask="url(#m8)" filter="url(#blur3)"/>
<rect width="256" height="256" fill="$X" mask="url(#m4)"/>
<rect width="256" height="256" fill="$K" mask="url(#m2)"/>
<g filter="url(#emb)"><rect width="256" height="256" fill="url(#face)" mask="url(#m0)"/></g>
<rect width="256" height="256" fill="url(#gl)" mask="url(#m0)"/>
</svg>
EOF
} > edge2-D-$S.svg
}
mk stable "#72BEF8" "#2F7BD2" "#1F5CA8" "#133970" "#EAF2FB" "#A9C6E6"
mk dev    "#5EDDA8" "#1AA172" "#127B55" "#0A4D35" "#E7F6EF" "#9FD5BF"
W=$(cygpath -m $D)
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
for o in ${OPTS:-A B C D}; do for s in stable dev; do f=edge2-$o-$s
echo "<html><body style='margin:0;background:transparent'><img src='$f.svg' width=256 height=256 style='display:block'></body></html>" > _$f.html
"$CH" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 --screenshot="$W/$f.png" "file:///$W/_$f.html" 2>/dev/null
rm -f _$f.html; done; done
P="file:///D:/Others-Github/smartisan_icon/iconpack/png"
REFS="com.qihoo.browser com.oupeng.browser com.mx.browser com.sec.android.app.sbrowser"
{ echo "<html><body style='margin:0;background:#ECECEC;font:14px sans-serif;padding:8px'>"
for o in A B C D; do
 echo "<div style='display:flex;align-items:center;gap:8px;margin:4px 0'><b style='width:18px'>$o</b><img src='edge2-$o-stable.png' width=256><img src='edge2-$o-dev.png' width=256>"
 for r in $REFS; do echo "<img src='$P/$r.png' width=256 height=256>"; done
 echo "<span style='width:12px'></span><img src='edge2-$o-stable.png' width=48><img src='edge2-$o-dev.png' width=48>"
 for r in $REFS; do echo "<img src='$P/$r.png' width=48>"; done
 echo "</div>"
done; echo "</body></html>"; } > _sheet.html
"$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=2040,1090 --screenshot="$W/edge2-sheet.png" "file:///$W/_sheet.html" 2>/dev/null
