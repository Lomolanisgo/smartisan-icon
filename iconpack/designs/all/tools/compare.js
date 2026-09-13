const fs=require("fs");const m=JSON.parse(fs.readFileSync("emblem-meta.json"));const d=fs.readFileSync("emblem-path.txt","utf8");
const b64=fs.readFileSync("src1.png").toString("base64");
const pad=6,vw=m.maxx+1-m.minx+2*pad,vh=m.maxy+1-m.miny+2*pad;
const P=400,H=Math.round(P*vh/vw);
const vb=`viewBox="${m.minx-pad} ${m.miny-pad} ${vw} ${vh}"`;
const orig=(x)=>`<svg x="${x}" y="30" width="${P}" height="${H}" ${vb}><image href="data:image/png;base64,${b64}" width="432" height="432" style="image-rendering:pixelated"/></svg>`;
const tr=`translate(${m.cx} ${m.cy}) scale(${1/m.sc})`;
const path=(x,extra)=>`<svg x="${x}" y="30" width="${P}" height="${H}" ${vb}><path transform="${tr}" d="${d}" ${extra}/></svg>`;
const L=(x,t)=>`<text x="${x}" y="20" font-family="Segoe UI" font-size="16">${t}</text>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${3*P+40}" height="${H+40}"><rect width="100%" height="100%" fill="#fff"/>
${L(10,"original emblem (phone-icons PNG)")}${L(P+30,"extracted vector path")}${L(2*P+50,"overlay: original + path outline (cyan)")}
${orig(0)}${path(P+20,'fill="#E8261C"')}${orig(2*P+40)}${path(2*P+40,'fill="none" stroke="#00B4FF" stroke-width=".4"')}
</svg>`;
fs.writeFileSync("compare.svg",svg);
