const temas = {
  "Animal 🐶": "animal/palavras.json",
  "Cantores 🎤": "cantores/palavras.json",
  "Comida 🍔": "comida/palavras.json",
  "Filmes 🎬": "filmes/palavras.json",
  "Objeto 🧰": "objetos/palavras.json",
  "País 🌍": "pais/palavras.json",
  "Profissões 👩‍⚕️": "profissoes/palavras.json"
};

let ORIGINAL_WORDS = [];
let wordPool = [];
let currentWord = "";
let originalHint = "";
let lives = 8;
let erros = 0;

document.addEventListener("DOMContentLoaded", () => {
  applyCharacterShapes("ghostface");
  mostrarTemas();

  document.getElementById("reset").addEventListener("click", () => {
    wordPool = shuffleWords();
    startGame();
    document.getElementById("category").textContent = "Geral";
    document.getElementById("death-scene").classList.remove("show");
    document.getElementById("victory-scene").classList.remove("show");
  });

  document.getElementById("shuffle").addEventListener("click", () => {
    startGame();
    document.getElementById("death-scene").classList.remove("show");
    document.getElementById("victory-scene").classList.remove("show");
  });

  document.getElementById("try-again-loss").addEventListener("click", reiniciarJogo);
  document.getElementById("try-again-win").addEventListener("click", reiniciarJogo);
});

function reiniciarJogo() {
  wordPool = shuffleWords();
  startGame();
  document.getElementById("death-scene").classList.remove("show");
  document.getElementById("victory-scene").classList.remove("show");
}

function mostrarTemas() {
  let themeContainer = document.getElementById("theme-select");
  if (!themeContainer) {
    themeContainer = document.createElement("div");
    themeContainer.id = "theme-select";

    for (const [nome, caminho] of Object.entries(temas)) {
      const btn = document.createElement("button");
      btn.className = "theme-btn";
      btn.textContent = nome;
      btn.onclick = () => selecionarTema(btn, caminho, nome);
      themeContainer.appendChild(btn);
    }

    document.querySelector(".app").insertAdjacentElement("afterbegin", themeContainer);
  }
}

function selecionarTema(botao, caminho, nomeTema) {
  document.querySelectorAll("#theme-select .theme-btn").forEach(btn => btn.classList.remove("selected"));
  botao.classList.add("selected");
  carregarPalavras(caminho, nomeTema);
}

function carregarPalavras(nomeArquivo, nomeTema) {
  const baseURL = `palavras/${nomeArquivo}`;

  fetch(baseURL)
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
  lives = 8;
  erros = 0;
  document.getElementById("lives").textContent = lives;
  document.getElementById("hint").textContent = "";
  document.getElementById("hint").style.display = "none";
  document.getElementById("status").textContent = "";
  document.getElementById("status").className = "status";

  for (let i = 0; i < 8; i++) {
    document.getElementById(`p${i}`)?.classList.remove("show");
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
  }
}

function mostrarParteDaForca(erros) {
  const parte = document.getElementById(`p${erros - 1}`);
  if (parte) parte.classList.add("show");
}

function applyCharacterShapes(kind) {
  const SHAPES = {
    ghostface: {
      // Cabeça com capuz e máscara
      p6: "M165 75 Q190 40 215 75 Q190 110 165 75 Z",
      // Capa com mangas abertas
      p7: "M160 120 Q190 160 220 120 Q190 200 160 120 Z"
    }
  };

  const p6 = document.getElementById("p6");
  const p7 = document.getElementById("p7");
  if (p6 && p7 && SHAPES[kind]) {
    p6.setAttribute("d", SHAPES[kind].p6);
    p7.setAttribute("d", SHAPES[kind].p7);
    p6.className = kind;
    p7.className = kind;
  }
}
