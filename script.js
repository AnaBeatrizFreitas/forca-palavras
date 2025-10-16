let ORIGINAL_WORDS = [];
let wordPool = [];
let currentWord = "";
let originalHint = "";
let lives = 15;
let erros = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".theme-btn").forEach(button => {
    button.addEventListener("click", () => {
      const tema = button.dataset.tema;
      const nomeTema = button.textContent;
      const caminho = `palavras/${tema}/palavras.json`;

      document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");

      carregarPalavras(caminho, nomeTema);
    });
  });

  document.getElementById("shuffle").addEventListener("click", () => {
    if (ORIGINAL_WORDS.length === 0) {
      alert("Escolha um tema antes de começar o jogo");
      return;
    }
    if (wordPool.length === 0) wordPool = shuffleWords();
    startGame();
    limparCenasFinais();
  });

  document.getElementById("try-again-loss").addEventListener("click", reiniciarJogo);
  document.getElementById("try-again-win").addEventListener("click", reiniciarJogo);
});

function carregarPalavras(caminho, nomeTema) {
  fetch(caminho)
    .then(res => res.json())
    .then(palavras => {
      ORIGINAL_WORDS = palavras.filter(item => item.w && typeof item.w === "string")
        .map(item => ({
          w: item.w.toUpperCase(),
          dica: item.dica || "Sem dica disponível"
        }));
      wordPool = shuffleWords();
      startGame();
      document.getElementById("category").textContent = nomeTema;
    })
    .catch(err => {
      console.error("Erro ao carregar palavras:", err);
      alert("Erro ao carregar palavras do tema.");
    });
}

function shuffleWords() {
  const copy = [...ORIGINAL_WORDS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startGame() {
  lives = 10;
  erros = 0;
  document.getElementById("lives").textContent = lives;
  document.getElementById("hint").textContent = "";
  document.getElementById("hint").style.display = "none";
  document.getElementById("status").textContent = "";
  document.getElementById("status").className = "status";

  for (let i = 0; i < 10; i++) {
    const parte = document.getElementById(`p${i}`);
    if (parte) parte.classList.remove("show", "mask-glow");
  }

  const next = wordPool.pop();
  if (!next) {
    alert("Acabaram as palavras!");
    return;
  }

  currentWord = next.w;
  originalHint = next.dica;

  const wordContainer = document.getElementById("word");
  wordContainer.innerHTML = "";
  for (const letra of currentWord) {
    const span = document.createElement("span");
    span.className = "slot";
    span.textContent = letra === " " ? " " : "_";
    wordContainer.appendChild(span);
  }

  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  const letras = "AÁÂÃÀBCÇDEÉÊFGHIÍJKLMNOPQRSTUÚÜVWXYZ";
  for (const letra of letras) {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = letra;
    btn.onclick = () => handleGuess(letra, btn);
    keyboard.appendChild(btn);
  }
}

function handleGuess(letra, btn) {
  btn.disabled = true;
  let acerto = false;
  const slots = document.querySelectorAll(".slot");

  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] === letra) {
      slots[i].textContent = letra;
      slots[i].classList.add("revealed");
      acerto = true;
    }
  }

  if (acerto) {
    btn.classList.add("good");
    verificarVitoria();
  } else {
    btn.classList.add("bad");
    lives--;
    erros++;
    document.getElementById("lives").textContent = lives;
    mostrarParteDaForca(erros);

    if (lives === 3) {
      document.getElementById("hint").textContent = `⚠️ Dica: ${originalHint}`;
      document.getElementById("hint").style.display = "block";
    }

    if (lives <= 0) {
      document.getElementById("death-scene").classList.add("show");
      document.getElementById("status").textContent = "Você perdeu!";
      document.getElementById("status").className = "status lose";
    }
  }
}

function verificarVitoria() {
  const slots = document.querySelectorAll(".slot");
  const letrasReveladas = Array.from(slots).map(s => s.textContent).join("");
  if (letrasReveladas === currentWord) {
    document.getElementById("victory-scene").classList.add("show");
    document.getElementById("status").textContent = "Você venceu!";
    document.getElementById("status").className = "status win";

    // Brilho na máscara
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`p${i}`)?.classList.add("mask-glow");
    }
  }
}

function mostrarParteDaForca(erros) {
  const ordem = [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 7, 8, 9, 10, 11]; // máscara completa antes do corpo
  const parteId = `p${ordem[erros - 1]}`;
  const parte = document.getElementById(parteId);
  if (parte) parte.classList.add("show");
}

function reiniciarJogo() {
  if (wordPool.length === 0) wordPool = shuffleWords();
  startGame();
  limparCenasFinais();
}

function limparCenasFinais() {
  document.getElementById("death-scene").classList.remove("show");
  document.getElementById("victory-scene").classList.remove("show");
  document.querySelector(".victory-message").textContent = "“Escapou dessa vez”";
  document.querySelector(".glow").style.background = "";

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`p${i}`)?.classList.remove("mask-glow");
  }
}
