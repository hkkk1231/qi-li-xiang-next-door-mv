# 七里香：隔壁

一支完全由代码绘制的 299 秒手绘动画 MV。项目使用 [p5.js](https://p5js.org/) 与 [p5.brush](https://github.com/acamposuribe/p5.brush)，角色与动画引擎基于 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) 扩展。

![封面](docs/cover.png)

故事发生在两户相邻的小院：搬家、风扇前的小误会、暴雨里共同护住七里香、短暂分别与重逢。五个连续场景共用同一条时间线，最终可以逐帧拼成完整影片。

## 仓库内容

- `src/scenes/`：五个连续章节的镜头与演出代码
- `src/clawd.js`、`src/heroine.js`：角色绘制、视角、表情和动作系统
- `src/world.js`、`src/props.js`、`src/weather.js`：院落、道具、植物与天气
- `src/subtitles.js`：底部字幕呈现逻辑
- `studio.html`：时间轴预览与逐帧渲染入口
- `render.mjs`：静帧、联系表、帧序列和视频渲染工具
- `docs/stage-plan.md`：五阶段结构与帧边界

## 运行

需要 Node.js 18+、Chrome 或 Chromium。

```bash
npm install
node render.mjs --sheet=18,63,102,183,272 --cols=3 --out=out/contact.jpg
```

渲染一段无声预览：

```bash
node render.mjs --clip --range=0:10 --out=out/preview.mp4
```

如需配入你合法持有的音频，请自行准备文件并显式传入：

```bash
node render.mjs --clip --range=0:10 --audio=/path/to/audio.flac --out=out/preview-with-audio.mp4
```

完整渲染计算量较大。可以先使用 `--sheet` 或较短的 `--range` 检查画面。

## 音频与歌词

仓库不包含周杰伦《七里香》的录音、完整歌词或最终成片。`src/lyrics.js` 只保留空的字幕数据结构；如有合法使用权，可在本地按 `[开始秒数, 结束秒数, 文本]` 的形式填入。

## 许可

本项目新增代码以 [MIT License](LICENSE) 发布。源自 ClaudeAnimationBase 的部分继续遵循 John Heibel 的 MIT 许可，副本见 `src/LICENSE-ClaudeAnimationBase.txt`。字体子集来自 LXGW WenKai，使用 SIL Open Font License 1.1，见 `public/fonts/OFL.txt`。

歌曲、录音与歌词版权归各自权利人所有，未包含在本仓库许可中。
