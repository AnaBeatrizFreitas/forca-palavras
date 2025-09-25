let ORIGINAL_WORDS = [];
let wordPool = [];

const KEYS = "A B C Ç D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ");
let MAX_ERRORS = 8;
let character = null;

let chosen, revealed, guessed, errors;

const $ = (sel) => document.querySelector(sel);
let wordEl, hintEl, keyboardEl, statusEl, livesEl, categoryEl;

const SHAPES = {
  girl: {
    p6: "M165 75 Q190 50 215 75",
    p7: "M182 80 L190 70 L198 80 L190 90 Z"
  },
  boy: {
    p6: "M165 75 L215 75 L190 50 Z",
    p7: "M175 200 L175 240 M205 200 L205 240"
  }
};

async function loadWordsFromTheme(theme) {
  try {
    const res = await fetch(`palavras/${theme}/palavras.json`);
    const data = await res.json();

    ORIGINAL_WORDS = data.filter(item =>
      item.w && typeof item.w === "string"
    ).map(item => ({
      w: item.w.toUpperCase(),
      dica: item.dica || "Sem dica disponível",
      h: theme.replace(/-/g, " ")
    }));

    wordPool = shuffleWords();
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

    if ((MAX_ERRORS - errors) === 3) {
      hintEl.textContent = "";

      const contextual = document.getElementById("contextual-hint");
      if (contextual) {
        const palavraFormatada = chosen.original
          .split("")
          .map((ch) => revealed.has(normalize(ch)) ? ch : "_")
          .join(" ");

        contextual.innerHTML = `
          <div><strong>Tema:</strong> ${chosen.hint}</div>
          <div><strong>Palavra:</strong> ${palavraFormatada}</div>
          <div><strong>Dica:</strong> ${chosen.dica}</div>
        `;
        contextual.style.display = "block";
      }
    }
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
    showVictoryScene();
  } else if (isLose()) {
    statusEl.className = "status lose";
    statusEl.textContent = `Você perdeu… A palavra era: ${chosen.original}.`;
    revealAll();
    lockKeyboard();
    showDeathScene();
  } else {
    statusEl.className = "status";
    statusEl.textContent = "";
  }
}

function showDeathScene() {
  const scene = document.getElementById("death-scene");
  if (scene) {
    scene.classList.add("show");
    const btn = document.getElementById("try-again");
    if (btn) {
      btn.onclick = () => {
        scene.classList.remove("show");
        chosen = pickWord();
        reset(false);
      };
    }
  }
}

function showVictoryScene() {
  const scene = document.getElementById("victory-scene");
  if (scene) {
    scene.classList.add("show");
    setTimeout(() => {
      scene.classList.remove("show");
      chosen = pickWord();
      reset(false);
    }, 6000);
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
  document.getElementById("death-scene")?.classList.remove("show");
  document.getElementById("victory-scene")?.classList.remove("show");
  if (!preserveWord) chosen = pickWord();
  drawWord();
  hintEl.textContent = "";
  categoryEl.textContent = chosen.hint;

  const contextual = document.getElementById("contextual-hint");
  if (contextual) {
    contextual.style.display = "none";
    contextual.innerHTML = "";
  }
}

function applyCharacterShapes(kind) {
  const p6 = document.getElementById("p6");
  const p7 = document.getElementById("p7");
  if (p6 && p7) {
    p6.setAttribute("d", SHAPES[kind].p6);
    p7.setAttribute("d", SHAPES[kind].p7);
    p6.classList.remove("girl", "boy");
    p7.classList.remove("girl", "boy");
    p6.classList.add(kind);
    p7.classList.add(kind);
  }
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

// Fluxo inicial — personagem e tema juntos
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("girl").addEventListener("click", () => {
    character = "girl";
    applyCharacterShapes("girl");
  });

  document.getElementById("boy").addEventListener("click", () => {
    character = "boy";
    applyCharacterShapes("boy");
  });

  document.querySelectorAll("#theme-select button").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      loadWordsFromTheme(theme);
    });
  });
});
