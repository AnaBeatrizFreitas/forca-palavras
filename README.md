
## 🚀 Como jogar

1. Escolha seu personagem (👧 Menina ou 👦 Menino).
2. Selecione um tema (ex: Filmes, Comida, País).
3. Tente adivinhar a palavra antes que suas chances acabem.
4. A cada erro, uma parte da forca aparece.
5. Com 3 chances restantes, uma dica será revelada.
6. Vença ao completar a palavra ou perca ao esgotar as chances.

## 🧠 Temas disponíveis

- Animal 🐶  
- Cantores 🎤  
- Comida 🍔  
- Estilos de Música 🎵  
- Filmes 🎬  
- Objeto 🧰  
- País 🌍  
- Profissões 👩‍⚕️  

Cada tema está associado a um arquivo JSON com palavras e dicas.

## 🛠 Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- SVG para desenho da forca

## 🌐 Publicação no GitHub Pages

Para que os arquivos JSON sejam carregados corretamente:

- Certifique-se de que a pasta `palavras/` está incluída no repositório.
- Use caminhos **relativos** no `script.js` para acessar os arquivos:
  ```js
  const baseURL = `palavras/${arquivo}`;
