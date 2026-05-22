var display = document.getElementById('timer-display');
var modeLabel = document.getElementById('mode-label');
var btnStart = document.getElementById('btn-start');
var btnPause = document.getElementById('btn-pause');
var btnReset = document.getElementById('btn-reset');
var focusInput = document.getElementById('focus-input');
var breakInput = document.getElementById('break-input');
var histList = document.getElementById('history-list');
var emptyNote = document.getElementById('empty-note');
var circle = document.getElementById('progress-circle');

var radius = 108;
var circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = 0;

var timerInterval = null;
var isRunning = false;
var isBreak = false;
var totalSecs = 0;
var timeLeft = 0;

function getFocusMins() {
    var v = parseInt(focusInput.value);
    return (isNaN(v) || v < 1) ? 25 : v;
}

function getBreakMins() {
    var v = parseInt(breakInput.value);
    return (isNaN(v) || v < 1) ? 5 : v;
}

function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function updateCircle() {
    var fraction = timeLeft / totalSecs;
    var offset = circumference * (1 - fraction);
    circle.style.strokeDashoffset = offset;
}

function setModeStyle() {
    if (isBreak) {
        modeLabel.textContent = 'Break';
        modeLabel.className = 'mode-label break';
        circle.className = 'timer-progress break';
    } else {
        modeLabel.textContent = 'Focus';
        modeLabel.className = 'mode-label';
        circle.className = 'timer-progress';
    }
}

function playBeep() {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1);
    } catch (e) { }
}

function getTodayKey() {
    var d = new Date();
    return 'pomo_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate();
}

function loadHistory() {
    var key = getTodayKey();
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
}

function saveSession(label) {
    var key = getTodayKey();
    var list = loadHistory();
    list.push(label);
    localStorage.setItem(key, JSON.stringify(list));
}

function renderHistory() {
    var list = loadHistory();
    histList.innerHTML = '';
    if (list.length === 0) {
        emptyNote.style.display = 'block';
        return;
    }
    emptyNote.style.display = 'none';
    list.forEach(function (item) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="checkmark">✓</span> ' + item;
        histList.appendChild(li);
    });
}

function getTimeString() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ampm;
}

function tick() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        playBeep();

        if (!isBreak) {
            var mins = getFocusMins();
            var label = mins + ':00 focus — ' + getTimeString();
            saveSession(label);
            renderHistory();
        }

        isBreak = !isBreak;
        setModeStyle();
        totalSecs = (isBreak ? getBreakMins() : getFocusMins()) * 60;
        timeLeft = totalSecs;
        display.textContent = formatTime(timeLeft);
        updateCircle();

        btnStart.disabled = false;
        btnPause.disabled = true;
        btnStart.textContent = 'Start';
        startTimer();
        return;
    }

    timeLeft--;
    display.textContent = formatTime(timeLeft);
    updateCircle();
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnStart.textContent = 'Running';
    modeLabel.className = isBreak ? 'mode-label break' : 'mode-label';
    timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
    btnStart.textContent = 'Resume';
    modeLabel.textContent = 'Paused';
    modeLabel.className = 'mode-label paused';
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isBreak = false;
    totalSecs = getFocusMins() * 60;
    timeLeft = totalSecs;
    display.textContent = formatTime(timeLeft);
    circle.style.strokeDashoffset = 0;
    setModeStyle();
    btnStart.disabled = false;
    btnStart.textContent = 'Start';
    btnPause.disabled = true;
}

btnStart.addEventListener('click', function () {
    if (!isRunning) {
        if (timeLeft === 0) {
            totalSecs = (isBreak ? getBreakMins() : getFocusMins()) * 60;
            timeLeft = totalSecs;
        }
        startTimer();
    }
});

btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);

focusInput.addEventListener('change', function () {
    if (!isRunning && !isBreak) {
        totalSecs = getFocusMins() * 60;
        timeLeft = totalSecs;
        display.textContent = formatTime(timeLeft);
        circle.style.strokeDashoffset = 0;
    }
});

breakInput.addEventListener('change', function () {
    if (!isRunning && isBreak) {
        totalSecs = getBreakMins() * 60;
        timeLeft = totalSecs;
        display.textContent = formatTime(timeLeft);
        circle.style.strokeDashoffset = 0;
    }
});

resetTimer();
renderHistory();