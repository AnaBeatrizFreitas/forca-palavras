document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("character-select");
  const characterButtons = document.getElementById("character-buttons");
  const themeButtons = document.getElementById("theme-buttons");
  const selectionTitle = document.getElementById("selection-title");

  // Oculta os botões de tema no início
  themeButtons.style.display = "none";

  // Escolha de personagem
  document.getElementById("girl").addEventListener("click", () => {
    character = "girl";
    MAX_ERRORS = 8;
    applyCharacterShapes("girl");

    // Transição para escolha de tema
    characterButtons.style.display = "none";
    selectionTitle.textContent = "Escolha o tema:";
    themeButtons.style.display = "block";
  });

  document.getElementById("boy").addEventListener("click", () => {
    character = "boy";
    MAX_ERRORS = 8;
    applyCharacterShapes("boy");

    // Transição para escolha de tema
    characterButtons.style.display = "none";
    selectionTitle.textContent = "Escolha o tema:";
    themeButtons.style.display = "block";
  });

  // Escolha de tema
  document.querySelectorAll("#theme-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;

      // Oculta toda a área de seleção após escolha
      characterSelect.style.display = "none";

      // Carrega palavras do tema escolhido
      loadWordsFromTheme(theme);
    });
  });
});
