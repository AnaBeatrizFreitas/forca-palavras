const temas = {
  adultos: {
    "Animal 🐶": "palavras_adultos/animal/animal_adultos.json",
    "Cantores 🎤": "palavras_adultos/cantores/cantores_adultos.json",
    "Comida 🍔": "palavras_adultos/comida/comida_adultos.json",
    "Filmes 🎬": "palavras_adultos/filmes/filmes_adultos.json",
    "Objeto 🧰": "palavras_adultos/objeto/objeto_adultos.json",
    "País 🌍": "palavras_adultos/pais/pais_adultos.json",
    "Profissões 👩‍⚕️": "palavras_adultos/profissoes/profissoes_adultos.json"
  },
  criancas: {
    "Animal 🐶": "palavras_criancas/animal/animal_criancas.json",
    "Espaço 🚀": "palavras_criancas/espaco/espaco_criancas.json",
    "Comida 🍔": "palavras_criancas/comida/comida_criancas.json",
    "Desenhos 📺": "palavras_criancas/desenhos/desenhos_criancas.json",
    "Objeto 🧰": "palavras_criancas/objeto/objeto_criancas.json",
    "País 🌍": "palavras_criancas/pais/pais_criancas.json",
    "Profissões 👩‍⚕️": "palavras_criancas/profissoes/profissoes_criancas.json"
  }
};

let character = "";
let modoJogo = "";
let ORIGINAL_WORDS = [];
let wordPool = [];
let currentWord = "";
let originalHint = "";
let lives = 8;
let erros = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("girl").addEventListener("click", () => {
    modoJogo = "criancas";
    character = "girl";
    selecionarModoJogo();
  });

  document.getElementById("boy").addEventListener("click", () => {
    modoJogo = "adultos";
    character = "boy";
    selecionarModoJogo();
  });

  document.getElementById("shuffle").addEventListener("click", () => {
    if (!character) {
      alert("Escolha seu personagem antes de começar o jogo");
      return;
    }

    if (ORIGINAL_WORDS.length === 0) {
      alert("Escolha um tema antes de começar o jogo");
      return;
    }

    if (wordPool.length === 0) {
      wordPool = shuffleWords();
    }

    startGame();
    document.getElementById("death-scene").classList.remove("show");
    document.getElementById("victory-scene").classList.remove("show");
  });

  document.getElementById("try-again-loss").addEventListener("click", reiniciarJogo);
  document.getElementById("try-again-win").addEventListener("click", reiniciarJogo);
});

function selecionarModoJogo() {
  applyCharacterShapes(character);
  destacarPersonagem(character);
  mostrarTemas();
}

function reiniciarJogo() {
  if (wordPool.length === 0) {
    wordPool = shuffleWords();
  }
  startGame();
  document.getElementById("death-scene").classList.remove("show");
  document.getElementById("victory-scene").classList.remove("show");
}

function destacarPersonagem(selecionado) {
  document.getElementById("girl").classList.remove("selected");
  document.getElementById("boy").classList.remove("selected");
  document.getElementById(selecionado).classList.add("selected");
  character = selecionado;
}

function mostrarTemas() {
  let themeContainer = document.getElementById("theme-select");
  if (themeContainer) themeContainer.remove();

  themeContainer = document.createElement("div");
  themeContainer.id = "theme-select";

  const temasAtivos = temas[modoJogo];

  for (const [nome, caminho] of Object.entries(temasAtivos)) {
    const btn = document.createElement("button");
    btn.className = "theme-btn";
    btn.textContent = nome;
    btn.onclick = () => selecionarTema(btn, caminho, nome);
    themeContainer.appendChild(btn);
  }

  document.getElementById("character-select").insertAdjacentElement("afterend", themeContainer);
}

function selecionarTema(botao, caminho, nomeTema) {
  document.querySelectorAll("#theme-select .theme-btn").forEach(btn => btn.classList.remove("selected"));
  botao.classList.add("selected");
  carregarPalavras(caminho, nomeTema);
}

function carregarPalavras(nomeArquivo, nomeTema) {
  fetch(nomeArquivo)
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
    alert("Escolha um tema antes de começar o jogo");
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
  const deathScene = document.getElementById("death-scene");
  const blood = deathScene.querySelector(".blood");
  const message = deathScene.querySelector(".death-message");
  const status = document.getElementById("status");

  if (modoJogo === "criancas") {
    blood.style.background = "radial-gradient(circle at center, rgba(100,100,255,0.4), rgba(0,0,50,0.9))";
    message.textContent = "Não desista";
    status.textContent = "Não desista";
  } else {
    blood.style.background = "radial-gradient(circle at center, rgba(255,0,0,0.4), rgba(0,0,0,0.9))";
    message.textContent = "“Não é pessoal. É a lei.”";
    status.textContent = "Você perdeu!";
  }

  status.className = "status lose";
  deathScene.classList.add("show");
}
  }
}

function verificarVitoria() {
  const slots = document.querySelectorAll(".slot");
  const letrasReveladas = Array.from(slots).map(s => s.textContent).join("");
  if (letrasReveladas === currentWord) {
    document.getElementById("victory-scene").classList.add("show");

    const status = document.getElementById("status");
    status.className = "status win";
    status.textContent = modoJogo === "criancas" ? "Parabéns você acertou!" : "Você venceu!";
  }
}

function mostrarParteDaForca(erros) {
  const parte = document.getElementById(`p${erros - 1}`);
  if (parte) parte.classList.add("show");
}

function applyCharacterShapes(kind) {
  const SHAPES = {
    girl: {
      p6: "M165 75 Q190 50 215 75",
      p7: "M182 80 L190 70 L198 80 L190 90 Z"
    },
    boy: {
      p6: "M165 75 Q190 90 215 75",
      p7: "M182 80 L190 90 L198 80 L190 70 Z"
    }
  };

  const p6 = document.getElementById("p6");
  const p7 = document.getElementById("p7");
  if (p6 && p7 && SHAPES[kind]) {
    p6.setAttribute("d", SHAPES[kind].p6);
    p7.setAttribute("d", SHAPES[kind].p7);
    p6.classList.remove("girl", "boy");
    p7.classList.remove("girl", "boy");
    p6.classList.add(kind);
    p7.classList.add(kind);
  }
}
o