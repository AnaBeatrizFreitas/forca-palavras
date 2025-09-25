document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("character-select");
  const themeSelect = document.getElementById("theme-select");
  const themeTitle = document.getElementById("theme-title"); // <h2>Escolha o tema:</h2>

  // Oculta a seleção de tema no início
  themeSelect.style.display = "none";
  if (themeTitle) themeTitle.style.display = "none";

  // Escolha de personagem
  document.getElementById("girl").addEventListener("click", () => {
    character = "girl";
    MAX_ERRORS = 8;
    characterSelect.style.display = "none";
    applyCharacterShapes("girl");

    // Agora mostra a seleção de tema
    themeSelect.style.display = "flex";
    if (themeTitle) themeTitle.style.display = "block";
  });

  document.getElementById("boy").addEventListener("click", () => {
    character = "boy";
    MAX_ERRORS = 8;
    characterSelect.style.display = "none";
    applyCharacterShapes("boy");

    // Agora mostra a seleção de tema
    themeSelect.style.display = "flex";
    if (themeTitle) themeTitle.style.display = "block";
  });

  // Escolha de tema
  document.querySelectorAll("#theme-select button").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      themeSelect.style.display = "none";
      if (themeTitle) themeTitle.style.display = "none";
      loadWordsFromTheme(theme);
    });
  });
});
