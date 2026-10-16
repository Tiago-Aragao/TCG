# Gerador de criaturas — versão 1

Extraia o ZIP e abra index.html no navegador. Funciona offline, sem instalar nada.

## Integrar no jogo

Copie criaturas.js para o projeto e carregue antes do código que o utiliza:

```html
<div id="arte-carta" style="width:280px"></div>
<script src="criaturas.js"></script>
<script>
  const imagem = gerarCriatura("Monstros");
  document.querySelector("#arte-carta").replaceChildren(imagem);
</script>
```

A função retorna um HTMLImageElement, e replaceChildren o mostra na tela.
Tipos: Humanos, Monstros, Alien, Mortos-Vivos e Animais. Singular e minúsculas também são aceitos. Tipos desconhecidos causam RangeError.

## Reproduzir a arte de uma carta

```js
const imagem = gerarCriatura("Mortos-Vivos", {
  seed: "carta-42",
  fundo: false, // Fundo transparente. O padrão é true.
});
document.querySelector("#arte-carta").replaceChildren(imagem);
```

Sem seed, cada chamada usa uma seed aleatória. Guarde uma seed por carta para manter sua identidade. Mesmos tipo, seed, fundo e versão do gerador produzem o mesmo SVG. Alterar as receitas pode alterar imagens antigas; preserve esta versão se necessário. Seeds diferentes podem produzir aparências parecidas ou iguais: unicidade não é garantida.

## Receber somente o SVG

```js
const svg = gerarSVG("Alien", { seed: 123 });
```

gerarSVG também funciona em Node com `const { gerarSVG } = require('./criaturas.js')`. gerarCriatura exige navegador (Image/DOM). Em projetos com bundler ESM, pode adaptar o último bloco de exportação para `export { gerarCriatura, gerarSVG, TIPOS }`, fora da função envolvente, ou carregar o arquivo como script público.

## Limites deste protótipo

Artes vetoriais simples em 320 × 320, redimensionáveis sem pixelar, com uma receita base por família. Humanos são retratos de aventureiros, monstros são criaturas com chifres, aliens possuem antenas, mortos-vivos são esqueletos e animais variam entre felino, canino e urso. Não é um gerador de qualquer criatura a partir de texto. Para novas anatomias, acrescente receitas em criaturas.js.

Tudo é desenhado com coordenadas. Não há fontes, bibliotecas ou imagens externas; não há chamadas de rede. Se o aplicativo usa Content Security Policy, a política de imagens precisa permitir `data:` para exibir o elemento retornado. O desenho é independente do layout da carta.
