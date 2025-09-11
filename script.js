let ORIGINAL_WORDS = [];
let wordPool = [];

const KEYS = "A B C Ç D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ");
const MAX_ERRORS = 6;

let chosen, revealed, guessed, errors;

const $ = (sel) => document.querySelector(sel);
let wordEl, hintEl, keyboardEl, statusEl, livesEl, categoryEl;

async function loadWords() {
  try {
    const res = await fetch("https://anabeatrizfreitas.github.io/forca-palavras/palavras.json");
    const data = await res.json();
    ORIGINAL_WORDS = [...data]; // copia original
    wordPool = shuffleWords();  // embaralha uma vez
    startGame();
  } catch (err) {
    console.error("Erro ao carregar palavras:", err);
    if (statusEl) statusEl.textContent = "Erro ao carregar palavras.";
  }
}

function shuffleWords() {
  const copy = [...ORIGINAL_WORDS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c");
}

function pickWord() {
  console.log("Palavra escolhida:", item.w);
  if (wordPool.length === 0) {
    alert("Todas as palavras foram usadas! Reiniciando...");
    wordPool = shuffleWords();
  }
  const item = wordPool.pop();
  return {
    original: item.w.toUpperCase(),
    clean: normalize(item.w.toUpperCase()),
    hint: item.h || "Geral"
  };
}

function drawWord() {
  wordEl.innerHTML = "";
  for (let i = 0; i < chosen.original.length; i++) {
    const ch = chosen.original[i];
    const cleanCh = chosen.clean[i];
    const isLetter = /[A-Z]/.test(cleanCh);
    const show = !isLetter || revealed.has(cleanCh);
    const span = document.createElement("span");
    span.className = "slot" + (show ? " revealed" : "");
    span.textContent = show ? ch : "";
    wordEl.appendChild(span);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  KEYS.forEach((k) => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = k;
    btn.addEventListener("click", () => onGuess(k));
    keyboardEl.appendChild(btn);
  });
  window.addEventListener("keydown", onKeyDown);
}

function onKeyDown(e) {
  const key = e.key.toUpperCase();
  const map = normalize(key);
  if (/^[A-Z]$/.test(map)) onGuess(key);
  if (key === "ENTER" && (isWin() || isLose())) reset();
}

function onGuess(letter) {
  if (isWin() || isLose()) return;

  const mapped = normalize(letter.toUpperCase());
  if (guessed.has(mapped)) return;

  guessed.add(mapped);

  const btn = [...keyboardEl.children].find(b => normalize(b.textContent) === mapped);
  const hit = chosen.clean.includes(mapped);
  if (btn) {
    btn.disabled = true;
    btn.classList.add(hit ? "good" : "bad");
  }

  if (hit) {
    revealed.add(mapped);
    drawWord();
    updateStatus();
  } else {
    errors++;
    updateHangman();
    updateStatus();
  }
}

function updateHangman() {
  livesEl.textContent = (MAX_ERRORS - errors);
  for (let i = 0; i < MAX_ERRORS; i++) {
    const el = document.getElementById("p" + i);
    if (!el) continue;
    el.classList.toggle("show", i < errors);
  }
}

function isWin() {
  for (let i = 0; i < chosen.clean.length; i++) {
    const ch = chosen.clean[i];
    if (/[A-Z]/.test(ch) && !revealed.has(ch)) return false;
  }
  return true;
}

function isLose() {
  return errors >= MAX_ERRORS;
}

function updateStatus() {
  if (isWin()) {
    statusEl.className = "status win";
    statusEl.textContent = "Você venceu! Pressione Enter ou clique em Reiniciar.";
    lockKeyboard();
  } else if (isLose()) {
    statusEl.className = "status lose";
    statusEl.textContent = `Você perdeu… A palavra era: ${chosen.original}.`;
    revealAll();
    lockKeyboard();
  } else {
    statusEl.className = "status";
    statusEl.textContent = "";
  }
}

function revealAll() {
  for (const ch of chosen.clean) {
    if (/[A-Z]/.test(ch)) revealed.add(ch);
  }
  drawWord();
}

function lockKeyboard() {
  [...keyboardEl.children].forEach(b => b.disabled = true);
}

function unlockKeyboard() {
  [...keyboardEl.children].forEach(b => {
    b.disabled = false;
    b.classList.remove("good", "bad");
  });
}

function reset(preserveWord = true) {
  statusEl.textContent = "";
  statusEl.className = "status";
  errors = 0;
  revealed = new Set();
  guessed = new Set();
  updateHangman();
  unlockKeyboard();
  if (!preserveWord) chosen = pickWord();
  drawWord();
  hintEl.textContent = `Dica: ${chosen.hint}`;
  categoryEl.textContent = chosen.hint;
}

function startGame() {
  wordEl = $("#word");
  hintEl = $("#hint");
  keyboardEl = $("#keyboard");
  statusEl = $("#status");
  livesEl = $("#lives");
  categoryEl = $("#category");

  chosen = pickWord();
  buildKeyboard();
  reset(false);

  document.getElementById("reset").addEventListener("click", () => reset(true));
  document.getElementById("shuffle").addEventListener("click", () => {
    chosen = pickWord();
    reset(false);
  });
}

document.addEventListener("DOMContentLoaded", loadWords);
