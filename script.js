let ORIGINAL_WORDS = [];
let wordPool = [];
const KEYS = "A B C Ç D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ");
let character = null;
let chosen, revealed, guessed, errors;
const MAX_ERRORS = 8;

const $ = (sel) => document.querySelector(sel);
let wordEl = $("#word");
let hintEl = $("#hint");
let keyboardEl = $("#keyboard");
let statusEl = $("#status");

function normalize(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c");
}

function shuffleWords() {
  const copy = [...ORIGINAL_WORDS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWord() {
  if (wordPool.length === 0) {
    alert("Todas as palavras foram usadas! Reiniciando...");
    wordPool = shuffleWords();
  }
  const item = wordPool.pop();
  return {
    original: item.w,
    clean: normalize(item.w),
    hint: item.h,
    dica: item.dica
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
    updateStatus();
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
    statusEl.textContent = "Você venceu!";
  } else if (isLose()) {
    statusEl.className = "status lose";
    statusEl.textContent = `Você perdeu… A palavra era: ${chosen.original}.`;
  } else {
    statusEl.className = "status";
    statusEl.textContent = "";
  }
}

function reset() {
  errors = 0;
  revealed = new Set();
  guessed = new Set();
  drawWord();
  buildKeyboard();
  updateStatus();
}

async function loadWordsFromTheme(theme) {
  try {
    const res = await fetch(`palavras/${theme}/palavras.json`);
    const data = await res.json();
    ORIGINAL_WORDS = data.map(item => ({
      w: item.w.toUpperCase(),
      dica: item.dica || "Sem dica",
      h: theme
    }));
    wordPool = shuffleWords();
    chosen = pickWord();
    reset();
  } catch (err) {
    alert("Erro ao carregar palavras.");
  }
}

document.getElementById("girl").addEventListener("click", () => {
  character = "girl";
});

document.getElementById("boy").addEventListener("click", () => {
  character = "boy";
});

document.querySelectorAll("#theme-select button").forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme;
    loadWordsFromTheme(theme);
  });
});
