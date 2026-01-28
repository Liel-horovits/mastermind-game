const level = new URLSearchParams(window.location.search).get("level") || "קל";
const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
let secretCode = [];
let currentGuess = ["", "", "", ""];
let attemptCount = 0;
let maxAttempts = (level === "קשה") ? 5 : (level === "בינוני") ? 10 : 15;
let isMuted = false;

const sounds = {
    bg: new Audio('https://storage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'),
    pop: new Audio('pop.mp3'),
    win: new Audio('win.wav'),
    fail: new Audio('fail.wav')
};
sounds.bg.loop = true;

function playSfx(sound) {
    if (!isMuted) { sound.currentTime = 0; sound.play().catch(() => {}); }
}

function initGame() {
    secretCode = [];
    let available = [...colors];
    for (let i = 0; i < 4; i++) {
        let idx = Math.floor(Math.random() * available.length);
        secretCode.push(available.splice(idx, 1)[0]);
    }
    createSidebar();
    createNewRow();
}

function createSidebar() {
    const sidebar = document.getElementById("color-sidebar");
    sidebar.innerHTML = "";
    colors.forEach(color => {
        const item = document.createElement("div");
        item.className = "color-option";
        item.style.backgroundColor = color;
        item.draggable = true;
        item.ondragstart = (e) => e.dataTransfer.setData("text", color);
        sidebar.appendChild(item);
    });
}


function renderFeedback(bulls, hits) {
    const row = document.getElementById(`row-${attemptCount}`);
    const feedbackContainer = document.createElement("div");
    feedbackContainer.className = "feedback-container";
    feedbackContainer.style.cssText = "display: flex; flex-wrap: wrap; width: 40px; margin-right: 10px;";
    
    for (let i = 0; i < bulls; i++) addDot(feedbackContainer, "black");
    for (let i = 0; i < hits; i++) addDot(feedbackContainer, "white");
    
    row.appendChild(feedbackContainer);
}

function addDot(parent, color) {
    const dot = document.createElement("span");
    dot.style.cssText = `
        display: inline-block; 
        width: 12px; 
        height: 12px; 
        border-radius: 50%; 
        background: ${color}; 
        margin: 2px; 
        border: 1px solid #ccc;
    `;
    parent.appendChild(dot);
}

function createNewRow() {
    if (attemptCount >= maxAttempts) return;
    attemptCount++;
    const board = document.getElementById("board");
    const row = document.createElement("div");
    row.className = "guess-row";
    row.id = `row-${attemptCount}`;
    currentGuess = ["", "", "", ""];

    for (let i = 0; i < 4; i++) {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.ondragover = (e) => e.preventDefault();
        slot.ondrop = (e) => {
            e.preventDefault();
            const color = e.dataTransfer.getData("text");
            if (currentGuess.includes(color)) return;
            playSfx(sounds.pop);
            slot.style.backgroundColor = color;
            currentGuess[i] = color;
            if (currentGuess.filter(c => c !== "").length === 4) setTimeout(checkGuess, 200);
        };
        row.appendChild(slot);
    }
    board.appendChild(row);
    document.getElementById("score").innerText = `ניסיון: ${attemptCount} / ${maxAttempts}`;
}

function checkGuess() {
    let bulls = 0, hits = 0;
    let tempSecret = [...secretCode];
    currentGuess.forEach((c, i) => {
        if (c === secretCode[i]) { bulls++; tempSecret[i] = null; }
    });
    currentGuess.forEach((c, i) => {
        if (c !== null && tempSecret.includes(c)) {
            hits++; tempSecret[tempSecret.indexOf(c)] = null;
        }
    });

    renderFeedback(bulls, hits);

    if (bulls === 4) showEndScreen("🏆 ניצחת!", "כל הכבוד!", "#FFD700");
    else if (attemptCount >= maxAttempts) showEndScreen("😔 הפסדת", `הקוד: ${secretCode.join(", ")}`, "#FF4500");
    else createNewRow();
}

function showEndScreen(title, msg, color) {
    sounds.bg.pause();
    playSfx(title.includes("ניצחת") ? sounds.win : sounds.fail);
    document.getElementById("game-modal").style.display = "flex";
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-title").style.color = color;
    document.getElementById("modal-text").innerText = msg;
    if (title.includes("ניצחת")) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10001 });
    }
}

window.onload = () => {
    initGame();
    const startBtn = document.getElementById("start-btn");
    const startScreen = document.getElementById("start-screen");

    startBtn.onclick = () => {
        startScreen.classList.add("hidden");
        if (!isMuted) sounds.bg.play().catch(() => {});
        
        const scoreDiv = document.getElementById("score");
        scoreDiv.innerHTML = "<span style='color: #00d4ff;'>בהצלחה! מתחילים...</span>";
        setTimeout(() => { scoreDiv.innerText = `ניסיון: 1 / ${maxAttempts}`; }, 1500);
    };

    document.getElementById("mute-btn").onclick = function() {
        isMuted = !isMuted;
        this.innerText = isMuted ? "🔇" : "🔊";
        sounds.bg.muted = isMuted;
    };

    document.getElementById("modal-restart").onclick = () => window.location.reload();
};