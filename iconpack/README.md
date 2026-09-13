# 锤子图标包（Android / 三星 One UI）

把锤子官方图标（约 1760 个应用）打包成标准图标包 APK（Nova/ADW 格式），可用于：

- **三星 One UI 自带桌面**：通过 Theme Park 应用
- 第三方桌面：Nova、Lawnchair、Smart Launcher 等

## 构建

需要 Node.js 18+、JDK 17、Android SDK 命令行工具。

```powershell
node iconpack\scripts\download.mjs      # 下载图标到 iconpack/raw
powershell -ExecutionPolicy Bypass -File iconpack\build.ps1 -SdkRoot <Android SDK 路径>
```

产物：

- `iconpack/build/smartisan-icons.apk`：图标包 APK
- `iconpack/png/<包名>.png`：单独的 PNG 图标，可用于手动替换

## 测试界面

```powershell
node iconpack\tester\server.mjs   # 打开 http://127.0.0.1:5173
```

可搜索包名 / Activity，按匹配方式筛选，预览 One UI 圆角形状，查看锤子提供的候选图，并复制“修改请求”。
自定义图标放在 `iconpack/overrides`，说明见 [overrides/README.md](overrides/README.md)。

### 对比手机上的应用

手机开启 USB 调试并连接电脑后：

```powershell
node iconpack\scripts\phone-apps.mjs    # 读取桌面应用列表 → iconpack/phone-apps.json
node iconpack\scripts\phone-icons.mjs   # 提取这些应用现在的图标 → iconpack/phone-icons
node iconpack\scripts\phone-usage.mjs   # 读取使用时长 / 启动次数 / 最近使用时间
```

然后在测试界面切换到“我的手机”，查看哪些应用没有锤子图标以及它们现在的样子，可按使用时长排序。
重新运行 `phone-apps.mjs` 会覆盖应用名、图标和使用情况字段，需要再依次运行 `phone-icons.mjs` 和 `phone-usage.mjs`。

## 在三星 S25 Edge（One UI 8）上使用

1. 把 APK 传到手机并安装（需要允许“安装未知应用”）
2. 在 Galaxy Store 安装 **Theme Park**
3. Theme Park → 图标 → 创建新图标 → 选择 **第三方**（Third Party）→ 选“锤子图标包”
4. 应用即可在 One UI 桌面、抽屉、设置等处看到锤子图标

未收录的应用会保持原图标，也可以在 Theme Park 中逐个替换为 `iconpack/png` 里的图标。

## 限制

- 锤子已停止更新，新应用没有对应图标
- 约 820 个应用没有已知的启动 Activity，只按包名匹配，部分桌面可能匹配不到
