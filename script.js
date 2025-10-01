const temas = {
  "Animal 🐶": "animal.json",
  "Cantores 🎤": "cantores.json",
  "Comida 🍔": "comida.json",
  "Estilos de Música 🎵": "estilos_de_musica.json",
  "Filmes 🎬": "filmes.json",
  "Objeto 🧰": "objeto.json",
  "País 🌍": "pais.json",
  "Profissões 👩‍⚕️": "profissoes.json"
};

let character = null;
let ORIGINAL_WORDS = [];
let wordPool = [];
let currentWord = "";
let originalHint = "";
let lives = 8;
let erros = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("girl").addEventListener("click", () => selecionarPersonagem("girl"));
  document.getElementById("boy").addEventListener("click", () => selecionarPersonagem("boy"));
  document.getElementById("reset").addEventListener("click", reiniciarJogoCompleto);
  document.getElementById("shuffle").addEventListener("click", iniciarNovaPalavra);
  document.getElementById("try-again-loss").addEventListener("click", reiniciarJogoCompleto);
  document.getElementById("try-again-win").addEventListener("click", reiniciarJogoCompleto);
});

function selecionarPersonagem(tipo) {
  character = tipo;
  applyCharacterShapes(tipo);
  destacarPersonagem(tipo);
  mostrarTemas();
}

function destacarPersonagem(selecionado) {
  document.getElementById("girl").classList.remove("selected");
  document.getElementById("boy").classList.remove("selected");
  document.getElementById(selecionado).classList.add("selected");
}

function mostrarTemas() {
  let container = document.getElementById("theme-select");
  if (!container) {
    container = document.createElement("div");
    container.id = "theme-select";
    for (const [nome, arquivo] of Object.entries(temas)) {
      const btn = document.createElement("button");
      btn.className = "theme-btn";
      btn.textContent = nome;
      btn.onclick = () => selecionarTema(btn, arquivo, nome);
      container.appendChild(btn);
    }
    document.getElementById("character-select").insertAdjacentElement("afterend", container);
  }
}

function selecionarTema(botao, arquivo, nomeTema) {
  document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("selected"));
  botao.classList.add("selected");
  carregarPalavras(arquivo, nomeTema);
}

function carregarPalavras(arquivo, nomeTema) {
  const baseURL = `palavras/${arquivo}`; // Caminho relativo corrigido

  fetch(baseURL)
    .then(res => res.json())
    .then(palavras => {
      ORIGINAL_WORDS = palavras.filter(item => item.w && typeof item.w === "string")
        .map(item => ({
          w: item.w.toUpperCase(),
          dica: item.dica || "Sem dica disponível"
        }));
      wordPool = embaralharPalavras();
      startGame();
      document.getElementById("category").textContent = nomeTema;
    })
    .catch(err => {
      console.error("Erro ao carregar palavras:", err);
      alert("Erro ao carregar palavras do tema.");
    });
}

function embaralharPalavras() {
  const copia = [...ORIGINAL_WORDS];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
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

  const proxima = wordPool.pop();
  if (!proxima) {
    alert("Acabaram as palavras!");
    return;
  }

  currentWord = proxima.w;
  originalHint = proxima.dica;

  const wordContainer = document.getElementById("word");
  wordContainer.innerHTML = "";
  for (const letra of currentWord) {
    const span = document.createElement("span");
    span.className = "slot";
    span.textContent = letra === " " ? " " : "_";
    wordContainer.appendChild(span);
  }

  const teclado = document.getElementById("keyboard");
  teclado.innerHTML = "";
  const letras = "AÁÂÃÀBCÇDEÉÊFGHIÍJKLMNOPQRSTUÚÜVWXYZ";
  for (const letra of letras) {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = letra;
    btn.onclick = () => handleGuess(letra, btn);
    teclado.appendChild(btn);
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
  const reveladas = Array.from(slots).map(s => s.textContent).join("");
  if (reveladas === currentWord) {
    document.getElementById("victory-scene").classList.add("show");
    document.getElementById("status").textContent = "Você venceu!";
    document.getElementById("status").className = "status win";
  }
}

function mostrarParteDaForca(erros) {
  const parte = document.getElementById(`p${erros - 1}`);
  if (parte) parte.classList.add("show");
}

function applyCharacterShapes(tipo) {
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

  const p6 = document.getElementById("p6");
  const p7 = document.getElementById("p7");
  if (p6 && p7) {
    p6.setAttribute("d", SHAPES[tipo].p6);
    p7.setAttribute("d", SHAPES[tipo].p7);
    p6.classList.remove("girl", "boy");
    p7.classList.remove("girl", "boy");
    p6.classList.add(tipo);
    p7.classList.add(tipo);
  }
}

function reiniciarJogoCompleto() {
  wordPool = embaralharPalavras();
  startGame();
  document.getElementById("category").textContent = "Geral";
  document.getElementById("death-scene").classList.remove("show");
  document.getElementById("victory-scene").classList.remove("show");
}

function iniciarNovaPalavra() {
  startGame();
  document.getElementById("death-scene").classList.remove("show");
  document.getElementById("victory-scene").classList.remove("show");
}
