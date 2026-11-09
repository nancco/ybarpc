var audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playClickSound() {
    initAudio();
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(1200, audioCtx.currentTime);
    g.gain.setValueAtTime(.025, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .025);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + .03);
}
function playBootSound() {
    initAudio();
    var now = audioCtx.currentTime;
    var beep = function (freq, start) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'square'; o.frequency.value = freq;
        g.gain.setValueAtTime(.05, start); g.gain.setValueAtTime(0, start + .1);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(start); o.stop(start + .1);
    };
    beep(880, now); beep(1320, now + .12);
}
function playShutdownSound() {
    initAudio();
    var now = audioCtx.currentTime;
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, now);
    o.frequency.exponentialRampToValueAtTime(80, now + .45);
    g.gain.setValueAtTime(.09, now); g.gain.exponentialRampToValueAtTime(.001, now + .55);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now); o.stop(now + .55);
}
function playLoginSound() {
    initAudio();
    var now = audioCtx.currentTime;
    var note = function (freq, start) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(.05, start + .05);
        g.gain.exponentialRampToValueAtTime(.001, start + .22);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(start); o.stop(start + .22);
    };
    note(1046.5, now); note(1318.5, now + .1);
}
function playErrorSound() {
    initAudio();
    var now = audioCtx.currentTime;
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 200;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.04, now + .02);
    g.gain.linearRampToValueAtTime(0, now + .2);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now); o.stop(now + .2);
}
function playDialupSound() {
    initAudio();
    var now = audioCtx.currentTime;
    var beep = function (f1, f2, start, dur) {
        var o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator(), g = audioCtx.createGain();
        o1.frequency.value = f1; o2.frequency.value = f2;
        g.gain.setValueAtTime(.035, start); g.gain.setValueAtTime(0, start + dur);
        o1.connect(g); o2.connect(g); g.connect(audioCtx.destination);
        o1.start(start); o1.stop(start + dur); o2.start(start); o2.stop(start + dur);
    };
    beep(697, 1209, now, .1);
    beep(770, 1477, now + .15, .1);
    beep(941, 1336, now + .6, .1);
    var sTime = now + .9;
    var buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    var noise = audioCtx.createBufferSource(); noise.buffer = buffer;
    var nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0, sTime); nGain.gain.linearRampToValueAtTime(.025, sTime + .1);
    var filter = audioCtx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1200;
    noise.connect(filter); filter.connect(nGain); nGain.connect(audioCtx.destination);
    noise.start(sTime); noise.stop(sTime + 3);
}
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'zh-CN'; msg.rate = 1.0; msg.pitch = .95;
        window.speechSynthesis.speak(msg);
    }
}
