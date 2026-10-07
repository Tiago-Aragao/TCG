/* Gerador procedural v1. Sem dependências ou imagens externas. */
(function (raiz) {
  'use strict';
  const TIPOS = ['Humanos', 'Monstros', 'Alien', 'Mortos-Vivos', 'Animais'];
  const aliases = {
    humano: 0, humanos: 0, monstro: 1, monstros: 1,
    alien: 2, aliens: 2, 'morto-vivo': 3, 'mortos-vivos': 3,
    animal: 4, animais: 4,
  };

  // Aleatoriedade reproduzível: mesmo tipo + seed = mesmo desenho nesta versão.
  function aleatorio(seed) {
    let estado = 2166136261;
    for (const caractere of String(seed)) {
      estado = Math.imul(estado ^ caractere.charCodeAt(0), 16777619);
    }
    return () => {
      estado += 0x6D2B79F5;
      let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Retorna texto SVG. Também pode ser executada no Node, sem DOM. */
  function gerarSVG(tipo, { seed = Math.random().toString(36), fundo = true } = {}) {
    const chave = String(tipo).trim().toLowerCase().replace(/\s+/g, '-');
    if (!Object.prototype.hasOwnProperty.call(aliases, chave)) {
      throw new RangeError('Tipo inválido. Use: ' + TIPOS.join(', '));
    }
    const id = aliases[chave];
    const rnd = aleatorio(id + ':' + seed);
    const inteiro = (a, b) => Math.floor(a + rnd() * (b - a + 1));
    const escolher = lista => lista[inteiro(0, lista.length - 1)];
    const matiz = escolher([[28, 205, 270], [135, 280, 15], [165, 205, 290], [95, 175, 265], [28, 18, 210]][id]);
    const cor = (l, s = 45) => `hsl(${matiz},${s}%,${l}%)`;
    const tinta = '#182530';
    const partes = [];
    const forma = (tag, attrs, fill, stroke = tinta, sw = 4) =>
      partes.push(`<${tag} ${attrs} fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
    const elipse = (x, y, rx, ry, c, s = tinta, w = 4) => forma('ellipse', `cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"`, c, s, w);
    const caminho = (d, c = 'none', s = tinta, w = 4) => forma('path', `d="${d}"`, c, s, w);
    const olho = (x, y, r = 8, iris = '#ffd580') => {
      elipse(x, y, r + 3, r + 4, '#fff7e5', tinta, 3);
      elipse(x + 1, y + 1, r * .55, r * .8, iris, tinta, 2);
      elipse(x - 1, y - 3, 2, 2, '#fff', 'none');
    };
    if (fundo) {
      forma('rect', 'width="320" height="320"', cor(13, 28), 'none');
      elipse(160, 143, 122, 122, cor(22, 32), 'none');
      elipse(160, 143, 99, 99, 'none', cor(34, 28), 1);
      for (let i = 0; i < 24; i++) {
        elipse(inteiro(15, 305), inteiro(15, 285), 1.4, 1.4, cor(65, 25), 'none');
      }
      caminho('M0 276 Q80 255 160 278 T320 271 V320 H0Z', cor(18, 22), 'none');
    }
    elipse(160, 282, 90, 12, '#0d151b', 'none');
    // As formas abaixo são receitas de desenho; não são arquivos de arte.
    if (id === 0) {
      const pele = escolher(['#f0bb91', '#b77b58', '#704a38', '#d99c73']);
      const cabelo = escolher(['#342b31', '#b36e36', '#e4d0a3', '#592f29']);
      const penteado = inteiro(0, 2);
      caminho('M97 177 L69 269 L115 278 L160 246 L208 279 L250 268 L224 177Z', cor(36));
      caminho('M119 184 L105 272 L216 272 L202 184Z', cor(65, 18));
      caminho('M119 189 L160 228 L201 189 L190 253 H130Z', cor(45, 22));
      elipse(103, 146, 12, 19, pele); elipse(217, 146, 12, 19, pele);
      forma('rect', 'x="145" y="170" width="30" height="36" rx="9"', pele);
      elipse(160, 133, 54, 65, pele);
      caminho(penteado === 0 ? 'M106 137 Q92 61 157 66 Q225 57 214 139 L195 104 L177 111 L164 91 L143 112 L121 106Z' : penteado === 1 ? 'M106 137 Q94 61 160 66 Q225 67 214 132 L196 101 Q146 120 119 95Z' : 'M107 130 L101 93 L123 95 L119 70 L145 78 L162 56 L176 79 L202 69 L199 92 L218 98 L212 134 L193 102 L130 102Z', cabelo);
      olho(139, 140, 6, cor(55)); olho(181, 140, 6, cor(55));
      caminho('M129 125 L147 128 M173 128 L191 125', 'none', cabelo, 5);
      caminho('M159 147 L155 160 L164 160 M145 175 Q160 181 175 175', 'none', tinta, 3);
      elipse(160, 215, 9, 10, '#f1cd78');
      caminho('M93 197 L108 207 M214 206 L229 196', 'none', '#e2c786', 5);
    } else if (id === 1) {
      const largura = inteiro(66, 83), olhos = inteiro(1, 3);
      caminho('M103 136 Q69 88 80 66 Q98 92 129 100 M191 100 Q223 90 240 62 Q244 108 216 138', '#ead7b1');
      caminho('M99 197 Q56 202 53 246 L76 252 L100 225 M221 197 Q264 204 267 246 L246 252 L218 225', cor(48));
      elipse(123, 264, 26, 20, cor(39)); elipse(196, 264, 26, 20, cor(39));
      elipse(160, 185, largura, inteiro(79, 91), cor(52));
      elipse(160, 229, 44, 33, cor(67), 'none');
      for (let i = 0; i < olhos; i++) olho(160 + (i - (olhos - 1) / 2) * 39, 157, olhos === 1 ? 19 : 11, '#ffc465');
      caminho('M130 195 Q160 216 191 194 Q184 232 159 229 Q136 225 130 195Z', '#352932');
      caminho('M137 200 L145 215 L151 205 M168 205 L176 218 L184 201', '#fff2ca', tinta, 2);
      for (const x of [111, 209]) elipse(x, 194, 5, 7, cor(35), 'none');
    } else if (id === 2) {
      const alto = inteiro(61, 77);
      caminho('M130 204 Q89 213 82 264 M190 204 Q232 216 236 264', 'none', cor(60), 15);
      caminho('M139 246 L128 279 M181 246 L193 279', 'none', cor(55), 15);
      elipse(160, 226, 35, 41, cor(38));
      caminho('M129 83 Q105 52 116 35 M191 83 Q217 52 205 35', 'none', cor(65), 5);
      elipse(116, 34, 8, 8, '#b9ffd7'); elipse(205, 34, 8, 8, '#b9ffd7');
      caminho(`M160 ${145-alto} C59 ${130-alto} 96 190 160 198 C224 190 261 ${130-alto} 160 ${145-alto}Z`, cor(65));
      partes.push('<g transform="rotate(22 131 144)">'); elipse(131, 144, 18, 28, '#172636'); partes.push('</g>');
      partes.push('<g transform="rotate(-22 189 144)">'); elipse(189, 144, 18, 28, '#172636'); partes.push('</g>');
      elipse(126, 135, 5, 8, '#bfffea', 'none'); elipse(184, 135, 5, 8, '#bfffea', 'none');
      caminho('M149 179 Q160 184 171 179', 'none', tinta, 3);
      for (let i = 0; i < 3; i++) elipse(160, 213 + i * 13, 4, 4, '#beffdd', 'none');
    } else if (id === 3) {
      const osso = escolher(['#e4dcb5', '#ced7c0', '#b8c8b3']);
      caminho('M106 187 L76 281 L124 269 L141 285 L169 270 L194 285 L239 278 L212 185Z', cor(29));
      caminho('M106 204 L77 243 M214 204 L241 245', 'none', osso, 13);
      caminho('M160 192 V257 M135 212 Q160 229 185 212 M136 230 Q160 246 184 230', 'none', osso, 8);
      caminho('M109 145 Q93 78 159 76 Q229 78 212 146 L195 163 L191 190 H130 L126 163Z', osso);
      elipse(136, 139, 18, 21, '#263337'); elipse(185, 139, 18, 21, '#263337');
      const brilho = escolher(['#aaff83', '#82eaff', '#ffb16d']);
      elipse(136, 140, 5, 7, brilho, 'none'); elipse(185, 140, 5, 7, brilho, 'none');
      caminho('M160 150 L151 165 H169Z', '#263337', 'none');
      caminho('M136 177 H186 M146 170 V186 M160 172 V187 M174 170 V186', 'none', tinta, 3);
      caminho('M170 80 L163 102 L176 111 L170 124', 'none', tinta, 3);
      if (rnd() > .5) caminho('M109 108 L111 74 L127 81 L140 61 L158 80 L179 63 L190 82 L209 75 L211 108Z', cor(47, 26));
    } else {
      const especie = inteiro(0, 2); // Felino, canino ou urso.
      const pelo = escolher(['#b37b49', '#d6a461', '#788e9d', '#aa6951']);
      caminho('M206 241 Q279 216 258 183 Q246 170 241 187', 'none', tinta, 21);
      caminho('M206 241 Q279 216 258 183 Q246 170 241 187', 'none', pelo, 13);
      elipse(160, 222, 57, 55, pelo);
      elipse(131, 265, 25, 18, pelo); elipse(189, 265, 25, 18, pelo);
      if (especie === 2) {
        elipse(111, 93, 24, 26, pelo); elipse(209, 93, 24, 26, pelo);
        elipse(111, 93, 12, 14, '#eac2a2', 'none'); elipse(209, 93, 12, 14, '#eac2a2', 'none');
      } else {
        caminho(especie === 0 ? 'M105 128 L99 66 L144 101 M177 101 L221 66 L215 128' : 'M105 137 L94 59 L146 107 M176 107 L226 59 L215 137', pelo);
        caminho('M109 106 L106 85 L126 104 M194 104 L214 85 L211 106', '#e9b5a3', 'none');
      }
      elipse(160, 147, 65, 58, pelo);
      if (especie === 0) caminho('M144 93 L150 113 M175 93 L169 113 M99 142 L116 148 M221 142 L204 148', 'none', '#654734', 5);
      olho(134, 143, 8, '#b6d58c'); olho(186, 143, 8, '#b6d58c');
      elipse(160, 174, especie === 1 ? 32 : 26, 22, '#eed4ad');
      caminho('M150 164 Q160 159 170 164 L160 175Z', '#283038');
      caminho('M160 175 V181 M160 181 Q149 191 142 181 M160 181 Q170 191 178 181', 'none', tinta, 3);
      if (especie === 0) caminho('M99 167 L124 174 M96 182 L124 181 M196 174 L222 166 M196 181 L224 182', 'none', tinta, 2);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img"><title>Criatura procedural: ${TIPOS[id]}</title>${partes.join('')}</svg>`;
  }

  /** Retorna um HTMLImageElement. Use append/replaceChildren para exibir. */
  function gerarCriatura(tipo, opcoes) {
    const svg = gerarSVG(tipo, opcoes);
    const imagem = new Image();
    imagem.alt = 'Criatura procedural: ' + tipo;
    imagem.width = 320;
    imagem.height = 320;
    imagem.style.cssText = 'display:block;width:100%;height:auto;object-fit:contain';
    imagem.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return imagem;
  }
  const api = { gerarCriatura, gerarSVG, TIPOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(raiz, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
