document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("character-select");
  const characterButtons = document.getElementById("character-buttons");
  const themeButtons = document.getElementById("theme-buttons");
  const selectionTitle = document.getElementById("selection-title");

  themeButtons.style.display = "none";

  document.getElementById("girl").addEventListener("click", () => {
    character = "girl";
    MAX_ERRORS = 8;
    applyCharacterShapes("girl");

    characterButtons.style.display = "none";
    selectionTitle.textContent = "Escolha o tema:";
    themeButtons.style.display = "flex";
  });

  document.getElementById("boy").addEventListener("click", () => {
    character = "boy";
    MAX_ERRORS = 8;
    applyCharacterShapes("boy");

    characterButtons.style.display = "none";
    selectionTitle.textContent = "Escolha o tema:";
    themeButtons.style.display = "flex";
  });

  document.querySelectorAll("#theme-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      characterSelect.style.display = "none";
      loadWordsFromTheme(theme);
    });
  });
});
