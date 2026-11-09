# 🖥️ Ybarpc - 千禧网吧模拟电脑（Millennium Cybercafe Simulator）

> *"Y=Y2K/Youth（青春）/Yesterday（昨天）/You（你）/ Yawn（哈欠）。"*

### 📡 在线体验live demo
* 🖥️ **[主终端 Ybarpc](https://nancco.github.io/ybarpc)**
* 🟩 **[绿屏 MP3](https://nancco.github.io/ybarpc/mp3.html)** - 复古 MP3
* ⚫ **[黑胶唱片机](https://nancco.github.io/ybarpc/record.html)** - 黑胶物理换碟、底噪效果
* 📺 **[赛博电视机](https://nancco.github.io/ybarpc/tv.html)** - 黑胶物理换碟、底噪效果

### 🏠 主模拟器 Ybarpc

* Windows98 复古 UI，可拖动窗口、还原卡重启机制
* 56K Modem 拨号 + 实体座机交互，拿起听筒拨号，挂断直接断网
* 完整模拟计费系统，真实时钟计时，余额扣费、上机时长提醒
* 海量老网游 / 单机游戏图标，网游带大区选择、语音播报上机登录
* 开机 BIOS 自检、关机界面、CRT 扫描线眩光、随机程序非法操作报错
* TTS 语音网管播报，全套原生 Web Audio 系统音效

### 🎵 附属子项目

1. **绿屏 MP3 播放器**
   - 支持本地 SD 卡音频上传、网络音频直链播放
   - 复古 LCD 绿屏 UI，频谱可视化
   - **FM 调频模拟：比特粉碎、带宽限制，复刻老式收音机音质效果**
   - 支持 TXT/LRC 文本阅读、A‑B 复读、多套 EQ 音效、多种播放模式
2. **黑胶唱片机**：物理换碟、黑胶底噪模拟
3. **赛博电视机**：CRT 雪花、扫描线，复古电视画面
   ## 📂 源码说明

> ⚠️ 下面两个 JS 文件**仅用于学习查阅、源码备份，项目运行不会引入调用这两个文件**。
> 所有实际运行代码全部已经内嵌到各个 HTML 页面，任意单个 HTML 下载后双击本地即可直接打开运行。

- 🔔 [ics‑audio.js](./ics-audio.js)：通用音频底层，系统提示音、TTS 语音合成模块
- 📻 [fm‑sim.js](./fm-sim.js)：**老式 FM 调频收音机模拟模块**，比特粉碎、带宽失真、EQ、频谱分析，可独立复用至其他网页音频项目

  ## 🛠️ 本地运行

1. 下载仓库全部源码
2. 直接**双击打开各个 html 文件即可体验**

> 
> 因为音频代码全部内嵌在 HTML 内，不需要开启 web 服务器，本地 file 协议直接可以跑。
> 注意：部分浏览器本地 file 协议会限制部分语音 TTS 功能，部署到 http/https 服务器可以解锁全部能力。
---
*Powered by Pure HTML/CSS/JS. No frameworks were harmed in the making of this project.*
