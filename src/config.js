// config.js: project settings. One continuous 299-second timeline; every stage is a range of it.
//   bpm / offset: measured from the recording (onset autocorrelation over the whole song): 71.1 BPM, first downbeat at
//                 0.29 s, so bar n starts at 0.29 + n · 3.3755 s. Every idle, bounce and pulse() locks to it.
//   fps: 24 for every stage, so approved stages join frame-exactly.
// Commercial audio is intentionally not distributed. Pass --audio=/path/to/your/licensed/audio when rendering.
const PROJECT = { duration: 299, bpm: 71.1, offset: 0.29, fps: 24, audio: '' };
