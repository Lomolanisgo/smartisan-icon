# 锤子风格图标重绘 · 设计规范（所有 subagent 共用）

仓库：`D:\Others-Github\smartisan_icon`（下文路径均相对仓库根目录）

## 目标

为手机上没有锤子图标的应用，每个出 **至少 2 个** 设计方案（A、B，可加 C），供用户挑选。
只在 `iconpack/designs/all/<包名>/` 下工作；**不要**改动 `iconpack/overrides`、`iconpack/png`、`iconpack/raw` 等其它目录，不要 git 提交。

## 第一步：找功能近似的锤子图标做参考（必须做）

锤子图标包里有约 1760 个图标，文件名就是包名：`iconpack/png/<包名>.png`（192×192，透明底）。
1. 先看应用现在的图标：`iconpack/phone-icons/<iconFile>`（SVG），了解品牌颜色和标志。
2. 按功能在 `iconpack/png` 里搜近似应用（用 Glob 匹配包名关键词），例如：
   - 银行/支付：`*bank*`、`*pay*`、`*alipay*`、`*unionpay*`、`*cmb*`、`*icbc*`
   - 日历/时钟/提醒：`*calendar*`、`*clock*`、`*deskclock*`、`*reminder*`、`*todo*`
   - 电话/联系人/短信/设置：`*dialer*`、`*contacts*`、`*mms*`、`*messaging*`、`*settings*`
   - 笔记/文档/表格：`*note*`、`*evernote*`、`*wps*`、`*office*`、`*youdao*`
   - 地图/出行/火车/航空：`*map*`、`*railway*`、`*12306*`、`*ctrip*`、`*air*`、`*didi*`
   - 外卖/购物/快递：`*taobao*`、`*jd*`、`*meituan*`、`*ele*`、`*express*`、`*sf*`、`*kuaidi*`
   - 天气/新闻/播客/音乐：`*weather*`、`*news*`、`*podcast*`、`*music*`
   - 终端/开发/VPN/安全：`*terminal*`、`*github*`、`*vpn*`、`*security*`、`*safe*`
   - 健身/健康/相机：`*fit*`、`*health*`、`*sport*`、`*camera*`
   打开（Read）找到的 PNG 看是否真的近似。
3. 有近似的：**参考它的造型语言**（外形、材质、隐喻、光影），让新图标像它的“兄弟”，同时保留本应用的品牌识别（颜色、标志）。
4. 没有近似的：从下面四种轮廓中选择设计。

同时建议看一下用户已认可的定稿，把握质量标准：
`iconpack/overrides/icons/*.png`（微信、多邻国、Claude、ChatGPT、Edge、Apple Music、抖音、bilibili 等）。

## 轮廓（没有近似参考时使用；有参考时也可使用）

画布统一 **256×256，透明背景**。四种基础轮廓，**允许内容超出边框**（如多邻国头顶的羽毛、微信气泡的尾巴），但不能超出画布。

| 轮廓 | 规格 |
| --- | --- |
| 横矩形 landscape | 与 bilibili 国际版完全一致：x 3.06–252.94，y 23–232.93，超椭圆圆角 r=24，**无外投影**，1px 描边 + 内侧明暗。路径和图层见 `iconpack/designs/tile-spec/spec.md`，参考实现 `tile-spec/tile.svg` |
| 竖矩形 portrait | 横矩形旋转 90°（同小红书 `iconpack/png/com.xingin.xhs.png`）：x 23–232.93，y 3.06–252.94 |
| 方形 square | 超椭圆圆角方块，x/y 均为 4–252（248×248，与圆形和锤子原图同大；226 偏小已弃用），圆角 r=24，描边与明暗同上 |
| 圆形 circle | 直径 248，圆心 (128,128)；可参考锤子里的圆形徽章类图标（如 `com.netease.cloudmusic.png`、`com.chinamworld.bocmbci.png`） |
| 异形 free | 标志本身做成立体物件、无底板（如中国银行、ChatGPT 定稿的做法） |

同一应用的 A、B 方案要**明显不同**（换轮廓、换隐喻或换材质），不要只是换颜色。

## 锤子风格要点

拟物、写实材质（玻璃、金属、纸、陶瓷、毛毡、皮革…），光源在上方，柔和渐变与高光，
细节精致但 48px 下仍然清晰可辨；品牌主色要保留，标志形状要忠实（可从 phone-icons 的 SVG 中复制路径）。
文字尽量少；如必须有文字，把文字转成路径或使用系统必有字体（Microsoft YaHei / Segoe UI），并确认渲染正确。

## 交付格式（严格遵守，汇总页面靠它自动生成）

每个应用一个目录 `iconpack/designs/all/<包名>/`：

- `opt-A.svg`、`opt-A.png`，`opt-B.svg`、`opt-B.png`（可选 `opt-C.*`）
  - SVG：viewBox `0 0 256 256`，手写矢量，渐变/滤镜可用，**不引用外部文件**
  - PNG：256×256 透明背景，用下面的渲染脚本生成
- `meta.json`（UTF-8）：

```json
{
  "pkg": "com.example.app",
  "label": "应用名",
  "references": [
    { "pkg": "com.tencent.mm", "why": "同为聊天应用，参考其气泡造型" }
  ],
  "options": [
    { "id": "A", "name": "方案短名（中文）", "shape": "landscape", "desc": "一两句中文说明：做法、参考了什么、优缺点" },
    { "id": "B", "name": "方案短名（中文）", "shape": "circle", "desc": "……" }
  ]
}
```

`references` 没有近似参考时写空数组 `[]`；`shape` 取 `landscape` / `portrait` / `square` / `circle` / `free`。

## 渲染

```powershell
powershell -ExecutionPolicy Bypass -File iconpack\designs\all\render.ps1 -Dir iconpack\designs\all\<包名>
```

把目录下所有 `opt-*.svg` 渲染成同名 256×256 透明 PNG（每次使用独立的 Chrome 配置目录，可并行运行）。
渲染后务必 Read 查看 PNG，发现问题就修改 SVG 重新渲染，直到满意。

## 完成后回复

简短列出每个应用：参考了哪些锤子图标（或无），A/B 各是什么，以及需要用户决定的问题。
