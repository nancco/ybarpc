/*
 * fm‑sim.js
 * 千禧年代调频FM收音机模拟音频处理模块
 * ⚠️ 注意：此文件仅用作学习阅读、源码备份。
 * 实际 mp3.html 内部已经内嵌完整副本，项目HTML不会引入调用本文件。
 * 你可以复制这份代码移植到自己的网页音频项目。
 * 功能：低通滤波、bit‑crush比特粉碎、模拟老旧收音机音质失真、EQ均衡、频谱分析
 */

let audioCtx = null,
    source = null,
    lowpass = null,
    crusher = null,
    eqFilter = null,
    masterGain = null,
    analyser = null,
    ctxReady = false,
    crusherMode = null;

let scriptBits = 8;
let scriptReduction = 3;
let scriptPhase = 0;
let scriptHold = [0, 0];

// 初始化音频链路：模拟老式调频收音机信号链路
async function initFmSim(audioElement) {
    if (ctxReady) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audioElement);

    lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 6000;
    lowpass.Q.value = 0.7;

    eqFilter = audioCtx.createBiquadFilter();
    eqFilter.type = 'peaking';
    eqFilter.frequency.value = 1000;
    eqFilter.gain.value = 0;
    eqFilter.Q.value = 1;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 32;

    // AudioWorklet 比特粉碎，模拟调频信号劣化；降级到scriptProcessor兼容旧浏览器
    const workletCode = `
class CrushProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            { name: 'bits', defaultValue: 8 },
            { name: 'reduction', defaultValue: 3 }
        ];
    }
    constructor() {
        super();
        this.phase = 0;
        this.hold = [0, 0];
    }
    process(inputs, outputs, parameters) {
        const input = inputs[0], output = outputs[0];
        if (!input || !input.length) return true;
        const bits = parameters.bits[0];
        const red = Math.max(1, Math.floor(parameters.reduction[0]));
        const levels = Math.pow(2, bits - 1);
        const len = output[0].length;
        for (let i = 0; i < len; i++) {
            const doHold = this.phase === 0;
            for (let ch = 0; ch < output.length; ch++) {
                const inCh = input[ch] || input[0];
                let s = inCh[i];
                if (doHold) {
                    s = Math.round(s * levels) / levels;
                    if (s > 1) s = 1;
                    if (s < -1) s = -1;
                    this.hold[ch] = s;
                }
                output[ch][i] = this.hold[ch];
            }
            this.phase = (this.phase + 1) % red;
        }
        return true;
    }
}
registerProcessor('crush-processor', CrushProcessor);
`;
    try {
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        await audioCtx.audioWorklet.addModule(url);
        crusher = new AudioWorkletNode(audioCtx, 'crush-processor');
        crusherMode = 'worklet';
    } catch (err) {
        crusher = audioCtx.createScriptProcessor(4096, 2, 2);
        crusherMode = 'script';
        crusher.onaudioprocess = (ev) => {
            const inp = ev.inputBuffer;
            const out = ev.outputBuffer;
            const nch = out.numberOfChannels;
            const len = out.getChannelData(0).length;
            const levels = Math.pow(2, scriptBits - 1);
            const red = Math.max(1, Math.floor(scriptReduction));
            for (let i = 0; i < len; i++) {
                const doHold = scriptPhase === 0;
                for (let ch = 0; ch < nch; ch++) {
                    const inCh = inp.numberOfChannels > ch ? inp.getChannelData(ch) : inp.getChannelData(0);
                    const outCh = out.getChannelData(ch);
                    let s = inCh[i];
                    if (doHold) {
                        s = Math.round(s * levels) / levels;
                        if (s > 1) s = 1;
                        if (s < -1) s = -1;
                        scriptHold[ch] = s;
                    }
                    outCh[i] = scriptHold[ch];
                }
                scriptPhase = (scriptPhase + 1) % red;
            }
        };
    }

    // 音频信号链路：源 →低通(模拟FM带宽限制) →比特粉碎(信号劣化) →EQ →音量 →频谱分析 →输出扬声器
    source.connect(lowpass);
    lowpass.connect(crusher);
    crusher.connect(eqFilter);
    eqFilter.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    ctxReady = true;
}

// 设置调频音质预设，模仿不同年代收音机信号质量
function applyFmQuality(presetName) {
    if (!ctxReady) return;
    const presets = {
        original: { freq: 20000, bits: 16, reduction: 1 },
        high: { freq: 9000, bits: 10, reduction: 2 },
        mid: { freq: 6000, bits: 8, reduction: 3 },   // 典型老式调频收音机
        low: { freq: 4000, bits: 7, reduction: 4 },   // 信号弱、有干扰
        vlow: { freq: 2800, bits: 6, reduction: 6 }  // 干扰严重、噪声大
    };
    const p = presets[presetName] || presets.mid;
    const now = audioCtx.currentTime;
    lowpass.frequency.setTargetAtTime(p.freq, now, 0.15);
    if (crusherMode === 'worklet') {
        crusher.parameters.get('bits').setTargetAtTime(p.bits, now, 0.15);
        crusher.parameters.get('reduction').setTargetAtTime(p.reduction, now, 0.15);
    } else {
        scriptBits = p.bits;
        scriptReduction = p.reduction;
    }
}

// EQ均衡：正常 /重低音 /流行，收音机的音调调节
function applyFmEQ(index) {
    if (!ctxReady) return;
    const now = audioCtx.currentTime;
    if (index === 0) {
        eqFilter.type = 'peaking';
        eqFilter.frequency.setTargetAtTime(1000, now, 0.2);
        eqFilter.gain.setTargetAtTime(0, now, 0.2);
    } else if (index === 1) {
        eqFilter.type = 'lowshelf';
        eqFilter.frequency.setTargetAtTime(200, now, 0.2);
        eqFilter.gain.setTargetAtTime(10, now, 0.2);
    } else if (index === 2) {
        eqFilter.type = 'peaking';
        eqFilter.frequency.setTargetAtTime(2500, now, 0.2);
        eqFilter.gain.setTargetAtTime(6, now, 0.2);
    }
}

// 获取分析器，用于绘制频谱柱状条（收音机屏幕频谱）
function getAnalyser() {
    return analyser;
}

async function ensureFmAudio() {
    if (!ctxReady) throw new Error('fm模拟未初始化');
    if (audioCtx.state === 'suspended') await audioCtx.resume();
}
