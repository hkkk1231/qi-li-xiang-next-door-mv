# 七里香 · 版本D《隔壁》: stage plan

One continuous film on the original song timeline (`public/audio/qi-li-xiang.flac`, 299.000 s). Every stage is a
range of that one timeline, rendered by the same code (`src/`), so approved stages join frame-exactly. Each stage is
made, rendered through the shared Windows bridge, and then held for the user's review. The next stage starts only
after the user explicitly approves it.

## Shared settings (all stages)

| setting | value |
|---|---|
| picture | 1920 × 1080, 16:9, 24 fps constant |
| video | H.264 (libx264 `slow`, CRF 17, yuv420p, 2 s closed GOPs; each stage file starts on a keyframe) |
| review audio | the song's own segment for the stage's range, AAC 256 kb/s, 48 kHz |
| subtitles | Simplified Chinese lyrics only, bottom centre, LXGW WenKai Medium 52 px, cream with an ink edge, timed from `src/lyrics.js` |
| tempo lock | 71.1 BPM, first downbeat at 0.29 s (measured from this recording); every idle and bounce follows it |
| style | JohnHeibel/ClaudeAnimationBase: p5.brush washes and ink, boiling linework, flat 2D, no lettering in the picture |
| cast | Clawd (terracotta) and the approved pink heroine (`references/characters/clawd-heroine`), at 0.86 × Clawd's size |

## Stages

Boundaries fall in gaps between sung lines, on whole frames.

| stage | song time | frames | music | story |
|---|---|---|---|---|
| 1 | 0:00.000–0:54.000 | 0–1295 | intro, verse 1 | Moving day: the box tower, the box that lands on her head. Days later: the shirt in the gust, the stray cat that picks his head. |
| 2 | 0:54.000–1:47.625 | 1296–2582 | verse 2, chorus 1 (first half) | The fan at dusk: he scoots over and pats the spot in front of the fan; she comes round to share it, and the cat curls up between them. The storm: he leans over the cutting as its roof, she leans in from the other side, and they laugh in the rain. |
| 3 | 1:47.625–2:41.250 | 2583–3869 | chorus 1 (second half), interlude | Two lit windows across the rain, lights on, off, on. The seasons turn on the fixed courtyard: doors open together each morning, the cat sleeps on the fence. |
| 4 | 2:41.250–3:35.625 | 3870–5174 | chorus 2, bridge | His short trip: a dark window, she keeps his yard, pushing the leaves with her whole body. Home at sunset; the 七里香 has bloomed; a breeze gives her a sprig; the near-kiss. |
| 5 | 3:35.625–4:59.000 | 5175–7175 | final chorus, outro | Warm rain under the flowering hedge; the loose fence board pushed aside together; lanterns, the fan for two; the opening rhymed and a fade back to paper. |

Each stage is rendered with `node scripts/render.mjs --clip --range=<a>:<b> --workers=4 --out=out/stages/stage-0N.mp4`.
The renderer writes `stage-0N.json` beside the video with the exact frame range and settings.

## Joining the approved stages

1. Check each stage's `.json`: the frame ranges must be contiguous (0–1295, 1296–2582, …, 5175–7175) and the settings the same.
2. Concatenate the stages' video streams in order without re-encoding (`ffmpeg -f concat … -map 0:v -c copy`).
3. Mux the complete song once (AAC from the master FLAC) over the joined picture, so there is no audio seam at any join.

Because every frame is a pure function of song time, any approved stage can also be re-rendered from the same source
revision if a file is ever lost.
