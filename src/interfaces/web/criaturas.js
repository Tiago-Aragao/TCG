/* ============================================================================
 * GERADOR PROCEDURAL DE CARTAS SVG v5 — BESTIÁRIO EXPANDIDO
 * Renderização Vetorial Multi-Camadas: Cel-Shading, Espaço Negativo e Rigging
 * Compatível com navegador (DOM) e Node.js. Zero dependências externas.
 * ============================================================================ */
(function (raiz) {
  'use strict';

  const TIPOS = ['Humanos', 'Monstros', 'Alien', 'Mortos-Vivos', 'Animais'];

  const SUBTIPOS = {
    0: ['guerreiro', 'mago', 'arqueiro', 'barbaro', 'paladino', 'assassino', 'monge', 'necromante'],
    1: ['orc', 'minotauro', 'dragao', 'slime', 'goblin', 'ciclope', 'golem', 'lobisomem', 'homem-fera', 'hidra', 'demonio'],
    2: ['robo', 'androide', 'mecha', 'robo-insetoide', 'robo-aracnideo', 'drone', 'sentinela', 'nave', 'disco-voador', 'nave-viva', 'cinzento', 'predador', 'tecnologico', 'insetoide', 'reptiliano', 'tentacular', 'aquatico', 'fungoide', 'cristalino', 'gelatinoso', 'cosmico', 'verme-espacial'],
    3: ['vampiro', 'vampiro-alado', 'dragao-zumbi', 'fantasma', 'banshee', 'lich', 'rei-esqueleto', 'esqueleto', 'esqueleto-arqueiro', 'esqueleto-guerreiro', 'esqueleto-fazendeiro', 'esqueleto-mago', 'zumbi', 'zumbi-guerreiro', 'zumbi-fazendeiro', 'zumbi-arqueiro', 'zumbi-mago', 'mumia', 'mumia-farao', 'ceifador', 'cavaleiro-da-morte', 'golem-de-carne', 'lobo-zumbi', 'urso-zumbi', 'cervo-zumbi', 'corvo-zumbi', 'aranha-zumbi', 'cavalo-esqueleto'],
    4: ['lobo', 'cachorro', 'raposa', 'urso', 'leao', 'tigre', 'pantera', 'gato', 'touro', 'bufalo', 'cervo', 'javali', 'aguia', 'coruja', 'besouro', 'louva-a-deus', 'aranha', 'cobra']
  };

  const aliases = {
    humano: [0], humanos: [0], homem: [0, null, 'M'], mulher: [0, null, 'F'],
    monstro: [1], monstros: [1],
    alien: [2], aliens: [2],
    'morto-vivo': [3], 'mortos-vivos': [3],
    animal: [4], animais: [4],
    canino: [4, 'lobo'], felino: [4, 'tigre'], bovino: [4, 'touro'], passaro: [4, 'aguia'], inseto: [4, 'louva-a-deus']
  };

  Object.entries(SUBTIPOS).forEach(([id, lista]) => {
    lista.forEach(sub => { aliases[sub] = [Number(id), sub, null]; });
  });

  Object.assign(aliases, {
    'zumbi-homem': [3, 'zumbi', 'M'], 'zumbi-mulher': [3, 'zumbi', 'F'],
    zumbia: [3, 'zumbi', 'F'], vampira: [3, 'vampiro', 'F'],
    lichs: [3, 'lich'], mumias: [3, 'mumia'], zumbis: [3, 'zumbi'],
    esqueletos: [3, 'esqueleto'], robos: [2, 'robo'], naves: [2, 'nave'],
    'golem-carne': [3, 'golem-de-carne'], 'robo-inseto': [2, 'robo-insetoide'],
    ovni: [2, 'disco-voador']
  });

  const NOMES_SUBTIPOS = {
    robo: 'Robô', androide: 'Androide', mecha: 'Mecha de cerco',
    'robo-insetoide': 'Robô insetoide', 'robo-aracnideo': 'Robô aracnídeo',
    drone: 'Drone orbital', sentinela: 'Sentinela trípode', nave: 'Nave de combate',
    'disco-voador': 'Disco voador', 'nave-viva': 'Nave viva',
    cinzento: 'Alien cinzento', predador: 'Caçador alienígena', tecnologico: 'Tecnomante alienígena',
    insetoide: 'Alien insetoide', reptiliano: 'Alien reptiliano', tentacular: 'Alien tentacular',
    aquatico: 'Alien abissal', fungoide: 'Alien fungoide', cristalino: 'Entidade cristalina',
    gelatinoso: 'Colônia gelatinosa', cosmico: 'Entidade cósmica', 'verme-espacial': 'Verme espacial',
    vampiro: 'Vampiro', 'vampiro-alado': 'Vampiro alado', 'dragao-zumbi': 'Dragão zumbi',
    fantasma: 'Fantasma', banshee: 'Banshee', lich: 'Lich', 'rei-esqueleto': 'Rei esqueleto',
    esqueleto: 'Esqueleto errante', 'esqueleto-arqueiro': 'Esqueleto arqueiro',
    'esqueleto-guerreiro': 'Esqueleto guerreiro', 'esqueleto-fazendeiro': 'Esqueleto fazendeiro',
    'esqueleto-mago': 'Esqueleto mago', zumbi: 'Zumbi', 'zumbi-guerreiro': 'Zumbi guerreiro',
    'zumbi-fazendeiro': 'Zumbi fazendeiro', 'zumbi-arqueiro': 'Zumbi arqueiro',
    'zumbi-mago': 'Zumbi mago', mumia: 'Múmia', 'mumia-farao': 'Múmia faraó',
    ceifador: 'Ceifador', 'cavaleiro-da-morte': 'Cavaleiro da morte',
    'golem-de-carne': 'Golem de carne', 'lobo-zumbi': 'Lobo zumbi', 'urso-zumbi': 'Urso zumbi',
    'cervo-zumbi': 'Cervo zumbi', 'corvo-zumbi': 'Corvo zumbi',
    'aranha-zumbi': 'Aranha zumbi', 'cavalo-esqueleto': 'Cavalo esqueleto'
  };
  const normalizar = valor => String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, '-');

  // PRNG determinístico (Mulberry32 + FNV-1a Hash)
  function aleatorio(seed) {
    let h = 2166136261;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return () => {
      h += 0x6D2B79F5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gerarSVG(tipo, { seed = Math.random().toString(36).slice(2, 10), fundo = true, subtipo: subtipoPedido, genero: generoPedido } = {}) {
    const chave = normalizar(tipo);
    if (!Object.prototype.hasOwnProperty.call(aliases, chave)) {
      throw new RangeError('Tipo inválido. Use: ' + TIPOS.join(', '));
    }

    const [id, subAlias, genForcado] = aliases[chave];
    const subForcado = subtipoPedido == null || subtipoPedido === '' ? subAlias : normalizar(subtipoPedido);
    if (subForcado && !SUBTIPOS[id].includes(subForcado)) {
      throw new RangeError('Subtipo inválido para ' + TIPOS[id] + ': ' + subForcado);
    }
    if (generoPedido != null && !['M', 'F'].includes(generoPedido)) {
      throw new RangeError('Gênero inválido. Use M ou F.');
    }
    const rnd = aleatorio(id + ':' + (subForcado || 'all') + ':' + seed);
    const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
    const num = (a, b) => +(a + rnd() * (b - a)).toFixed(1);
    const esc = lista => lista[int(0, lista.length - 1)];
    const chance = (p = 0.5) => rnd() < p;

    const subtipo = subForcado || esc(SUBTIPOS[id]);
    const genero = generoPedido || genForcado || (chance(0.5) ? 'F' : 'M');
    const uid = 'v4_' + Math.abs(int(100000, 999999));
    const tinta = '#07090d';

    // Paletas cromáticas ricas por família
    const matizesFamilia = {
      0: [215, 35, 355, 275, 150, 22, 195, 45],
      1: [352, 112, 22, 282, 12, 168, 42, 330],
      2: [188, 288, 148, 212, 322, 52, 170],
      3: [268, 158, 348, 198, 92, 225, 290],
      4: [28, 36, 18, 42, 12, 205, 95]
    };

    const H = (esc(matizesFamilia[id]) + int(-14, 14) + 360) % 360;
    const H2 = (H + esc([38, 145, 180, 215, 310])) % 360;
    const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

    const corLuz = hsl(H, int(55, 85), int(62, 75));
    const corBase = hsl(H, int(48, 78), int(38, 50));
    const corSombra = hsl(H, int(55, 85), int(16, 25));
    const corSec = hsl(H2, int(68, 92), int(50, 64));
    const corSecSombra = hsl(H2, int(60, 85), int(20, 30));
    const corOsso = esc(['#f0e8d2', '#ded3b8', '#cfd9c8', '#f7f1e1']);
    const corOuro = esc(['#f5c542', '#e0a938', '#ffd86b']);
    const corAco = esc(['#8c9eab', '#a8bac7', '#6d7885']);

    const svg = [];

    // ==================== DEFINIÇÕES DE GRADIENTES E FILTROS ====================
    svg.push(`<defs>
      <linearGradient id="${uid}_pri" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${corLuz}"/>
        <stop offset="50%" stop-color="${corBase}"/>
        <stop offset="100%" stop-color="${corSombra}"/>
      </linearGradient>
      <linearGradient id="${uid}_sec" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${corSec}"/>
        <stop offset="100%" stop-color="${corSecSombra}"/>
      </linearGradient>
      <linearGradient id="${uid}_aco" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f2f7fc"/>
        <stop offset="45%" stop-color="${corAco}"/>
        <stop offset="100%" stop-color="#222a33"/>
      </linearGradient>
      <linearGradient id="${uid}_ouro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff3b8"/>
        <stop offset="50%" stop-color="${corOuro}"/>
        <stop offset="100%" stop-color="#6e4811"/>
      </linearGradient>
      <linearGradient id="${uid}_osso" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="${corOsso}"/>
        <stop offset="100%" stop-color="#7d725c"/>
      </linearGradient>
      <radialGradient id="${uid}_aura" cx="50%" cy="46%" r="52%">
        <stop offset="0%" stop-color="${corSec}" stop-opacity="0.5"/>
        <stop offset="60%" stop-color="${corBase}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#040609" stop-opacity="0"/>
      </radialGradient>
    </defs>`);

    // ==================== PRIMITIVAS DE ILUSTRAÇÃO VETORIAL ====================
    const path = (d, fill = `url(#${uid}_pri)`, stroke = tinta, sw = 6.5, extra = '') =>
      svg.push(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`);

    // Desenha forma com contorno pesado externo + chanfro de iluminação interna (Cel-Shading)
    const formaCel = (d, fill = `url(#${uid}_pri)`, sw = 7, rimColor = 'rgba(255,255,255,0.22)') => {
      svg.push(`<path d="${d}" fill="${fill}" stroke="${tinta}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
      svg.push(`<path d="${d}" fill="none" stroke="${rimColor}" stroke-width="${Math.max(1.5, sw * 0.28)}" stroke-linejoin="round" stroke-linecap="round" opacity="0.65"/>`);
    };

    const linha = (d, sw = 3.5, cor = tinta, extra = '') =>
      svg.push(`<path d="${d}" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`);

    const circulo = (cx, cy, r, fill, stroke = tinta, sw = 5, extra = '') =>
      svg.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`);

    const espelhar = (fn, eixoX = 160) => {
      svg.push('<g>'); fn();
      svg.push(`</g><g transform="translate(${eixoX * 2},0) scale(-1,1)">`); fn();
      svg.push('</g>');
    };

    // ==================== 1. CENÁRIO E ATMOSFERA DA CARTA ====================
    // Nas famílias ampliadas, consumir a mesma sequência aleatória mesmo sem
    // cenário mantém a criatura idêntica ao alternar o fundo da galeria.
    const inicioCenario = svg.length;
    if (fundo || id === 2 || id === 3) {
      const hBg = id === 4 ? esc([125, 32, 200, 15]) : H;
      path('M0 0 H320 V320 H0 Z', hsl(hBg, 38, 7), 'none', 0);
      circulo(160, 148, 150, `url(#${uid}_aura)`, 'none', 0);

      if (id === 4) {
        // Cenário Selvagem Detalhado (Lua/Sol, Cordilheiras, Pinheiros/Rochas)
        circulo(int(75, 245), int(62, 95), int(30, 44), hsl(42, 85, 72), 'none', 0, 'opacity="0.22"');
        path('M0 242 L55 168 L112 218 L182 148 L255 212 L320 165 V320 H0 Z', hsl(hBg, 30, 13), 'none', 0);
        path('M0 264 L42 228 L88 258 L148 218 L218 256 L278 224 L320 258 V320 H0 Z', hsl(hBg, 35, 9), 'none', 0);
        path('M0 276 Q90 258 165 276 T320 272 V320 H0 Z', '#05070a', 'none', 0);
      } else if (id === 2) {
        // Horizonte extraterrestre: planetas, estrelas e luas atrás da silhueta.
        const planetaX = esc([65, 250]);
        circulo(planetaX, 65, 38, hsl(H2, 45, 22), 'none', 0);
        svg.push(`<ellipse cx="${planetaX}" cy="65" rx="58" ry="13" fill="none" stroke="${hsl(H2, 48, 38)}" stroke-width="3" transform="rotate(-24 ${planetaX} 65)" opacity="0.65"/>`);
        for (let i = 0; i < 32; i++) {
          circulo(int(12, 308), int(12, 259), num(0.6, 1.8), '#d8eefa', 'none', 0, `opacity="${num(0.3, 0.85)}"`);
        }
        path('M0 276 L42 250 L78 268 L112 252 L174 274 L242 246 L288 260 L320 250 V320 H0Z', hsl(H, 24, 13), 'none', 0);
        linha('M0 295 Q160 270 320 295', 1.5, hsl(H2, 40, 27));
      } else if (id === 3) {
        // Ruínas e névoa baixa: a atmosfera não substitui a anatomia da criatura.
        circulo(244, 65, 36, '#c3d4bc', 'none', 0, 'opacity="0.2"');
        path('M12 270 V178 Q29 155 46 178 V270 M274 270 V202 Q293 178 308 202 V270', hsl(H, 20, 17), 'none', 0);
        path('M18 176 L18 120 L26 110 L30 160 L42 146 L36 182 M280 206 L290 144 L302 128 L298 177', 'none', hsl(H, 20, 18), 5);
        path('M0 274 Q55 255 110 276 T222 270 T320 277 V320 H0Z', '#080e13', 'none', 0);
        for (let i = 0; i < 4; i++) {
          svg.push(`<ellipse cx="${int(30, 290)}" cy="${int(272, 301)}" rx="${int(35, 100)}" ry="${int(4, 9)}" fill="${corLuz}" opacity="0.05"/>`);
        }
      } else {
        // Raios Dimensionais / Rúnicos / Sci-Fi
        const qtdRaios = int(10, 16);
        for (let i = 0; i < qtdRaios; i++) {
          const ang = (i * Math.PI * 2) / qtdRaios;
          linha(`M160 148 L${(160 + Math.cos(ang) * 180).toFixed(1)} ${(148 + Math.sin(ang) * 180).toFixed(1)}`, 2.5, hsl(H, 40, 12));
        }
        // Mandalas de Poder ou Anéis Tecnológicos
        circulo(160, 148, 118, 'none', hsl(H2, 55, 22), 2);
        circulo(160, 148, 102, 'none', hsl(H, 50, 18), 1.8, 'stroke-dasharray="10 6"');
        for (let i = 0; i < 16; i++) {
          const px = int(18, 302), py = int(18, 275), pr = num(1.4, 3.4);
          circulo(px, py, pr, i % 2 === 0 ? corSec : corLuz, 'none', 0, 'opacity="0.55"');
        }
        path('M0 278 Q82 258 160 276 T320 270 V320 H0 Z', '#040609', 'none', 0);
      }
    }
    if (!fundo && (id === 2 || id === 3)) svg.splice(inicioCenario);
    // Sombra projetada no solo
    svg.push(`<ellipse cx="160" cy="292" rx="108" ry="13" fill="rgba(0,0,0,0.68)"/>`);

    // ==================== 2. COMPONENTES ANATÔMICOS DE ALTA PRECISÃO ====================

    // Olhos expressivos com arcada supraciliar, esclera, íris, pupila e reflexo especular
    const desenharOlho = (x, y, r = 9, estilo = 'fera', corIris = corSec, inclinacao = 12) => {
      svg.push(`<g transform="rotate(${inclinacao} ${x} ${y})">`);
      if (estilo === 'humano') {
        path(`M${x - r * 1.35} ${y} C${x - r * 0.5} ${y - r * 0.95} ${x + r * 0.5} ${y - r * 0.95} ${x + r * 1.35} ${y} C${x + r * 0.5} ${y + r * 0.85} ${x - r * 0.5} ${y + r * 0.85} ${x - r * 1.35} ${y} Z`, '#f5f2eb', tinta, 3.2);
        circulo(x, y, r * 0.58, corIris, tinta, 2.2);
        circulo(x, y, r * 0.26, tinta, 'none', 0);
        circulo(x - r * 0.22, y - r * 0.22, Math.max(1.3, r * 0.18), '#ffffff', 'none', 0);
      } else if (estilo === 'energia') {
        path(`M${x - r * 1.4} ${y + r * 0.2} L${x - r * 0.3} ${y - r * 0.85} L${x + r * 1.4} ${y - r * 0.1} L${x + r * 0.4} ${y + r * 0.85} Z`, corIris, tinta, 3.5);
        path(`M${x - r * 0.7} ${y} L${x + r * 0.7} ${y - r * 0.1}`, '#ffffff', '#ffffff', 2);
      } else {
        // Olho amendoado agressivo de Fera / Dragão / Monstro
        path(`M${x - r * 1.3} ${y + r * 0.15} C${x - r * 0.6} ${y - r * 0.95} ${x + r * 0.5} ${y - r * 0.95} ${x + r * 1.3} ${y - r * 0.1} C${x + r * 0.6} ${y + r * 0.95} ${x - r * 0.5} ${y + r * 0.95} ${x - r * 1.3} ${y + r * 0.15} Z`, '#f7f0d4', tinta, 3.8);
        circulo(x, y, r * 0.66, corIris, tinta, 2.5);
        if (estilo === 'fenda') {
          path(`M${x} ${y - r * 0.55} Q${x + r * 0.22} ${y} ${x} ${y + r * 0.55} Q${x - r * 0.22} ${y} ${x} ${y - r * 0.55} Z`, tinta, 'none', 0);
        } else {
          circulo(x, y, r * 0.32, tinta, 'none', 0);
        }
        circulo(x - r * 0.25, y - r * 0.22, Math.max(1.5, r * 0.2), '#ffffff', 'none', 0);
      }
      svg.push('</g>');
    };

    // Chifres segmentados de alta complexidade (Inspirados nas Imagens 2 e 3)
    const desenharChifres = (xBase = 116, yBase = 88, escala = 1, variante = int(0, 2)) => {
      espelhar(() => {
        if (variante === 0) {
          // Chifre Curvo Segmentado Clássico (Imagem 3)
          formaCel(`M${xBase} ${yBase} C${xBase - 58 * escala} ${yBase - 8 * escala} ${xBase - 78 * escala} ${yBase - 68 * escala} ${xBase - 30 * escala} ${yBase - 86 * escala} C${xBase - 50 * escala} ${yBase - 54 * escala} ${xBase - 34 * escala} ${yBase - 20 * escala} ${xBase + 10} ${yBase - 14} Z`, `url(#${uid}_osso)`, 7);
          for (let i = 1; i <= 4; i++) {
            const t = i * 0.2;
            linha(`M${xBase - (12 + i * 9) * escala} ${yBase - (i * 11) * escala} Q${xBase - (18 + i * 9) * escala} ${yBase - (14 + i * 11) * escala} ${xBase - (2 + i * 7) * escala} ${yBase - (16 + i * 11) * escala}`, 3.5);
          }
        } else if (variante === 1) {
          // Chifres Dracônicos Duplos Afiados (Imagem 2)
          formaCel(`M${xBase} ${yBase} C${xBase - 38 * escala} ${yBase - 38 * escala} ${xBase - 64 * escala} ${yBase - 75 * escala} ${xBase - 74 * escala} ${yBase - 88 * escala} C${xBase - 42 * escala} ${yBase - 68 * escala} ${xBase - 18 * escala} ${yBase - 35 * escala} ${xBase + 12} ${yBase - 14} Z`, `url(#${uid}_osso)`, 6.5);
          formaCel(`M${xBase - 6} ${yBase + 10} C${xBase - 38 * escala} ${yBase - 6 * escala} ${xBase - 56 * escala} ${yBase - 28 * escala} ${xBase - 64 * escala} ${yBase - 42 * escala} C${xBase - 36 * escala} ${yBase - 28 * escala} ${xBase - 16 * escala} ${yBase - 8 * escala} ${xBase + 4} ${yBase - 2} Z`, `url(#${uid}_osso)`, 5.5);
        } else {
          // Chifres de Carneiro Demoníaco Retorcidos
          formaCel(`M${xBase} ${yBase} C${xBase - 68 * escala} ${yBase - 35 * escala} ${xBase - 82 * escala} ${yBase + 42 * escala} ${xBase - 28 * escala} ${yBase + 42 * escala} C${xBase - 48 * escala} ${yBase + 26 * escala} ${xBase - 42 * escala} ${yBase - 12 * escala} ${xBase + 8} ${yBase - 12} Z`, `url(#${uid}_osso)`, 7);
          linha(`M${xBase - 18 * escala} ${yBase - 8 * escala} Q${xBase - 35 * escala} ${yBase + 2 * escala} ${xBase - 25 * escala} ${yBase + 16 * escala}`, 3.5);
        }
      });
    };

    // Asas Completas Articuladas (Dracônica/Morcego com falanges ou Plumagem em Camadas)
    const desenharAsas = (tipoAsa = 'draconica', fillMembrana = `url(#${uid}_sec)`) => {
      espelhar(() => {
        if (tipoAsa === 'draconica') {
          // Estrutura inspirada na Imagem 2 e Imagem 3
          formaCel('M118 158 C78 88 32 58 6 78 C24 94 28 122 14 148 C42 138 58 156 48 184 C74 168 94 180 102 204 C114 186 126 188 134 198 Z', fillMembrana, 7);
          // Ossos/Falanges da asa e garra superior
          formaCel('M120 148 C82 92 42 68 8 78 C32 82 68 104 114 158 Z', `url(#${uid}_pri)`, 5.5);
          linha('M76 102 L48 182 M94 122 L102 200 M58 90 L16 146', 3.5);
          path('M52 82 L42 60 L64 78 Z', `url(#${uid}_osso)`, tinta, 4.5);
        } else if (tipoAsa === 'plumagem') {
          // Asa de Ave / Anjo com 3 fileiras de penas (Rêmiges primárias, secundárias e coberteiras)
          formaCel('M118 152 C72 92 22 92 6 128 Q28 136 12 158 Q38 162 24 184 Q54 184 44 204 Q82 198 118 202 Z', fillMembrana, 7);
          formaCel('M118 148 C82 108 42 108 24 134 Q48 140 38 158 Q68 158 62 174 Q92 170 118 176 Z', `url(#${uid}_pri)`, 5.5);
          linha('M88 128 L28 146 M94 144 L44 168 M102 158 L64 184', 3);
        } else if (tipoAsa === 'inseto') {
          path('M122 152 C42 78 2 112 14 162 C26 196 86 186 122 172 Z', 'rgba(185, 245, 255, 0.38)', tinta, 5.5);
          path('M122 164 C58 128 18 162 32 198 C46 222 92 204 122 184 Z', 'rgba(185, 245, 255, 0.28)', tinta, 4.5);
          linha('M114 156 L24 142 M74 149 L46 172 M92 152 L72 178', 2.2, corSec);
        }
      });
    };

    // Componentes v5. Todos são vetores locais; nenhuma imagem ou fonte externa.
    const em = (x, y, escala, fn, rotacao = 0) => {
      svg.push(`<g transform="translate(${x} ${y}) rotate(${rotacao}) scale(${escala})">`);
      fn();
      svg.push('</g>');
    };
    const elipse = (x, y, rx, ry, cor, borda = tinta, sw = 4) =>
      svg.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${cor}" stroke="${borda}" stroke-width="${sw}"/>`);
    const tubo = (d, largura, cor, brilho = true) => {
      linha(d, largura + 5, tinta);
      linha(d, largura, cor);
      if (brilho) linha(d, Math.max(1.5, largura * 0.22), 'rgba(255,255,255,0.22)');
    };
    const osso = (x1, y1, x2, y2, largura = 9) => {
      tubo(`M${x1} ${y1} L${x2} ${y2}`, largura, corOsso);
      circulo(x1, y1, largura * 0.6, corOsso, tinta, 2.5);
      circulo(x2, y2, largura * 0.6, corOsso, tinta, 2.5);
    };
    const costura = (x1, y1, x2, y2, pontos = 5) => {
      linha(`M${x1} ${y1} L${x2} ${y2}`, 2.5, '#34232d');
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const dx = -(y2 - y1) / len * 4, dy = (x2 - x1) / len * 4;
      for (let i = 0; i < pontos; i++) {
        const t = (i + 0.5) / pontos, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        linha(`M${x - dx} ${y - dy} L${x + dx} ${y + dy}`, 2, '#d0bb9d');
      }
    };
    const cranio = (x, y, escala = 1, olhos = corSec) => em(x, y, escala, () => {
      formaCel('M-34 -16 C-39 -56 39 -56 34 -16 L38 3 L26 15 L21 36 Q0 44 -21 36 L-26 15 L-38 3Z', `url(#${uid}_osso)`, 5);
      path('M-29 -13 Q-16 -19 -6 -7 L-9 6 Q-28 12 -29 -13Z M29 -13 Q16 -19 6 -7 L9 6 Q28 12 29 -13Z', '#131823', tinta, 2.5);
      circulo(-17, -3, 4, olhos, 'none', 0); circulo(17, -3, 4, olhos, 'none', 0);
      path('M0 5 L-6 17 H6Z', tinta, 'none', 0);
      linha('M-20 25 Q0 30 20 25', 2.5);
      for (let i = -14; i <= 14; i += 7) linha(`M${i} 22 V35`, 2);
      linha('M7 -39 L2 -26 L11 -22 L6 -16', 2, '#786f68');
    });
    const costelas = (x, y, escala = 1, quantidade = 4) => em(x, y, escala, () => {
      tubo(`M0 -5 V${quantidade * 13 + 8}`, 8, corOsso);
      for (let i = 0; i < quantidade; i++) {
        const cy = i * 13, w = 34 - i * 4;
        tubo(`M-3 ${cy + 7} Q${-w - 14} ${cy + 6} ${-w} ${cy - 7}`, 5, corOsso, false);
        tubo(`M3 ${cy + 7} Q${w + 14} ${cy + 6} ${w} ${cy - 7}`, 5, corOsso, false);
      }
    });
    const maoMorta = (x, y, pele, esqueletica = false, rotacao = 0) => em(x, y, 1, () => {
      if (esqueletica) {
        osso(-5, -8, 5, 6, 5);
        for (let i = 0; i < 3; i++) tubo(`M${-7 + i * 6} 1 L${-10 + i * 6} 13 L${-5 + i * 6} 17`, 3, corOsso, false);
      } else {
        formaCel('M-12 -8 L6 -10 L14 -2 L12 13 L5 10 L0 16 L-5 11 L-10 14 L-14 4Z', pele, 4);
        linha('M-5 1 V10 M2 0 V9 M8 -1 V8', 1.8);
      }
    }, rotacao);
    const chama = (x, y, escala = 1, cor = corSec) => em(x, y, escala, () => {
      path('M0 24 C-34 12 -20 -14 -9 -20 L-10 0 Q7 -11 3 -38 C29 -19 39 13 0 24Z', cor, tinta, 3);
      path('M0 18 Q-13 5 2 -10 Q19 8 0 18Z', '#e8fff5', 'none', 0);
    });
    // Ponto de empunhadura em (x,y). Cada equipamento tem silhueta própria.
    const equipamento = (tipoArma, x, y, escala = 1) => em(x, y, escala, () => {
      const metal = `url(#${uid}_aco)`, ouro = `url(#${uid}_ouro)`;
      if (tipoArma === 'espada') {
        formaCel('M-7 -24 L-9 -111 L0 -130 L10 -111 L7 -24Z', metal, 4);
        linha('M0 -117 V-30', 1.8, '#e6f1f8');
        path('M-25 -26 L0 -32 L25 -26 L20 -16 H-20Z', ouro, tinta, 4);
        tubo('M0 -16 V22', 8, '#593526', false); circulo(0, 25, 7, ouro, tinta, 3);
      } else if (tipoArma === 'machado') {
        tubo('M0 -118 V75', 8, '#5d4431');
        formaCel('M0 -101 Q-48 -127 -43 -65 Q-23 -69 0 -77 L0 -101 M4 -102 L25 -113 L36 -76 L4 -80Z', metal, 4.5);
        linha('M-38 -107 Q-46 -87 -38 -72', 2, '#e5edf4');
      } else if (tipoArma === 'forcado') {
        tubo('M0 -80 V78', 7, '#8b643c');
        linha('M-19 -123 V-91 Q0 -69 19 -91 V-123 M0 -126 V-81', 10, tinta);
        linha('M-19 -123 V-91 Q0 -69 19 -91 V-123 M0 -126 V-81', 5, corAco);
      } else if (tipoArma === 'pa') {
        tubo('M0 -105 V64', 7, '#8b643c');
        formaCel('M-14 48 H14 L17 80 L0 94 L-17 80Z', metal, 4);
        path('M-11 -119 H11 V-104 H-11Z', 'none', corAco, 5);
      } else if (tipoArma === 'arco') {
        tubo('M0 -101 Q-65 0 0 101', 9, '#735034');
        linha('M0 -101 L27 0 L0 101', 1.8, corOsso);
        tubo('M-34 0 H89', 3, '#b9a486', false);
        path('M-45 0 L-28 -8 L-30 0 L-28 8Z', corAco, tinta, 2);
        path('M76 0 L90 -8 L88 0 L90 8Z', corSec, tinta, 2);
      } else if (tipoArma === 'cajado') {
        tubo('M0 -97 L-6 78', 8, '#554142');
        path('M-20 -110 L-14 -84 L0 -74 L15 -84 L22 -110', 'none', ouro, 5);
        chama(0, -113, 0.68);
      } else if (tipoArma === 'foice') {
        tubo('M0 -123 V84', 8, '#5d4431');
        formaCel('M5 -118 C-57 -143 -110 -115 -130 -65 Q-70 -110 -3 -95Z', metal, 5);
        linha('M-116 -81 Q-61 -115 -7 -106', 2, '#dfedf4');
      } else if (tipoArma === 'escudo') {
        formaCel('M-35 -47 L0 -59 L35 -47 L31 6 Q23 37 0 52 Q-23 37 -31 6Z', metal, 5);
        formaCel('M-26 -40 L0 -48 L26 -40 L22 6 Q16 27 0 38 Q-16 27 -22 6Z', `url(#${uid}_sec)`, 3);
        cranio(0, -7, 0.47);
      }
    });

    // =========================================================================
    // MOTOR 1: ANIMAIS SELVAGENS REAIS (18 Espécies com Anatomia Muscular e Pelagem)
    // =========================================================================
    if (id === 4) {
      // Paletas Naturais autênticas por espécie
      const paletasAnimais = {
        lobo: [
          { pri: '#636d7a', som: '#343b44', peito: '#dce3eb', olho: '#ffbf00', mascara: true },
          { pri: '#42474f', som: '#1f2329', peito: '#9aa4b0', olho: '#ffe600', mascara: true },
          { pri: '#d8e0e8', som: '#8c99a8', peito: '#ffffff', olho: '#5ce1e6', mascara: false }
        ],
        cachorro: [
          { pri: '#c98842', som: '#7d4b18', peito: '#f2dfc4', olho: '#593515', mascara: false, raca: 'caramelo' },
          { pri: '#24272c', som: '#101214', peito: '#c77732', olho: '#6e4219', mascara: true, raca: 'rottweiler' },
          { pri: '#596370', som: '#2b3138', peito: '#f2f5f8', olho: '#4dd2ff', mascara: true, raca: 'husky' },
          { pri: '#a66232', som: '#382212', peito: '#e8cda5', olho: '#4a2c12', mascara: true, raca: 'pastor' }
        ],
        raposa: [
          { pri: '#e05819', som: '#8f2c06', peito: '#f7f2eb', olho: '#ffae00', mascara: true }
        ],
        urso: [
          { pri: '#5e3c23', som: '#301c0e', peito: '#855836', olho: '#3b2310', mascara: false },
          { pri: '#212429', som: '#0d0f12', peito: '#453526', olho: '#ffb700', mascara: false },
          { pri: '#e6edf2', som: '#99a8b5', peito: '#ffffff', olho: '#1f2933', mascara: false }
        ],
        leao: [
          { pri: '#d99e46', som: '#8f5d19', peito: '#f2dbb0', olho: '#ffaa00', juba: '#4a250d' },
          { pri: '#c98c36', som: '#78490f', peito: '#ebd0a0', olho: '#ff9900', juba: '#291407' }
        ],
        tigre: [
          { pri: '#eb751c', som: '#993d05', peito: '#f7f2e8', olho: '#ffea00', listras: true },
          { pri: '#e8edf2', som: '#96a3b0', peito: '#ffffff', olho: '#52d1ff', listras: true }
        ],
        pantera: [
          { pri: '#22252e', som: '#0d0f14', peito: '#323645', olho: '#c8ff00', rosetas: true }
        ],
        gato: [
          { pri: '#de8738', som: '#8c4911', peito: '#f7ebd9', olho: '#88e024', listras: true },
          { pri: '#6c7582', som: '#363c45', peito: '#e6ecf2', olho: '#ffbf00', listras: true }
        ],
        touro: [
          { pri: '#382419', som: '#1a0f0a', peito: '#4f3324', olho: '#ff3300' },
          { pri: '#211f24', som: '#0c0b0d', peito: '#333038', olho: '#ffaa00' }
        ],
        bufalo: [
          { pri: '#2e2724', som: '#141110', peito: '#423833', olho: '#ff9900' }
        ],
        cervo: [
          { pri: '#a86b38', som: '#5e3414', peito: '#ebd4b7', olho: '#38200d' }
        ],
        javali: [
          { pri: '#4a372b', som: '#241912', peito: '#634b3b', olho: '#ff5500' }
        ]
      };

      // -------------------- AVES DE RAPINA (Águia / Coruja) --------------------
      if (subtipo === 'aguia' || subtipo === 'coruja') {
        const ehCoruja = subtipo === 'coruja';
        const corPena = ehCoruja ? esc(['#785c44', '#d9e0e8', '#5c4633']) : esc(['#4a3222', '#2e2118', '#63442b']);
        const corPeitoAve = ehCoruja ? '#f0e6d8' : '#e8dec8';
        const corCabeca = (!ehCoruja && chance(0.7)) ? '#f5f2eb' : corPena; // Águia-careca ou real

        // Poleiro rochoso / tronco retorcido detalhado
        formaCel('M10 278 C85 248 165 258 310 282 L310 302 C175 282 95 276 10 298 Z', '#3d2616', 7);
        linha('M45 274 Q120 264 210 276 M85 284 Q165 276 265 288', 3, '#1f1209');

        // Asas majestosas abertas com camadas de penas
        desenharAsas('plumagem', corPena);

        // Cauda em leque de penas abaixo do poleiro
        formaCel('M124 248 L104 304 L132 296 L146 308 L160 298 L174 308 L188 296 L216 304 L196 248 Z', corCabeca, 6.5);
        linha('M138 256 L124 296 M160 256 V296 M182 256 L196 296', 3);

        // Torso robusto emplumado
        formaCel(`M106 168 C94 212 108 256 132 268 H188 C212 256 226 212 214 168 C196 142 124 142 106 168 Z`, corPena, 7);
        formaCel(`M122 178 C116 212 124 248 140 262 H180 C196 248 204 212 198 178 C182 162 138 162 122 178 Z`, corPeitoAve, 5);
        // Escamas de penas no peito
        for (let py = 188; py <= 244; py += 14) {
          linha(`M132 ${py} Q146 ${py + 10} 160 ${py} Q174 ${py + 10} 188 ${py}`, 3.2);
          linha(`M140 ${py + 7} Q160 ${py + 16} 180 ${py + 7}`, 2.5);
        }

        // Garras amarelas cravadas no tronco com unhas negras curvas
        espelhar(() => {
          formaCel('M126 256 C116 262 114 276 120 282 C126 276 132 276 136 284 C142 276 146 276 150 280 C152 268 146 258 136 256 Z', '#ffae19', 5);
          path('M118 278 Q114 290 122 292 M135 280 Q134 292 140 294 M149 278 Q152 288 146 290', tinta, tinta, 3.5);
        });

        // Cabeça esculpida (Sem círculo simples! Penas faciais, penachos auriculares e sobrecenho)
        if (ehCoruja) {
          formaCel('M104 114 L82 62 L124 82 C146 72 174 72 196 82 L238 62 L216 114 C224 146 202 172 160 172 C118 172 96 146 104 114 Z', corPena, 7);
          // Disco facial característico das corujas
          espelhar(() => {
            formaCel('M160 112 C148 86 112 88 110 118 C108 146 142 158 160 142 Z', corPeitoAve, 5);
          });
        } else {
          // Cabeça de Águia com penacho nucal agressivo
          formaCel('M112 108 L96 88 L116 86 L108 68 L136 74 C152 64 168 64 184 74 L212 68 L204 86 L224 88 L208 108 L216 146 L192 168 L160 176 L128 168 L104 146 Z', corCabeca, 7);
        }

        // Olhos sob sobrecenho franzido feroz
        desenharOlho(134, 118, ehCoruja ? 12 : 9, 'fera', '#ffaa00', 14);
        desenharOlho(186, 118, ehCoruja ? 12 : 9, 'fera', '#ffaa00', -14);
        espelhar(() => path('M114 102 L152 114 L148 104 L118 94 Z', corCabeca, tinta, 4.5));

        // Bico adunco de predador com cera nasal e ponta afiada
        formaCel('M140 122 Q160 108 180 122 C182 142 172 158 160 172 C148 158 138 142 140 122 Z', `url(#${uid}_ouro)`, 6.5);
        formaCel('M144 120 Q160 110 176 120 Q160 128 144 120 Z', '#e69112', 4.5);
        linha('M160 118 V166', 2.5);

      // -------------------- INSETOS E ARACNÍDEOS (Louva-a-Deus, Besouro, Aranha) --------------------
      } else if (['besouro', 'louva-a-deus', 'aranha'].includes(subtipo)) {
        if (subtipo === 'louva-a-deus') {
          // Louva-a-Deus Predador em Postura de Ataque com Foice Serrilhada
          desenharAsas('inseto');
          // Abdômen e Tórax alongado com placas quitinosas
          formaCel('M138 192 C122 228 126 276 160 294 C194 276 198 228 182 192 Z', `url(#${uid}_pri)`, 6.5);
          for (let y = 212; y <= 272; y += 16) linha(`M134 ${y} Q160 ${y + 10} 186 ${y}`, 3.5);
          formaCel('M142 122 L134 196 H186 L178 122 Z', `url(#${uid}_pri)`, 6.5);
          linha('M160 126 V192', 3);

          // Braços em Foice Raptoriais com espinhos serrilhados
          espelhar(() => {
            formaCel('M142 138 L78 96 L52 148 L72 156 L88 118 L138 154 Z', `url(#${uid}_pri)`, 6.5);
            formaCel('M52 148 L22 208 C48 202 76 184 92 156 L72 146 Z', `url(#${uid}_sec)`, 6.5);
            // Espinhos de caça na lâmina
            path('M58 188 L48 206 L68 182 M72 176 L64 194 L82 168 M84 164 L78 180 L90 158', corOsso, tinta, 3.5);
          });

          // Cabeça triangular de Louva-a-Deus com olhos compostos globulares e antenas
          espelhar(() => linha('M146 78 C128 36 92 22 54 28', 4.5));
          formaCel('M112 84 L160 72 L208 84 L174 134 H146 Z', `url(#${uid}_pri)`, 6.5);
          espelhar(() => {
            formaCel('M116 74 C92 74 88 108 114 116 C128 112 132 82 116 74 Z', `url(#${uid}_sec)`, 6);
            circulo(106, 90, 5, '#ffffff', 'none', 0, 'opacity="0.7"');
            path('M144 128 L136 146 L152 140 Z', corOsso, tinta, 4);
          });

        } else {
          // Besouro Hércules Couraçado ou Aranha Viúva-Negra / Tarântula
          const ehAranha = subtipo === 'aranha';
          // 6 ou 8 Patas articuladas em 3 segmentos (Fêmur, Tíbia e Tarso com garras)
          espelhar(() => {
            const qtdPatas = ehAranha ? 4 : 3;
            for (let p = 0; p < qtdPatas; p++) {
              const yBase = 132 + p * 24;
              const ang = -32 + p * 24;
              const xJoelho = 64 - (p % 2) * 14;
              const yJoelho = yBase - 28 + p * 18;
              const xPe = 22 + p * 8;
              const yPe = yJoelho + 42 + p * 8;
              formaCel(`M128 ${yBase} L${xJoelho} ${yJoelho} L${xJoelho + 8} ${yJoelho + 12} L128 ${yBase + 12} Z`, `url(#${uid}_pri)`, 6);
              formaCel(`M${xJoelho} ${yJoelho} L${xPe} ${yPe} L${xPe + 10} ${yPe - 4} L${xJoelho + 10} ${yJoelho + 8} Z`, `url(#${uid}_sec)`, 5.5);
            }
          });

          // Abdômen / Élitros Blindados
          formaCel('M96 156 C86 218 104 282 160 290 C216 282 234 218 224 156 C198 142 122 142 96 156 Z', `url(#${uid}_pri)`, 7.5);
          if (!ehAranha) {
            linha('M160 150 V288', 5.5); // Linha divisória dos élitros do besouro
            // Chifre Torácico e Cefálico de Besouro Hércules / Kabuto
            espelhar(() => formaCel('M124 108 C88 86 78 48 104 32 C102 64 114 84 138 96 Z', `url(#${uid}_osso)`, 6));
            formaCel('M146 102 L138 42 L122 26 L160 14 L198 26 L182 42 L174 102 Z', `url(#${uid}_sec)`, 6.5);
          } else {
            // Ampulheta vermelha / Runa aracnídea no abdômen
            path('M142 196 L178 196 L166 222 L178 248 L142 248 L154 222 Z', corSec, tinta, 4.5);
          }
          // Cefalotórax e Quelíceras / Mandíbulas
          formaCel('M112 108 C112 82 208 82 208 108 L220 156 C188 146 132 146 100 156 Z', corSombra, 7);
          espelhar(() => {
            formaCel('M128 96 C112 68 122 52 144 62 C134 72 134 84 142 94 Z', `url(#${uid}_osso)`, 5.5);
            desenharOlho(134, 114, 7, 'energia', '#ff1e38', 15);
            if (ehAranha) desenharOlho(148, 106, 5, 'energia', '#ff1e38', 8);
          });
        }

      // -------------------- SERPENTE / NAJA REAL --------------------
      } else if (subtipo === 'cobra') {
        // Anéis musculosos escamados no chão
        formaCel('M68 248 C28 248 32 292 160 292 C288 292 292 248 242 242 C202 238 118 238 68 248 Z', `url(#${uid}_pri)`, 7.5);
        formaCel('M88 224 C56 224 62 264 160 264 C258 264 264 224 222 218 Z', `url(#${uid}_pri)`, 7);
        // Capelo de Naja Rei aberto com padrões ocelares
        formaCel('M160 246 C142 208 72 178 84 106 C94 52 226 52 236 106 C248 178 178 208 160 246 Z', `url(#${uid}_sec)`, 7.5);
        espelhar(() => {
          circulo(114, 118, 14, corLuz, tinta, 4.5);
          circulo(114, 118, 6, tinta, 'none', 0);
        });
        // Coluna ventral escamada (Scutes)
        formaCel('M134 248 V106 C134 76 186 76 186 106 V248 Z', `url(#${uid}_osso)`, 6);
        for (let y = 122; y <= 236; y += 14) linha(`M136 ${y} Q160 ${y + 8} 184 ${y}`, 3);
        // Cabeça reptiliana angulosa com boca aberta, presas de veneno e língua bifurcada
        formaCel('M120 88 L160 66 L200 88 L192 126 L160 138 L128 126 Z', `url(#${uid}_pri)`, 7);
        desenharOlho(138, 96, 8, 'fenda', '#ffea00', 18);
        desenharOlho(182, 96, 8, 'fenda', '#ffea00', -18);
        path('M140 122 L144 142 L149 124 M180 122 L176 142 L171 124', '#ffffff', tinta, 3.5);
        linha('M160 134 V166 L148 182 M160 166 L172 182', 3.5, '#ff1e42');

      // -------------------- MAMÍFEROS QUADRÚPEDES REAIS (Caninos, Felinos, Ursos, Bovinos) --------------------
      } else {
        const cfg = esc(paletasAnimais[subtipo] || paletasAnimais.lobo);
        const ehCanino = ['lobo', 'cachorro', 'raposa'].includes(subtipo);
        const ehFelino = ['leao', 'tigre', 'pantera', 'gato'].includes(subtipo);
        const ehBovino = ['touro', 'bufalo', 'cervo', 'javali'].includes(subtipo);
        const ehUrso = subtipo === 'urso';

        // Escala de porte anatômico real
        const escalaPorte = ['raposa', 'gato'].includes(subtipo) ? 0.78
          : subtipo === 'cachorro' ? num(0.84, 0.94)
          : ['urso', 'touro', 'bufalo', 'leao'].includes(subtipo) ? 1.08 : 0.98;

        const idPelo = `${uid}_pelo`;
        svg.push(`<defs>
          <linearGradient id="${idPelo}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${cfg.pri}"/>
            <stop offset="100%" stop-color="${cfg.som}"/>
          </linearGradient>
        </defs>`);

        svg.push(`<g transform="translate(160,288) scale(${escalaPorte}) translate(-160,-288)">`);

        // 1. CAUDA ANATÔMICA (Posição traseira direita X=235..305)
        if (subtipo === 'raposa' || ehCanino) {
          // Cauda espessa peluda com tufos e ponta clara opcional
          formaCel('M228 198 C268 168 308 188 296 232 C286 258 248 252 224 222 Z', `url(#${idPelo})`, 6.5);
          if (subtipo === 'raposa' || cfg.raca === 'husky') {
            path('M276 188 C302 196 304 224 284 242 C274 224 268 208 276 188 Z', cfg.peito, tinta, 4.5);
          }
        } else if (ehFelino) {
          // Cauda longa muscular sinuosa de felino
          formaCel('M232 196 C278 182 292 228 302 204 C312 184 294 166 284 182 C276 196 270 168 228 182 Z', `url(#${idPelo})`, 6.5);
          if (subtipo === 'leao') formaCel('M286 172 C308 162 314 192 292 196 Z', cfg.juba || '#2b1608', 5.5);
        } else if (ehBovino && subtipo !== 'cervo') {
          formaCel('M236 186 C276 192 288 228 282 252 L272 246 C276 224 264 202 234 198 Z', `url(#${idPelo})`, 6);
          formaCel('M276 244 L292 268 L268 264 Z', '#1a110b', 5);
        } else {
          // Cauda curta de Urso / Cervo
          formaCel('M234 182 C258 176 262 202 240 208 Z', `url(#${idPelo})`, 6);
        }

        // 2. MEMBROS INTERNOS (Pata traseira direita e dianteira direita em sombra para profundidade 3D)
        formaCel('M198 212 L186 252 L194 286 H218 L214 248 L224 212 Z', cfg.som, 6.5);
        formaCel('M124 212 L118 254 L122 286 H146 L144 250 L148 212 Z', cfg.som, 6.5);

        // 3. TORSO MUSCULAR QUADRÚPEDE (Escápula, Cupim/Dorso, Costelas, Flanco e Coxa Traseira)
        const yCupim = (ehUrso || subtipo === 'touro' || subtipo === 'bufalo') ? 132 : 154;
        formaCel(`M86 188 C86 ${yCupim} 128 ${yCupim - 10} 166 158 C202 162 238 156 248 184 C258 212 246 238 232 252 L238 286 H210 L204 244 L192 226 C166 238 138 238 116 226 L112 286 H82 L88 236 C78 218 82 202 86 188 Z`, `url(#${idPelo})`, 7);

        // Peitoral claro / Pelagem ventral
        if (ehCanino || ehFelino || subtipo === 'cervo') {
          path('M86 176 C82 206 94 228 118 232 C142 236 176 232 194 222 C164 218 128 212 108 176 Z', cfg.peito, tinta, 4.5);
        }

        // Padrões de Pelagem Reais (Listras de Tigre, Rosetas, Manchas, Cerdas)
        if (cfg.listras) {
          for (let lx = 128; lx <= 224; lx += 16) {
            path(`M${lx} 158 L${lx - 8} 198 L${lx + 2} 184 L${lx - 4} 214`, tinta, tinta, 3.5);
          }
        } else if (cfg.rosetas) {
          for (let rx = 135; rx <= 215; rx += 24) {
            circulo(rx, 185 + (rx % 2) * 14, 7, 'none', '#090a0d', 3.5, 'stroke-dasharray="8 4"');
          }
        } else if (subtipo === 'cervo') {
          for (let sx = 138; sx <= 222; sx += 18) {
            circulo(sx, 178 + (sx % 3) * 8, 4.5, '#fff5e4', 'none', 0);
          }
        }

        // Garras nas patas ou Cascos fendidos nos ungulados
        [82, 122, 194, 210].forEach(px => {
          if (ehBovino) {
            path(`M${px} 286 L${px + 4} 272 H${px + 24} L${px + 28} 286 Z`, '#1c1817', tinta, 4.5);
          } else {
            path(`M${px} 286 Q${px + 4} 274 ${px + 9} 286 M${px + 9} 286 Q${px + 14} 274 ${px + 19} 286 M${px + 19} 286 Q${px + 24} 274 ${px + 28} 286`, cfg.peito, tinta, 4);
          }
        });

        // Coleira Tática / Peitoral em Cachorros
        if (subtipo === 'cachorro') {
          formaCel('M80 158 L134 196 L124 208 L74 170 Z', '#c92424', 5.5);
          circulo(96, 188, 7, `url(#${uid}_ouro)`, tinta, 3.5);
        }

        // Juba Majestosa em Camadas de Leão (ou Pelagem de Búfalo/Lobo)
        if (subtipo === 'leao') {
          formaCel('M54 112 L38 142 L56 158 L44 188 L76 196 L94 222 L126 206 L158 214 L154 178 L172 152 L152 122 L162 92 L128 84 L106 62 L82 82 L54 78 Z', cfg.juba, 7);
          formaCel('M66 116 L54 142 L68 156 L62 178 L92 186 L112 202 L138 184 L148 146 L136 102 L106 82 L78 96 Z', '#703a15', 5.5);
        }

        // 4. CHIFRES / GALHADAS TRASEIRAS E ORELHAS ANATÔMICAS (Sem círculos simples!)
        if (subtipo === 'touro' || subtipo === 'bufalo') {
          // Chifres bovinos pesados curvados para frente e para cima
          formaCel('M72 104 C28 96 12 58 34 34 C36 64 52 82 84 88 Z', `url(#${uid}_osso)`, 6.5);
          formaCel('M124 102 C164 92 178 56 156 34 C154 64 140 82 112 88 Z', `url(#${uid}_osso)`, 6.5);
        } else if (subtipo === 'cervo') {
          // Galhada Real Ramificada de 6 pontas
          formaCel('M84 88 C62 58 42 48 28 22 C44 34 56 42 64 38 L58 14 C72 28 76 46 82 54 L92 32 C94 52 92 72 94 86 Z', `url(#${uid}_osso)`, 5.5);
          formaCel('M114 88 C136 58 156 48 170 22 C154 34 142 42 134 38 L140 14 C126 28 122 46 116 54 L106 32 C104 52 106 72 104 86 Z', `url(#${uid}_osso)`, 5.5);
        }

        // Orelhas esculpidas por família
        if (subtipo === 'cachorro' && (cfg.raca === 'caramelo' || cfg.raca === 'rottweiler')) {
          // Orelhas dobradas / caídas triangulares naturais
          formaCel('M68 92 C44 96 38 132 56 142 C68 134 72 112 76 96 Z', cfg.som, 6);
          formaCel('M128 92 C152 96 158 132 140 142 C128 134 124 112 120 96 Z', cfg.som, 6);
        } else if (ehUrso || subtipo === 'leao') {
          // Orelhas robustas de Urso/Leão com cavidade auricular peluda
          formaCel('M62 98 C48 76 68 58 86 78 Z M134 98 C148 76 128 58 110 78 Z', `url(#${idPelo})`, 6);
          path('M66 90 C58 78 68 68 78 80 Z M130 90 C138 78 128 68 118 80 Z', cfg.peito, tinta, 3);
        } else {
          // Orelhas eretas alertas (Lobo, Pastor, Husky, Raposa, Tigre, Gato, Cervo)
          formaCel('M66 98 L54 46 L92 78 Z M130 98 L142 46 L104 78 Z', `url(#${idPelo})`, 6);
          path('M70 92 L62 58 L86 80 Z M126 92 L134 58 L110 80 Z', cfg.peito, tinta, 3.5);
        }

        // 5. CRÂNIO ESCULPIDO EM 3/4 (Arco zigomático, pelagem malar, focinho e mandíbula — ZERO CÍRCULOS!)
        formaCel('M64 96 C68 68 128 68 132 96 L148 118 L134 128 L144 144 L118 158 L98 168 L78 158 L52 144 L62 128 L48 118 Z', `url(#${idPelo})`, 7);

        // Máscara facial clara (Lobo, Husky, Raposa, Tigre)
        if (cfg.mascara || cfg.listras) {
          path('M58 122 Q78 106 94 124 L98 92 L102 124 Q118 106 138 122 L128 152 L98 164 L68 152 Z', cfg.peito, tinta, 4);
        }

        // Ponte nasal, Focinho 3D e Mandíbula (Aberta rugindo ou fechada com presas)
        formaCel('M72 124 Q98 112 124 124 L118 156 Q98 166 78 156 Z', cfg.peito || cfg.pri, 6);
        formaCel('M84 112 L98 102 L112 112 L108 142 L98 148 L88 142 Z', `url(#${idPelo})`, 5);

        // Trufa nasal (Rinário) esculpida
        path('M84 134 Q98 128 112 134 L106 148 L98 152 L90 148 Z', '#111317', tinta, 4);

        // Presas de Javali, Argola de Touro ou Caninos de Predador
        if (subtipo === 'javali') {
          formaCel('M74 152 C52 142 46 116 64 108 C62 126 68 138 82 146 Z M122 152 C144 142 150 116 132 108 C134 126 128 138 114 146 Z', `url(#${uid}_osso)`, 5);
        } else if (subtipo === 'touro') {
          circulo(98, 158, 12, 'none', `url(#${uid}_ouro)`, 5.5);
        } else if (ehCanino || ehFelino || ehUrso) {
          // Boca semi-aberta com presas afiadas
          path('M78 154 Q98 148 118 154 L112 168 Q98 174 84 168 Z', '#2b0f14', tinta, 4.5);
          path('M82 154 L85 166 L90 154 M114 154 L111 166 L106 154', '#ffffff', tinta, 3);
        }

        // Olhos ferozes com sobrecenho marcado
        desenharOlho(80, 112, 6.5, ehFelino || subtipo === 'raposa' ? 'fenda' : 'fera', cfg.olho, 10);
        desenharOlho(116, 112, 6.5, ehFelino || subtipo === 'raposa' ? 'fenda' : 'fera', cfg.olho, -10);
        linha('M68 102 L90 108 M128 102 L106 108', 4.5);

        svg.push('</g>');
      }
    }

    // =========================================================================
    // MOTOR 2: HUMANOS (8 Classes + Poses de Combate Empunhando ou Guardadas)
    // =========================================================================
    else if (id === 0) {
      const pele = esc(['#f4c6a0', '#de9e73', '#ab6d4b', '#6e432c', '#fae3cf']);
      const cabelo = subtipo === 'necromante' ? esc(['#e2e8f0', '#16131a', '#732896'])
        : esc(['#18151c', '#5e2b1d', '#e0ad46', '#992626', '#d8e0e8', '#3d271d']);
      const poseArma = chance(0.65) ? 'empunhando' : 'guardada';

      // Renderizador de Armas Detalhadas (Nas costas ou Empunhadas na frente com braços/mãos)
      const renderizarArmamento = (naFrente) => {
        svg.push(naFrente ? '<g>' : '<g transform="translate(-26,-16) rotate(-26 160 180)">');

        if (subtipo === 'guerreiro' || subtipo === 'paladino') {
          // Espada Montante Rúnica / Sagrada com Guarda Trabalhada
          formaCel('M244 28 L256 12 L268 28 L264 196 H248 Z', `url(#${uid}_aco)`, 6);
          linha('M256 24 V188', 2.8, '#ffffff');
          // Guarda-mão cruciforme ou alada
          formaCel('M216 192 L256 184 L296 192 L288 206 L256 200 L224 206 Z', `url(#${uid}_ouro)`, 5.5);
          circulo(256, 194, 6, corSec, tinta, 3);
          formaCel('M250 202 H262 V242 H250 Z', '#4a2514', 5);
          circulo(256, 246, 9, `url(#${uid}_ouro)`, tinta, 4.5);

          if (naFrente) {
            // Escudo Heráldico Pesado no braço esquerdo + Mão na espada
            formaCel('M38 156 L92 142 L146 156 C146 218 122 262 92 284 C62 262 38 218 38 156 Z', `url(#${uid}_sec)`, 7);
            formaCel('M50 166 L92 155 L134 166 C134 214 114 248 92 268 C70 248 50 214 50 166 Z', `url(#${uid}_pri)`, 5);
            // Brasão de Cruz / Leão no escudo
            formaCel('M84 162 H100 V202 H128 V218 H100 V258 H84 V218 H56 V202 H84 Z', `url(#${uid}_ouro)`, 4.5);
            // Manopla segurando a espada
            formaCel('M218 196 L246 212 L268 218 L264 238 L236 236 L208 216 Z', `url(#${uid}_aco)`, 6);
          }

        } else if (subtipo === 'barbaro') {
          // Machado de Batalha Duplo Colossal com Crânio no Cabo
          formaCel('M248 36 H260 V284 H248 Z', '#54301a', 6);
          formaCel('M248 76 C194 36 184 148 248 126 Z M260 76 C314 36 324 148 260 126 Z', `url(#${uid}_aco)`, 6.5);
          linha('M206 66 C196 92 200 116 214 128 M302 66 C312 92 308 116 294 128', 3, '#ffffff');
          circulo(254, 98, 10, `url(#${uid}_ouro)`, tinta, 4.5);
          if (naFrente) {
            formaCel('M206 184 L244 210 L266 214 L262 234 L232 232 L198 206 Z', pele, 6);
          }

        } else if (subtipo === 'mago' || subtipo === 'necromante') {
          // Cajado Arcano / Necromântico com Orbe ou Crânio Conjurando Energia
          formaCel('M252 68 L262 68 L244 290 L234 290 Z', '#382012', 6);
          if (subtipo === 'necromante') {
            espelhar(() => path('M146 62 C122 42 118 18 142 24', `url(#${uid}_osso)`, tinta, 5), 256);
            formaCel('M236 48 C236 24 276 24 276 48 L270 74 H242 Z', `url(#${uid}_osso)`, 5.5);
            circulo(248, 50, 5, '#00ffaa', 'none', 0);
            circulo(264, 50, 5, '#00ffaa', 'none', 0);
          } else {
            formaCel('M228 84 C206 36 256 12 256 12 C256 12 306 36 284 84 C272 62 240 62 228 84 Z', `url(#${uid}_ouro)`, 6);
            formaCel('M256 26 L272 50 L256 74 L240 50 Z', corSec, 5);
          }
          if (naFrente) {
            // Mão esquerda conjurando Círculo Arcano / Chamas Necromânticas
            circulo(68, 198, 34, `url(#${uid}_aura)`, corSec, 3, 'stroke-dasharray="6 4"');
            path('M68 158 L78 186 L106 198 L78 210 L68 238 L58 210 L30 198 L58 186 Z', corSec, tinta, 4);
            formaCel('M54 196 L82 196 L78 220 L58 220 Z', pele, 5.5);
            formaCel('M234 198 L260 202 L256 222 L232 218 Z', pele, 5.5);
          }

        } else if (subtipo === 'arqueiro') {
          // Arco Composto Élfico / Caçador + Flecha Engatilhada
          formaCel('M68 54 C14 118 14 214 72 274 C32 212 32 120 78 64 Z', `url(#${uid}_ouro)`, 6);
          linha('M72 58 L112 166 L72 270', 2.8, '#e8e0cf');
          if (naFrente) {
            linha('M28 166 H138', 5, '#59361c');
            path('M18 166 L38 156 L34 166 L38 176 Z', `url(#${uid}_aco)`, tinta, 4);
            formaCel('M102 156 L124 160 L122 176 L100 174 Z', pele, 5.5);
          }

        } else if (subtipo === 'assassino') {
          // Par de Adagas Serrilhadas Venenosas em Pose Reversa
          espelhar(() => {
            formaCel('M52 192 C18 166 12 122 38 96 C34 134 46 162 72 178 Z', `url(#${uid}_aco)`, 5.5);
            linha('M28 122 Q32 152 54 176', 3, '#00ff88'); // Fio envenenado
            if (naFrente) formaCel('M50 176 L76 182 L70 202 L44 196 Z', '#1a1f29', 5.5);
          });

        } else if (subtipo === 'monge') {
          // Bastão Shakujo / Bo com Anéis Dourados + Punhos Enfaixados
          formaCel('M246 42 H258 V288 H246 Z', '#9e6324', 6);
          circulo(252, 42, 18, 'none', `url(#${uid}_ouro)`, 6);
          circulo(240, 48, 8, 'none', `url(#${uid}_ouro)`, 3.5);
          circulo(264, 48, 8, 'none', `url(#${uid}_ouro)`, 3.5);
          if (naFrente) {
            espelhar(() => formaCel('M96 196 L126 184 L136 206 L106 218 Z', corOsso, 5.5));
          }
        }
        svg.push('</g>');
      };

      // Se a arma estiver guardada, renderiza atrás do manto
      if (poseArma === 'guardada') renderizarArmamento(false);

      // Manto / Capa Dramática com dobras de tecido
      if (subtipo !== 'monge') {
        formaCel('M90 154 L44 292 L92 284 L126 292 L160 282 L194 292 L228 284 L276 292 L230 154 Z', `url(#${uid}_sec)`, 7);
        linha('M96 172 L72 278 M224 172 L248 278', 3.5);
      }

      // Torso Anatômico e Armadura / Vestimenta de Classe
      const fillTorso = (subtipo === 'barbaro' || subtipo === 'monge') ? pele : `url(#${uid}_pri)`;
      formaCel('M92 162 C92 142 228 142 228 162 L212 292 H108 Z', fillTorso, 7);

      if (subtipo === 'guerreiro' || subtipo === 'paladino') {
        // Ombreiras em camadas (Pauldrons) e Peitoral de Placas Gótico
        espelhar(() => {
          formaCel('M114 148 C64 138 44 172 56 204 C82 204 106 192 122 174 Z', `url(#${uid}_aco)`, 6.5);
          formaCel('M106 152 C74 148 58 170 66 190 C84 188 102 180 114 166 Z', subtipo === 'paladino' ? `url(#${uid}_ouro)` : `url(#${uid}_sec)`, 5);
        });
        formaCel('M112 162 L160 198 L208 162 L196 266 L160 286 L124 266 Z', `url(#${uid}_aco)`, 6.5);
        if (subtipo === 'paladino') {
          formaCel('M152 182 H168 V212 H192 V226 H168 V268 H152 V226 H128 V212 H152 Z', `url(#${uid}_ouro)`, 4.5);
        } else {
          linha('M160 178 V278 M126 208 L160 226 L194 208 M130 236 L160 252 L190 236', 4);
        }
      } else if (subtipo === 'barbaro') {
        // Peitoral musculoso definido com cinturão de couro/peles e pintura de guerra
        linha('M110 194 Q136 212 160 194 Q184 212 210 194 M160 194 V258 M136 224 H184 M138 244 H182', 4.5);
        formaCel('M102 154 L122 148 L214 252 L194 262 Z', '#4a2815', 6);
        circulo(160, 206, 16, `url(#${uid}_ouro)`, tinta, 5.5);
      } else if (subtipo === 'monge') {
        // Kimono / Túnica Marcial assimétrica + Colar de Contas Gigantes
        formaCel('M160 224 L218 158 L212 292 H108 L102 158 Z', `url(#${uid}_sec)`, 6.5);
        for (let i = 0; i < 7; i++) {
          circulo(112 + i * 16, 166 + Math.sin(i * 0.52) * 22, 8.5, '#8a2424', tinta, 4);
        }
      } else {
        // Gola Arcana Alta / Couraça de Assassino ou Arqueiro
        formaCel('M102 158 L76 114 L126 146 L160 198 L194 146 L244 114 L218 158 Z', `url(#${uid}_sec)`, 6.5);
        formaCel('M132 168 L160 286 L188 168 L160 202 Z', `url(#${uid}_ouro)`, 5);
      }

      // Pescoço, Orelhas e Rosto Humano Esculpido (Maxilar anguloso no homem, suave na mulher)
      formaCel('M140 138 V174 H180 V138 Z', pele, 6);
      espelhar(() => formaCel('M112 102 C100 98 98 124 114 128 Z', pele, 5));

      const dRosto = genero === 'F'
        ? 'M116 92 C116 48 204 48 204 92 C204 126 186 154 160 162 C134 154 116 126 116 92 Z'
        : 'M112 90 C112 46 208 46 208 90 L204 134 L178 162 H142 L116 134 Z';
      formaCel(dRosto, pele, 6.5);

      // Cicatrizes ou Pinturas de Batalha
      if (subtipo === 'barbaro' || chance(0.4)) {
        linha('M128 86 L142 132 M124 104 L144 108', 2.8, '#8f2d2d');
      }

      // Olhos, Sobrancelhas, Nariz e Expressão
      const corOlhoHum = subtipo === 'necromante' ? '#00ffaa' : subtipo === 'paladino' ? '#ffe066' : corSec;
      desenharOlho(138, 106, 7.5, 'humano', corOlhoHum, genero === 'F' ? 6 : 10);
      desenharOlho(182, 106, 7.5, 'humano', corOlhoHum, genero === 'F' ? -6 : -10);
      linha('M120 94 L150 100 M200 94 L170 100', genero === 'F' ? 3.5 : 5.5, cabelo);
      linha('M160 104 L154 124 L165 126', 3.2);
      linha(genero === 'F' ? 'M146 140 Q160 146 174 140' : 'M142 140 L160 137 L178 140', 3.5);

      // Máscara de Assassino ou Barba Trabalhada
      if (subtipo === 'assassino') {
        formaCel('M114 116 Q160 128 206 116 L196 156 L160 168 L124 156 Z', '#141820', 6);
        linha('M128 132 L192 132 M136 146 L184 146', 2.5, corSec);
      } else if (genero === 'M' && (subtipo === 'barbaro' || subtipo === 'mago' || chance(0.45))) {
        formaCel('M114 120 C114 168 138 198 160 212 C182 198 206 168 206 120 L188 136 L160 132 L132 136 Z', cabelo, 6);
        linha('M138 138 L148 192 M160 136 V204 M182 138 L172 192', 2.8);
      }

      // Elmos, Capuzes ou Cabelos em Mechas
      if ((subtipo === 'guerreiro' || subtipo === 'paladino') && chance(0.75)) {
        // Elmo de Cavaleiro com Crista e Visor Aberto
        formaCel('M148 52 C138 12 182 12 172 52 Z', corSec, 5.5);
        formaCel('M106 104 C102 40 218 40 214 104 L196 88 L160 108 L124 88 Z', `url(#${uid}_aco)`, 6.5);
        linha('M160 46 V104', 4);
      } else if (['mago', 'arqueiro', 'assassino', 'necromante'].includes(subtipo)) {
        // Capuz Profundo com Bordado Arcano
        formaCel('M88 148 C82 46 130 24 160 16 C190 24 238 46 232 148 C214 106 196 78 160 72 C124 78 106 106 88 148 Z', `url(#${uid}_pri)`, 7);
        linha('M100 132 C104 64 138 38 160 32 C182 38 216 64 220 132', 3, corOuro);
      } else if (subtipo === 'monge') {
        circulo(160, 78, 4.5, corSec, 'none', 0);
        circulo(148, 78, 3.5, corSec, 'none', 0);
        circulo(172, 78, 3.5, corSec, 'none', 0);
      } else {
        if (genero === 'F') {
          espelhar(() => formaCel('M114 92 C88 124 84 188 102 224 L124 168 Z', cabelo, 6));
        }
        formaCel('M108 102 C94 42 138 32 160 40 C182 32 226 42 212 102 L192 76 L174 84 L160 66 L146 84 L128 76 Z', cabelo, 6);
      }

      // Se estiver em pose de combate, desenha a arma na frente do personagem!
      if (poseArma === 'empunhando') renderizarArmamento(true);
    }

    // =========================================================================
    // MOTOR 3: MONSTROS (11 Subarquétipos com Anatomia Pesada e Distinta)
    // =========================================================================
    else if (id === 1) {
      if (subtipo === 'dragao') {
        // Dragão Soberano inspirado na Imagem 2 (Recortes agressivos, placas peitorais, chifres e cauda espinhosa)
        desenharAsas('draconica');
        formaCel('M174 242 C228 282 268 210 296 246 C312 268 284 302 248 288 C272 282 278 260 260 256 C234 250 202 294 148 268 Z', `url(#${uid}_pri)`, 7);
        for (let s = 0; s < 5; s++) {
          const sx = 204 + s * 18, sy = 252 - (s % 2) * 8;
          formaCel(`M${sx} ${sy} L${sx + 8} ${sy - 18} L${sx + 16} ${sy + 2} Z`, `url(#${uid}_osso)`, 4);
        }
        // Pescoço e Torso Dracônico Encouraçado
        formaCel('M118 142 C96 196 104 258 138 286 H182 C216 258 224 196 202 142 Z', `url(#${uid}_pri)`, 7.5);
        for (let y = 164; y <= 254; y += 16) {
          formaCel(`M124 ${y} Q160 ${y + 12} 196 ${y} L190 ${y + 14} Q160 ${y + 24} 130 ${y + 14} Z`, `url(#${uid}_sec)`, 4.5);
        }
        // Garras Dianteiras Dracônicas
        espelhar(() => {
          formaCel('M114 176 C76 184 62 214 72 244 L88 232 L96 248 L108 232 L116 244 C110 218 116 198 126 190 Z', `url(#${uid}_pri)`, 6.5);
        });
        desenharChifres(124, 88, 1.15, 1);
        formaCel('M114 92 L160 72 L206 92 L216 134 L188 164 L160 176 L132 164 L104 134 Z', `url(#${uid}_pri)`, 7.5);
        espelhar(() => path('M106 124 L78 114 L100 138 L82 146 L112 152', `url(#${uid}_osso)`, tinta, 4.5));
        desenharOlho(136, 120, 9.5, 'fenda', '#ffea00', 16);
        desenharOlho(184, 120, 9.5, 'fenda', '#ffea00', -16);
        path('M134 160 L140 178 L146 164 M186 160 L180 178 L174 164', `url(#${uid}_osso)`, tinta, 4);

      } else if (subtipo === 'hidra') {
        // Hidra de 3 Cabeças com Pescoços Escamados Entrelaçados
        const cabecas = [[-68, 106, -18], [68, 106, 18], [0, 68, 0]];
        cabecas.forEach(([dx, yT, ang]) => {
          svg.push(`<g transform="rotate(${ang} ${160 + dx} ${yT + 70})">`);
          formaCel(`M${138 + dx * 0.35} 292 C${124 + dx} 220 ${122 + dx} ${yT + 50} ${132 + dx} ${yT} L${168 + dx} ${yT} C${178 + dx} ${yT + 50} ${176 + dx} 220 ${162 + dx * 0.35} 292 Z`, `url(#${uid}_pri)`, 7);
          for (let py = yT + 42; py <= 268; py += 20) {
            linha(`M${134 + dx * 0.7} ${py} Q${150 + dx * 0.7} ${py + 10} ${166 + dx * 0.7} ${py}`, 4, corSec);
          }
          const cx = 150 + dx;
          formaCel(`M${cx - 32} ${yT - 12} L${cx - 46} ${yT - 38} L${cx - 16} ${yT - 22} L${cx} ${yT - 32} L${cx + 16} ${yT - 22} L${cx + 46} ${yT - 38} L${cx + 32} ${yT - 12} L${cx + 26} ${yT + 28} L${cx} ${yT + 42} L${cx - 26} ${yT + 28} Z`, `url(#${uid}_pri)`, 6.5);
          desenharOlho(cx - 13, yT + 4, 6.5, 'fenda', '#ffcc00', 14);
          desenharOlho(cx + 13, yT + 4, 6.5, 'fenda', '#ffcc00', -14);
          path(`M${cx - 14} ${yT + 28} L${cx - 10} ${yT + 44} L${cx - 4} ${yT + 30} M${cx + 14} ${yT + 28} L${cx + 10} ${yT + 44} L${cx + 4} ${yT + 30}`, `url(#${uid}_osso)`, tinta, 3.5);
          svg.push('</g>');
        });

      } else if (subtipo === 'slime') {
        // Slime Rei Translúcido com Espada, Escudo e Crânio Dissolvendo no Interior
        formaCel('M48 272 C18 272 16 224 48 192 C38 136 78 72 160 74 C242 72 282 136 272 192 C304 224 302 272 272 272 C242 292 202 274 160 288 C118 274 78 292 48 272 Z', `url(#${uid}_pri)`, 7.5, 'rgba(255,255,255,0.45)');
        // Brilho especular gelatinoso
        path('M78 118 Q124 86 184 96', 'none', '#ffffff', 8, 'opacity="0.6"');
        // Crânio e Espada presos no gel ácido
        svg.push('<g transform="rotate(-16 145 190)" opacity="0.88">');
        formaCel('M112 172 C112 146 158 146 158 172 L152 198 H118 Z', `url(#${uid}_osso)`, 5);
        circulo(126, 172, 6, tinta, 'none', 0);
        circulo(144, 172, 6, tinta, 'none', 0);
        formaCel('M182 118 L194 118 L208 242 L196 242 Z', `url(#${uid}_aco)`, 5);
        formaCel('M168 148 H212 V158 H168 Z', `url(#${uid}_ouro)`, 4.5);
        svg.push('</g>');
        for (let b = 0; b < 9; b++) circulo(int(68, 252), int(118, 258), int(4, 12), corLuz, tinta, 3, 'opacity="0.75"');
        desenharOlho(116, 142, 13, 'fenda', corSec, 8);
        desenharOlho(202, 138, 15, 'fenda', corSec, -12);
        formaCel('M116 216 Q160 198 204 216 Q192 254 160 250 Q128 254 116 216 Z', '#07120e', 5.5);

      } else if (subtipo === 'golem') {
        // Colosso Elemental de Rocha e Cristais Arcanos
        espelhar(() => {
          formaCel('M78 92 L48 38 L88 58 L106 26 L122 82 Z', `url(#${uid}_sec)`, 6);
          formaCel('M96 124 L28 148 L16 242 L62 286 L92 238 L86 184 Z', `url(#${uid}_aco)`, 7.5);
          linha('M48 168 L34 228 L64 258', 4);
        });
        formaCel('M74 114 L160 88 L246 114 L224 288 H96 Z', `url(#${uid}_aco)`, 8);
        // Veios de magma/energia e núcleo cristalino
        linha('M160 118 L134 168 L184 204 L148 268 M102 154 L134 168 M218 158 L184 204', 5.5, corSec);
        formaCel('M160 142 L184 176 L160 210 L136 176 Z', `url(#${uid}_sec)`, 6);
        formaCel('M114 68 L160 52 L206 68 L196 134 H124 Z', `url(#${uid}_aco)`, 7.5);
        formaCel('M124 94 H196 V112 H124 Z', corSec, 5);

      } else if (subtipo === 'goblin') {
        // Goblin Saqueador Astuto com Elmo de Couro, Orelhas Longas e Duas Adagas
        formaCel('M106 186 L88 288 H232 L214 186 Z', `url(#${uid}_sec)`, 6.5);
        espelhar(() => {
          formaCel('M108 118 L14 82 L38 132 L12 146 L104 148 Z', `url(#${uid}_pri)`, 6.5);
          linha('M96 128 L38 106', 3.5);
          formaCel('M48 184 L18 248 L66 218 Z', `url(#${uid}_aco)`, 5.5);
          circulo(62, 222, 13, `url(#${uid}_pri)`, tinta, 5.5);
        });
        formaCel('M102 112 C98 58 222 58 218 112 C222 156 194 186 160 190 C126 186 98 156 102 112 Z', `url(#${uid}_pri)`, 7);
        desenharOlho(132, 120, 11.5, 'fenda', '#ffea00', 14);
        desenharOlho(188, 120, 11.5, 'fenda', '#ffea00', -14);
        formaCel('M148 122 L132 154 L168 148 Z', `url(#${uid}_pri)`, 5.5);
        formaCel('M120 158 Q160 176 200 158 L192 178 Q160 192 128 178 Z', '#140c10', 5);
        for (let d = 0; d < 5; d++) path(`M${128 + d * 14} 162 L${134 + d * 14} 178 L${140 + d * 14} 162 Z`, `url(#${uid}_osso)`, tinta, 3);

      } else {
        // Brutamontes & Feras Humanoides (Minotauro, Demônio [Imagem 3], Orc, Ciclope, Lobisomem, Homem-Fera)
        if (subtipo === 'demonio' || subtipo === 'minotauro') desenharAsas('draconica');

        // Corpo Hiper-Musculoso inspirado diretamente na Imagem 3 (Ombros largos, peitoral, gomos abdominais e garras)
        espelhar(() => {
          formaCel('M130 236 C96 240 88 266 100 292 L134 292 C132 272 138 256 152 252 Z', `url(#${uid}_pri)`, 7);
          for (let g = 0; g < 3; g++) path(`M${96 + g * 12} 292 Q${102 + g * 12} 274 ${108 + g * 12} 292 Z`, `url(#${uid}_sec)`, tinta, 4.5);

          formaCel('M112 136 C58 140 34 180 28 232 C22 266 38 288 66 286 C86 284 88 260 70 254 C56 250 60 232 76 234 L84 184 C96 202 108 214 122 222 Z', `url(#${uid}_pri)`, 7.5);
          formaCel('M29 224 C20 256 36 288 66 286 C86 284 88 260 70 254 C56 250 60 232 76 234 C84 234 84 220 68 216 L52 224 L40 216 Z', `url(#${uid}_sec)`, 6.5);
          linha('M38 260 Q46 276 54 284 M52 258 Q58 274 66 282', 4.5);
        });

        formaCel('M96 156 C86 188 106 218 160 216 C214 218 234 188 224 156 C206 132 114 132 96 156 Z', `url(#${uid}_sec)`, 7.5);
        formaCel('M116 210 L130 262 Q160 278 190 262 L204 210 Z', `url(#${uid}_sec)`, 7);
        linha('M100 190 Q134 212 160 192 Q186 212 220 190', 6.5);
        for (let y = 224; y <= 248; y += 12) linha(`M136 ${y} Q148 ${y + 6} 160 ${y} Q172 ${y + 6} 184 ${y}`, 4.5);

        if (['minotauro', 'demonio', 'orc', 'ciclope'].includes(subtipo)) {
          desenharChifres(114, 90, subtipo === 'orc' ? 0.72 : 1.12, subtipo === 'demonio' ? 2 : 0);
        } else {
          // Orelhas pontudas de Lobisomem / Homem-Fera
          espelhar(() => formaCel('M108 94 L82 32 L140 76 Z', `url(#${uid}_pri)`, 6.5));
        }

        // Orelhas laterais de monstro (Imagem 3)
        if (['minotauro', 'demonio', 'orc'].includes(subtipo)) {
          espelhar(() => {
            formaCel('M106 110 C78 96 60 100 48 92 C58 118 76 132 106 126 Z', `url(#${uid}_sec)`, 6);
            linha('M96 114 L68 108', 3.5);
          });
        }

        // Cabeça e Barba/Pelagem Serrilhada (Imagem 3)
        formaCel('M104 94 C94 124 96 158 114 168 L122 194 L138 178 L160 208 L182 178 L198 194 L206 168 C224 158 226 124 216 94 Z', `url(#${uid}_sec)`, 7.5);
        formaCel('M114 156 L122 194 L138 176 L160 208 L182 176 L198 194 L206 156 Q160 172 114 156 Z', corSombra, 6.5);

        // Elmo Superior com Olho Místico (Imagem 3)
        formaCel('M100 96 C102 42 218 42 220 96 Q188 106 160 118 Q132 106 100 96 Z', corSombra, 7.5);

        if (subtipo === 'ciclope') {
          desenharOlho(160, 108, 22, 'fera', '#ffb82e', 0);
        } else {
          if (subtipo === 'minotauro' || subtipo === 'demonio') {
            circulo(160, 80, 15, '#ffb82e', tinta, 5.5);
            circulo(160, 80, 5, tinta, 'none', 0);
          }
          desenharOlho(132, 114, 10.5, 'fera', '#ffb82e', 14);
          desenharOlho(188, 114, 10.5, 'fera', '#ffb82e', -14);
        }

        if (subtipo === 'lobisomem' || subtipo === 'homem-fera') {
          formaCel('M124 126 Q160 112 196 126 L186 168 Q160 178 134 168 Z', corSombra, 6);
          path('M146 124 L160 140 L174 124 Z', '#0e1014', tinta, 4);
          path('M132 154 L138 178 L146 156 M188 154 L182 178 L174 156', `url(#${uid}_osso)`, tinta, 4);
        } else {
          // Narinas e Boca com Presas Inferiores (Imagem 3)
          circulo(153, 128, 3.2, tinta, 'none', 0);
          circulo(167, 128, 3.2, tinta, 'none', 0);
          formaCel('M122 152 Q160 136 198 152 Q192 130 160 134 Q128 130 122 152 Z', tinta, 4.5);
          path('M128 149 L135 132 L144 146 Z M192 149 L185 132 L176 146 Z', `url(#${uid}_osso)`, tinta, 3.8);
        }
      }
    }

    // =========================================================================
    // MOTOR 4: MORTOS-VIVOS — anatomia, ocupação e equipamento independentes
    // =========================================================================
    else if (id === 3) {
      const pele = esc(['#82977b', '#798f8a', '#a49b78', '#8e8199', '#5e7c6d']);
      const peleEscura = esc(['#405655', '#544653', '#4b5942']);
      const tecido = esc(['#534354', '#494f69', '#635b40', '#385e58', '#6c3948']);
      const cabelo = esc(['#25242c', '#807568', '#b8b8b2', '#563b38']);
      const ossoFill = `url(#${uid}_osso)`, metal = `url(#${uid}_aco)`;
      const energia = esc(['#92ffba', '#7ee7ff', '#d3a4ff', '#ffb573']);
      const ehOsso = subtipo.startsWith('esqueleto') || ['lich', 'rei-esqueleto', 'cavaleiro-da-morte'].includes(subtipo);
      const ehZumbi = subtipo.startsWith('zumbi');
      const profissao = subtipo.split('-').slice(1).join('-');
      const papel = ['guerreiro', 'arqueiro', 'fazendeiro', 'mago'].includes(profissao)
        ? profissao : subtipo === 'lich' ? 'mago'
        : ['rei-esqueleto', 'cavaleiro-da-morte'].includes(subtipo) ? 'guerreiro'
        : esc(['errante', 'guerreiro', 'arqueiro', 'fazendeiro', 'mago']);

      if (['lobo-zumbi', 'urso-zumbi', 'cervo-zumbi', 'cavalo-esqueleto'].includes(subtipo)) {
        const cavalo = subtipo === 'cavalo-esqueleto', cervo = subtipo === 'cervo-zumbi', urso = subtipo === 'urso-zumbi';
        const altura = urso ? 16 : 0;
        const couro = cavalo ? peleEscura : pele;
        // Cauda, duas pernas distantes e corpo em três quartos.
        if (cavalo) {
          formaCel('M246 158 Q293 143 286 227 L272 214 L263 236 L264 191 L244 182Z', cabelo, 5);
        } else if (!urso && !cervo) {
          formaCel('M244 173 Q291 145 296 199 L284 215 L288 233 Q255 225 241 199Z', peleEscura, 5);
          costura(268, 191, 284, 210, 3);
        }
        for (const [x, dx] of [[139, 9], [239, 10]]) {
          osso(x, 207, x + dx, 249, 10); osso(x + dx, 249, x - 3, 278, 8);
          formaCel(`M${x - 15} 277 H${x + 9} L${x + 13} 290 H${x - 20}Z`, '#3c4242', 4);
        }
        formaCel(`M95 ${151 - altura} Q146 ${123 - altura} 237 147 Q277 159 267 200 L251 222 Q202 231 165 218 L116 220 L88 194Z`, couro, 6);
        if (!cavalo) {
          path('M162 158 L179 151 L189 160 L212 157 L228 176 L215 204 L183 209 L162 196Z', '#263c3c', tinta, 3);
        }
        em(194, 170, cavalo ? 1.15 : 0.9, () => costelas(0, 0, 1, 4), -82);
        if (cavalo) {
          osso(115, 153, 158, 151, 9); osso(158, 151, 204, 154, 9); osso(204, 154, 244, 161, 9);
        } else {
          costura(227, 160, 252, 187, 5);
          path('M136 189 L145 177 L151 199 L142 214Z', peleEscura, 'none', 0);
        }
        for (const [x, dx] of [[113, -17], [224, -10]]) {
          if (urso) {
            formaCel(`M${x - 17} 204 L${x + 16} 209 L${x + 11} 259 L${x + 19} 285 H${x - 24} L${x - 18} 264Z`, pele, 5);
            costura(x - 14, 247, x + 10, 254, 4);
          } else {
            osso(x, 212, x + dx, 252, 11); osso(x + dx, 252, x + dx - 7, 282, 8);
            formaCel(`M${x + dx - 19} 279 H${x + dx + 5} L${x + dx + 8} 291 H${x + dx - 24}Z`, peleEscura, 4);
          }
        }
        formaCel(cavalo ? 'M115 175 L126 104 L103 73 L77 101 L78 170Z' : 'M118 172 L129 122 L99 102 L66 133 L80 185Z', couro, 5.5);
        if (cervo) {
          for (const s of [-1, 1]) {
            tubo(`M${89 + s * 17} 99 L${89 + s * 27} 64 L${89 + s * 31} 29`, 6, corOsso);
            linha(`M${89 + s * 27} 63 L${89 + s * 52} 49 L${89 + s * 57} 29 M${89 + s * 30} 40 L${89 + s * 13} 23`, 5, corOsso);
          }
        }
        if (urso) {
          circulo(65, 104, 15, peleEscura, tinta, 4); circulo(114, 101, 16, peleEscura, tinta, 4);
        } else {
          formaCel('M62 119 L50 78 L79 98 M108 105 L119 73 L128 119', couro, 4);
        }
        formaCel(cavalo ? 'M70 97 Q103 76 118 111 L102 155 L80 179 L51 162 L57 134Z' : 'M57 117 Q88 89 121 115 L118 155 L96 175 L62 169 L45 148Z', cavalo ? ossoFill : pele, 5.5);
        // Maxilar exposto e dentes preservam a identidade de cada animal.
        formaCel('M52 145 L78 143 L102 152 L94 172 L67 177 L45 165Z', ossoFill, 4);
        linha('M52 158 L94 162 M61 153 V169 M72 154 V173 M83 156 V172', 2.2);
        path('M52 151 L46 159 L57 160Z', tinta, 'none', 0);
        desenharOlho(83, 127, 9, 'energia', energia, -10);
        costura(104, 120, 112, 143, 4);
        if (!cavalo) path('M95 159 L100 178 L105 159Z', corOsso, tinta, 2.5);
      } else if (subtipo === 'corvo-zumbi') {
        // Asas assimétricas, penas partidas e falanges expostas.
        espelhar(() => {
          formaCel('M145 155 Q102 71 28 68 L47 91 L15 96 L43 118 L18 137 L50 147 L36 170 L73 175 L67 202 L117 192Z', '#35394b', 5.5);
          osso(132, 159, 91, 113, 8); osso(91, 113, 32, 81, 6);
          linha('M91 113 L48 142 M107 135 L70 173 M118 153 L97 184', 3, corOsso);
        });
        formaCel('M136 239 L112 293 L140 280 L157 302 L168 279 L198 292 L183 235Z', '#41464e', 5);
        formaCel('M126 147 Q110 183 132 245 Q159 265 189 239 Q211 187 184 141Z', peleEscura, 5.5);
        costelas(157, 181, 0.7, 4);
        osso(141, 246, 133, 273, 5); osso(179, 244, 187, 270, 5);
        linha('M132 273 L113 283 M132 273 L139 284 M186 270 L171 282 M186 270 L205 280', 4, corOsso);
        formaCel('M132 134 Q118 95 145 78 L164 54 L171 75 L195 73 L189 87 Q211 109 190 141 L174 155Z', '#3b4051', 5.5);
        formaCel('M183 103 L234 124 L186 134 L166 127Z', ossoFill, 4.5);
        linha('M185 122 L220 124', 2.5); desenharOlho(164, 107, 10, 'energia', energia, 10);
        costura(139, 106, 147, 135, 4);
      } else if (subtipo === 'aranha-zumbi') {
        espelhar(() => {
          for (let i = 0; i < 4; i++) {
            const y = 144 + i * 17, kx = 53 - i * 7, ky = 78 + i * 46;
            osso(130, y, kx, ky, 9); osso(kx, ky, 22 + i * 13, ky + 48, 6);
          }
        });
        formaCel('M107 149 Q81 215 112 261 Q159 296 207 261 Q238 219 213 149Z', pele, 6);
        path('M126 184 L165 170 L194 195 L182 241 L144 255 L124 224Z', peleEscura, tinta, 3);
        costelas(161, 193, 0.8, 4); costura(107, 221, 135, 255, 6);
        formaCel('M115 103 Q158 74 205 103 L218 154 L191 177 H129 L102 154Z', ossoFill, 5.5);
        for (const [x,y,r] of [[137,124,11],[184,124,11],[151,107,6],[171,107,6]]) {
          circulo(x,y,r,tinta,tinta,2); circulo(x,y,r * 0.42,energia,'none',0);
        }
        path('M133 157 Q106 187 146 196 L141 178Z M187 157 Q213 187 174 196 L179 178Z', ossoFill, tinta, 4);
      } else if (subtipo === 'dragao-zumbi') {
        desenharAsas('draconica', '#394a48');
        espelhar(() => {
          osso(120,156,76,105,7); osso(76,105,22,81,5);
          path('M50 132 L61 154 L49 173 L44 151Z M87 139 L99 168 L87 158Z', '#0c161c', tinta, 2);
        });
        formaCel('M195 228 C267 257 286 210 277 187 Q309 216 291 250 Q267 294 185 265Z', pele, 5.5);
        osso(249,252,275,235,6); osso(275,235,282,214,5);
        formaCel('M121 149 Q154 126 194 153 L216 231 Q194 274 154 274 L112 239Z', peleEscura, 6);
        costelas(161,177,1.05,5);
        espelhar(() => {
          formaCel('M120 223 L90 242 L74 284 H126 L141 252Z', pele,5);
          path('M79 281 L86 268 L92 284 M97 282 L104 267 L110 284 M115 281 L122 267 L129 283', corOsso,tinta,3);
        });
        espelhar(() => {
          formaCel('M126 90 Q96 67 104 33 Q109 60 141 71Z',ossoFill,4.5);
          formaCel('M119 108 L88 88 L100 117 L120 127Z',pele,4);
        });
        formaCel('M112 89 L131 65 L185 65 L212 91 L199 128 L183 143 H136 L117 128Z', ossoFill, 5.5);
        desenharOlho(136,101,9,'energia',energia,12); desenharOlho(185,101,9,'energia',energia,-12);
        formaCel('M128 120 L151 111 L189 121 L194 149 L169 165 L128 147Z', ossoFill,4.5);
        linha('M134 142 L185 146 M144 135 V153 M158 139 V158 M172 140 V155',2.5);
        path('M141 123 L146 130 L152 125 M176 124 L182 131 L185 125',tinta,tinta,2);
      } else if (subtipo === 'golem-de-carne') {
        const remendo = esc(['#ab8381', '#9c9280', '#7f8d82']);
        // Massa corporal assimétrica, pele remendada e membros de tamanhos distintos.
        formaCel('M101 227 L89 278 L70 292 H136 L150 239 M174 237 L183 292 H246 L225 277 L213 227Z', '#3a3947', 6);
        formaCel('M103 129 Q76 125 59 159 L28 210 L40 261 L76 271 L95 243 L78 209 L112 173Z', pele, 6);
        formaCel('M208 128 Q256 119 267 165 L286 218 L278 253 L249 256 L230 218 L211 186Z', remendo, 6);
        linha('M46 240 L54 257 M58 235 L65 256 M259 226 L262 245 M272 223 L273 242',3);
        formaCel('M106 123 Q160 99 214 130 L237 213 L211 250 L166 240 L121 252 L88 210Z', pele, 7);
        path('M100 157 L159 143 L169 214 L130 234 L101 211Z',remendo,tinta,3);
        path('M170 145 L207 144 L226 191 L201 208 L174 201Z',peleEscura,tinta,3);
        costura(160,143,169,214,8); costura(100,156,154,143,6); costura(173,202,205,209,5);
        costura(38,206,77,219,6); costura(243,172,272,164,5); costura(126,231,160,222,5);
        path('M186 167 L211 155 L214 187 L184 192Z','#303a3a',tinta,3);
        osso(188,170,205,169,4); osso(186,181,210,179,4);
        formaCel('M118 59 Q151 38 184 61 L197 121 L172 142 L127 123Z',remendo,6);
        formaCel('M118 70 L116 54 L131 45 L139 52 L153 43 L165 51 L182 47 L188 70Z',cabelo,4);
        desenharOlho(137,87,8,'energia',energia,12); circulo(173,92,9,tinta,tinta,2);
        costura(155,59,158,101,6); costura(129,113,173,119,6);
        path('M113 101 H101 V111 H116 M191 105 H205 V117 H193',metal,tinta,4);
        if (chance(0.4)) cranio(227,139,0.47,energia);
        else { path('M213 144 L225 106 L235 145Z',ossoFill,tinta,4); costura(194,132,214,146,4); }
      } else if (['fantasma', 'banshee', 'ceifador'].includes(subtipo)) {
        const banshee = subtipo === 'banshee', ceifador = subtipo === 'ceifador';
        const espectro = ceifador ? '#303747' : `url(#${uid}_pri)`;
        if (banshee) {
          formaCel('M103 113 Q69 47 135 35 Q181 6 222 62 L249 133 L286 161 L256 177 L280 197 Q209 178 201 126Z', '#9bbcb5', 5);
          formaCel('M121 81 Q80 92 80 148 L45 183 L68 185 L36 206 Q99 190 119 150Z', '#719c99', 4.5);
        }
        formaCel('M123 144 Q95 174 109 222 Q118 260 74 290 L125 280 L143 298 L173 278 L211 292 L196 269 Q252 287 272 253 Q215 259 218 209 L196 143Z', espectro, 6);
        linha('M141 179 Q130 231 152 269 M177 186 Q198 234 180 263', 3, corLuz);
        const bracoEspectral = () => {
          formaCel('M124 149 Q89 143 65 188 L35 189 L55 214 L80 209 L99 181 L116 197Z', espectro, 5);
          osso(62,192,46,180,5);
          for (let i=0;i<3;i++) tubo(`M${43+i*6} 182 L${32+i*6} 164 L${36+i*6} 153`,3,corOsso,false);
        };
        if (ceifador) {
          bracoEspectral();
          formaCel('M199 149 Q231 145 243 175 L262 179 L267 199 L239 204 L214 181 L201 197Z',espectro,5);
        } else espelhar(bracoEspectral);
        if (ceifador) {
          formaCel('M99 135 Q87 72 159 31 Q228 68 221 139 L200 161 L118 160Z','#272c3c',6);
          path('M116 125 Q117 79 160 64 Q204 86 204 126 L184 152 H135Z','#090f19',tinta,3);
          cranio(160,113,0.8,energia);
          equipamento('foice',269,162,0.9);
          osso(247,189,267,188,6); maoMorta(269,188,pele,true);
          for(let i=0;i<7;i++) elipse(123+i*10,220+Math.sin(i*.6)*14,6,8,'none',corAco,2);
        } else if (banshee) {
          formaCel('M125 85 Q157 60 192 86 L194 115 Q186 147 160 160 Q128 142 125 113Z','#c7d6cb',5);
          path('M126 88 Q157 54 194 88 L181 59 L145 49 L120 70Z','#a9c2bb',tinta,4);
          desenharOlho(142,106,9,'energia',energia,18); desenharOlho(180,106,9,'energia',energia,-18);
          elipse(161,134,11,19,'#15212b',tinta,3);
          linha('M134 116 L129 137 M186 116 L192 137',3,'#446764');
        } else {
          formaCel('M111 112 Q102 51 158 46 Q215 42 214 115 L192 158 L133 158Z',espectro,6);
          path('M126 98 Q136 89 146 99 L143 119 L128 119Z M177 99 Q188 89 197 99 L194 119 L180 119Z','#10222b',tinta,2);
          elipse(161,138,9,14,'#10222b','none',0);
          linha('M124 76 Q154 50 184 67',3,'#c9f9e9');
        }
      } else if (['vampiro', 'vampiro-alado'].includes(subtipo)) {
        const alado = subtipo === 'vampiro-alado';
        if (alado) desenharAsas('draconica', esc(['#652f47','#503858','#405768']));
        else formaCel('M105 142 L61 281 L105 269 L129 292 L160 269 L190 292 L217 272 L260 282 L215 142Z','#211e30',6);
        formaCel('M126 223 L114 286 H149 L162 244 L175 286 H208 L194 223Z','#34313f',5);
        formaCel('M123 146 L108 204 L133 241 L160 231 L190 243 L211 205 L197 144Z',alado ? '#8896a1' : '#653244',6);
        path('M142 148 L160 175 L179 148 L172 217 L160 231 L148 216Z',corOsso,tinta,3.5);
        if (!alado) {
          formaCel('M128 167 L94 109 L128 121 L160 159 L190 123 L226 108 L195 169 L180 187 L160 175 L143 185Z','#963a53',5);
          for (let i=0;i<3;i++) circulo(160,186+i*13,2.5,corOuro,'none',0);
        }
        tubo('M120 159 L87 195 L66 187',16,alado ? '#8896a1' : '#653244');
        tubo('M201 159 L231 192 L251 177',16,alado ? '#8896a1' : '#653244');
        maoMorta(61,182,'#c9cbd2',false,-22); maoMorta(254,174,'#c9cbd2',false,26);
        if (genero === 'F') formaCel('M119 86 Q98 111 106 164 L128 150 L139 102 M191 85 Q219 121 209 164 L185 147 L178 102Z',cabelo,5);
        formaCel('M125 86 Q126 49 160 53 Q198 52 198 87 L189 125 L160 145 L132 124Z','#c9cbd2',5);
        path('M128 96 L111 84 L119 113 L132 118 M191 95 L211 82 L201 115 L188 119','#c9cbd2',tinta,3.5);
        formaCel('M122 87 Q115 41 161 45 Q205 41 201 87 L179 68 L160 86 L145 67Z',cabelo,5);
        desenharOlho(143,100,7,'fenda','#fc6d80',10); desenharOlho(180,100,7,'fenda','#fc6d80',-10);
        linha('M144 124 Q161 119 178 124',2.5);
        path('M146 123 L150 136 L154 122 M175 123 L171 136 L167 122','#ffffff',tinta,2);
        circulo(160,163,6,corSec,tinta,2.5);
      } else if (subtipo === 'mumia' || subtipo === 'mumia-farao') {
        const farao = subtipo === 'mumia-farao', faixas = esc(['#c9b990','#c8c4a5','#bdb09e']);
        // Faixas soltas atrás, sem linhas atravessando o espaço vazio.
        path('M108 171 Q53 159 53 201 T24 244 L39 250 Q75 225 65 201 T115 185Z',faixas,tinta,3);
        path('M205 145 Q254 122 279 163 L269 170 Q251 140 213 159Z',faixas,tinta,3);
        if (farao) formaCel('M111 86 Q105 39 160 34 Q214 40 210 87 L228 162 L190 172 L130 172 L92 161Z',`url(#${uid}_ouro)`,5);
        tubo('M138 226 L123 282',20,faixas); tubo('M182 226 L198 282',20,faixas);
        formaCel('M112 280 L111 293 H140 L140 281 M185 281 L185 294 H216 L211 279',faixas,4);
        tubo('M116 159 L83 190 L54 166',19,faixas);
        tubo(farao ? 'M204 159 L230 196 L258 198' : 'M204 159 L236 189 L254 160',19,faixas);
        formaCel('M125 134 L111 179 L125 239 L148 248 L181 243 L207 185 L192 136Z',faixas,5.5);
        for (let y=157;y<=227;y+=14) linha(`M123 ${y} L194 ${y+7}`,2.5,'#7f745d');
        for (let y=244;y<=274;y+=10) {
          const lx=138-(y-226)*15/56, rx=182+(y-226)*16/56;
          linha(`M${lx-7} ${y-3} l14 6 M${rx-7} ${y+3} l14 -6`,2.5,'#7f745d');
        }
        for(let i=0;i<4;i++) linha(`M${89+i*6} ${174-i*6} l12 12`,2.2,'#7f745d');
        if (!farao) for(let i=0;i<4;i++) linha(`M${219+i*6} ${176+i*5} l12 -10`,2.2,'#7f745d');
        formaCel('M127 79 Q124 49 162 49 Q198 49 194 85 L185 122 L163 142 L135 123Z',faixas,5.5);
        linha('M132 65 L190 77 M129 83 L191 91 M135 113 L181 124 M145 128 L176 133',2.8,'#7f745d');
        path('M130 93 L190 98 L184 113 L136 108Z','#262d32',tinta,2.5);
        desenharOlho(143,100,6,'energia',energia,8); desenharOlho(178,102,6,'energia',energia,-8);
        maoMorta(51,162,faixas,false,-25);
        if (farao) {
          formaCel('M116 136 Q161 172 205 137 L210 157 Q160 197 109 157Z',`url(#${uid}_ouro)`,4.5);
          linha('M123 150 Q161 178 196 151',4,'#347e8d');
          path('M148 48 L148 34 L160 25 L171 35 L166 49Z',`url(#${uid}_ouro)`,tinta,3);
          circulo(160,39,4,energia,tinta,2); equipamento('cajado',260,201,0.76);
          maoMorta(258,198,faixas);
        } else maoMorta(256,157,faixas,false,20);
      } else if (ehOsso || ehZumbi) {
        const mago = papel === 'mago', guerreiro = papel === 'guerreiro', arqueiro = papel === 'arqueiro', fazendeiro = papel === 'fazendeiro';
        const regio = ['lich','rei-esqueleto','cavaleiro-da-morte'].includes(subtipo);
        const inclinacao = ehZumbi ? esc([-9,-5,5,9]) : esc([-3,0,3]);
        const largura = genero === 'F' ? 29 : 35;
        const corMembro = ehOsso ? corOsso : pele;
        const arma = mago ? 'cajado' : guerreiro ? esc(['espada','machado']) : fazendeiro ? esc(['forcado','pa']) : null;
        if (mago || regio) {
          formaCel('M115 139 L73 284 L105 274 L125 292 L160 278 L192 291 L215 275 L247 283 L206 138Z',tecido,5.5);
          linha('M113 177 L97 269 M208 177 L225 269',2.5,corLuz);
        }
        if (arqueiro) {
          formaCel('M183 155 L209 113 L230 123 L209 175Z','#6f4b36',4);
          for(let i=0;i<3;i++) {
            linha(`M${209+i*6} ${120+i*3} L${224+i*5} ${84+i*3}`,2.5,corOsso);
            path(`M${224+i*5} ${84+i*3} l-5 -10 l7 3 l4 9Z`,corSec,tinta,1.5);
          }
        }
        // Vão entre as pernas e articulações legíveis, inclusive nos zumbis.
        for(const [x,dx] of [[139,-13],[181,13]]) {
          if (ehOsso) { osso(x,220,x+dx,252,10); osso(x+dx,252,x+dx-3,280,8); }
          else {
            formaCel(`M${x-13} 212 L${x+15} 216 L${x+dx+11} 248 L${x+dx+6} 261 L${x+dx-12} 252Z`,tecido,5);
            tubo(`M${x+dx} 250 L${x+dx-3} 279`,13,pele);
            costura(x+dx-5,259,x+dx+3,270,3);
          }
          formaCel(`M${x+dx-14} 278 L${x+dx+9} 277 L${x+dx+16} 290 H${x+dx-18}Z`,ehOsso ? ossoFill : '#38373c',4);
        }
        const bras = (sx,sy,ex,ey,hx,hy) => {
          if(ehOsso) { osso(sx,sy,ex,ey,8); osso(ex,ey,hx,hy,7); }
          else { tubo(`M${sx} ${sy} L${ex} ${ey}`,18,tecido); tubo(`M${ex} ${ey} L${hx} ${hy}`,14,pele); costura(ex,ey,hx,hy,4); }
        };
        bras(119,154,91,188,arqueiro ? 65 : 66,204);
        bras(201,154,225,194,arqueiro ? 151 : 258,arqueiro ? 204 : 204);
        if(ehOsso) {
          costelas(160,154,1,4);
          formaCel('M130 207 L149 215 H172 L190 207 L186 227 L167 237 L160 225 L151 237 L132 225Z',ossoFill,4.5);
        } else {
          formaCel(`M${160-largura} 139 L116 164 L123 213 L119 230 L140 225 L155 236 L168 224 L189 230 L201 216 L204 163 L${160+largura} 139Z`,tecido,5.5);
          path('M166 162 L193 168 L197 197 L176 213 L165 200Z',peleEscura,tinta,3);
          em(180,174,0.52,()=>costelas(0,0,1,3));
          costura(127,176,143,202,4);
        }
        if(guerreiro) {
          formaCel('M122 149 L160 170 L198 149 L193 202 L166 220 L126 198Z',metal,4.5);
          path('M143 174 L160 183 L181 170 L174 200 L158 212 L142 196Z',tecido,tinta,3);
          linha('M180 156 L169 175 L176 185 M131 160 L140 173',2.5,'#46505b');
          formaCel('M113 139 L89 149 L83 172 L113 180 L133 157Z',metal,4.5);
          if(regio) path('M96 148 L92 123 L111 142 L116 116 L128 150Z',ossoFill,tinta,3);
        } else if(fazendeiro) {
          formaCel('M132 156 L141 156 L141 175 H179 V156 H188 L188 222 L158 230 L130 221Z','#8b7860',4);
          linha('M145 190 H175 V210 H145Z',2.3,'#4d463b');
        } else if(mago) {
          formaCel('M120 139 L160 175 L200 139 L183 204 L160 185 L137 205Z',`url(#${uid}_sec)`,4.5);
          circulo(160,182,7,energia,tinta,3);
          if(subtipo==='lich') { chama(69,163,0.8,energia); cranio(70,238,0.38,energia); }
          else { circulo(65,166,22,'none',energia,2); chama(65,166,0.6,energia); }
        } else if(arqueiro) {
          path('M130 140 L139 136 L193 210 L184 216Z','#7e5038',tinta,3.5);
          circulo(163,178,7,corAco,tinta,2.5);
        }
        if(!mago) path('M122 208 L198 208 L195 221 L126 221Z','#453733',tinta,3);
        // Cabeça independente: traços femininos/masculinos e marcas localizadas.
        em(160,103,1,()=>{
          if(ehOsso) cranio(0,0,0.97,energia);
          else {
            if(genero==='F') formaCel('M-34 -19 Q-57 13 -40 62 L-29 48 L-18 57 L-22 11 M28 -25 Q51 0 44 54 L28 43 L20 50 L22 7Z',cabelo,4.5);
            formaCel(genero==='F' ? 'M-34 -20 Q-31 -51 0 -50 Q38 -46 34 -15 L29 20 L5 40 L-23 25 L-36 1Z' : 'M-36 -24 Q-28 -53 7 -49 L37 -32 L35 10 L22 37 L-15 40 L-36 17Z',pele,5.5);
            path('M-34 -24 L-37 -37 L-24 -50 L-6 -44 L7 -53 L24 -45 L34 -29 L12 -35 L2 -25 L-17 -34Z',cabelo,tinta,3);
            desenharOlho(-16,-1,9,'fera',energia,10);
            circulo(17,1,10,peleEscura,tinta,3); circulo(17,1,3.5,energia,'none',0);
            linha('M-2 3 L-7 13 L1 15',2.5);
            path('M-21 24 L8 19 L23 26 L14 33 L-13 33Z','#24272b',tinta,3);
            for(let i=0;i<4;i++) path(`M${-14+i*8} 24 v6 h4 v-7Z`,corOsso,'none',0);
            costura(20,-23,28,-7,4);
            if(chance(0.5)) { path('M-28 11 L-16 9 L-11 20 L-24 24Z',peleEscura,tinta,2); }
            else { path('M-4 -40 L14 -40 L22 -30 L3 -24Z','#b48891',tinta,2); linha('M4 -34 L14 -31',2,'#6f5366'); }
          }
          if(regio) {
            formaCel('M-36 -32 L-41 -60 L-22 -46 L-11 -67 L1 -48 L18 -68 L26 -45 L40 -59 L35 -30Z',subtipo==='cavaleiro-da-morte'?metal:`url(#${uid}_ouro)`,4);
            circulo(1,-42,5,energia,tinta,2);
          } else if(fazendeiro) {
            formaCel('M-31 -31 L-25 -58 L14 -58 L29 -33Z','#ac9566',4);
            formaCel('M-54 -31 Q-5 -45 49 -31 L45 -23 Q-2 -19 -51 -23Z','#c3ab7e',3.5);
            linha('M-25 -39 L25 -40',5,'#59463e');
          } else if(mago) {
            formaCel('M-43 -24 L-25 -51 L-9 -83 L5 -68 L27 -51 L42 -25 Q-3 -41 -43 -24Z',tecido,4.5);
            linha('M-27 -42 Q0 -50 27 -40',2.5,corOuro);
          } else if(guerreiro && chance(0.65)) {
            formaCel('M-41 -15 L-39 -37 Q0 -71 38 -37 L41 -15 L26 -24 L0 -20 L-27 -26Z',metal,4.5);
            linha('M0 -52 V-23',2.5);
          } else if(arqueiro) {
            formaCel('M-43 12 Q-51 -52 -3 -63 Q45 -51 43 11 L28 -21 L0 -36 L-28 -22Z',tecido,4.5);
          }
        },inclinacao);
        if(arma) equipamento(arma,260,204,0.88);
        if(arqueiro) equipamento('arco',65,204,0.87);
        if(guerreiro) equipamento('escudo',69,218,0.88);
        else maoMorta(arqueiro ? 64 : 65,204,corMembro,ehOsso,-10);
        maoMorta(arqueiro ? 153 : 259,204,corMembro,ehOsso,10);
      }
    }

    // =========================================================================
    // MOTOR 5: ALIENS — máquinas, veículos e morfologias extraterrestres
    // =========================================================================
    else if (id === 2) {
      const metal = `url(#${uid}_aco)`, casco = `url(#${uid}_pri)`;
      const escuro = esc(['#283747', '#353248', '#284544', '#4b3542']);
      const neon = esc(['#89f8e0', '#a9e3ff', '#dfabff', '#ffc27d', '#d0fa87']);
      const junta = (x,y,r=8) => { circulo(x,y,r,escuro,tinta,3); circulo(x,y,r*.4,neon,'none',0); };
      const painel = (x,y,w=18,h=8) => {
        path(`M${x} ${y} h${w} v${h} h${-w}Z`,escuro,tinta,2);
        for(let i=3;i<w-2;i+=5) linha(`M${x+i} ${y+2} v${h-4}`,1.5,neon);
      };
      const propulsor = (x,y,escala=1) => em(x,y,escala,()=>{
        path('M-12 0 Q-15 26 0 47 Q15 26 12 0Z',neon,tinta,2.5);
        path('M-5 0 L0 33 L5 0Z','#efffff','none',0);
        formaCel('M-16 -22 H16 L12 4 H-12Z',metal,4);
        linha('M-10 -13 H10 M-11 -5 H11',2);
      });
      const lente = (x,y,r) => {
        circulo(x,y,r,escuro,tinta,4); circulo(x,y,r*.7,neon,tinta,2);
        circulo(x,y,r*.35,corSombra,'none',0); circulo(x-r*.22,y-r*.26,r*.2,'#ffffff','none',0);
      };

      if (['robo','androide','mecha'].includes(subtipo)) {
        const pesado = subtipo === 'mecha', androide = subtipo === 'androide';
        const ombro = pesado ? 52 : androide ? 28 : 39;
        const yCabeca = pesado ? 92 : 79, cabeca = androide ? 0.8 : pesado ? 0.91 : 1;
        // Silhueta mecânica completa: quadril, joelhos, pés e braços independentes.
        if(pesado) {
          espelhar(()=>{
            formaCel('M97 148 L76 56 L101 53 L129 138Z',escuro,5);
            formaCel('M72 55 L99 48 L106 78 L81 85Z',metal,4);
            painel(80,57,16,10);
          });
        } else if(!androide) {
          formaCel('M114 145 L92 109 L75 111 L89 173Z',metal,4.5);
          linha('M84 110 V66',5,escuro); circulo(84,64,5,neon,tinta,2);
        }
        for(const [x,dir] of [[138,-1],[182,1]]) {
          const kx=x+dir*(pesado ? 9 : 2), fx=x+dir*(androide ? 8 : 18);
          tubo(`M${x} 213 L${kx} 248 L${fx} 279`,androide?10:17,escuro);
          formaCel(`M${x-12} 216 H${x+12} L${kx+14} 240 L${kx-13} 240Z`,casco,4.5);
          junta(kx,247,androide?7:10);
          formaCel(`M${kx-12} 254 L${kx+13} 254 L${fx+15} 280 L${fx-15} 280Z`,metal,4.5);
          formaCel(`M${fx-16} 278 H${fx+14} L${fx+23} 293 H${fx-23}Z`,escuro,4.5);
          linha(`M${fx-8} 265 L${fx+4} 265`,3,neon);
        }
        formaCel('M130 202 L160 192 L191 204 L185 226 L160 238 L135 226Z',metal,5);
        espelhar(()=>{
          const sx=160-ombro;
          tubo(`M${sx} 139 L${sx-30} 181 L${sx-29} 219`,androide?12:21,escuro);
          junta(sx-30,181,androide?7:10);
          formaCel(`M${sx-18} 174 L${sx-43} 181 L${sx-47} 216 L${sx-24} 230 L${sx-14} 210Z`,casco,5);
          formaCel(`M${sx-20} 124 L${sx+8} 130 L${sx+15} 154 L${sx-20} 164 L${sx-38} 145Z`,metal,5);
          if(androide) {
            tubo(`M${sx-30} 219 v23`,8,metal);
            linha(`M${sx-36} 238 v13 M${sx-29} 240 v13 M${sx-22} 238 v12`,3,corAco);
          } else {
            formaCel(`M${sx-47} 215 H${sx-22} L${sx-20} 245 L${sx-47} 242Z`,escuro,4.5);
            painel(sx-43,226,18,8);
          }
        });
        formaCel(`M${160-ombro} 129 L160 116 L${160+ombro} 129 L${160+ombro-8} 193 L178 214 H143 L${160-ombro+9} 192Z`,casco,6);
        formaCel(androide ? 'M140 130 L160 137 L180 130 L176 179 L160 201 L144 179Z' : 'M120 138 L160 151 L200 138 L194 169 L160 183 L126 169Z',metal,4.5);
        if(androide) {
          for(let y=162;y<=192;y+=10) linha(`M146 ${y} H174`,2.5,escuro);
          circulo(160,150,7,neon,tinta,3);
        } else {
          lente(160,166,pesado?19:14); painel(141,193,38,8);
        }
        em(160,yCabeca,cabeca,()=>{
          if(androide) {
            formaCel('M-27 -22 L-14 -37 H15 L29 -23 L27 17 L13 36 H-12 L-28 16Z',metal,5);
            path('M-23 -4 H23 L17 6 H-18Z',escuro,tinta,2.5);
            linha('M-17 0 H-6 M6 0 H17',3,neon); linha('M-8 23 H8 M0 5 V16',2.5);
            linha('M-20 -24 L-17 -10 M20 -24 L17 -10',2,neon);
          } else {
            formaCel('M-35 -21 L0 -36 L35 -21 L39 17 L21 34 H-21 L-39 17Z',metal,5.5);
            path('M-29 -6 L0 0 L29 -6 L25 10 L0 16 L-25 10Z',neon,tinta,3);
            path('M-15 17 H15 V28 H-15Z',escuro,tinta,3);
            linha('M-8 19 V26 M0 19 V26 M8 19 V26',2,corAco);
            if(chance(.5)) path('M-34 -17 L-43 -49 L-26 -31 M34 -17 L43 -49 L26 -31',corSec,tinta,3);
          }
        });
      } else if (['robo-insetoide','robo-aracnideo','insetoide'].includes(subtipo)) {
        const organico=subtipo==='insetoide', aranha=subtipo==='robo-aracnideo';
        const corpo=organico?casco:metal, qtd=aranha?4:3;
        if(organico) desenharAsas('inseto');
        // Patas segmentadas possuem juntas próprias e não são braços humanos.
        espelhar(()=>{
          for(let i=0;i<qtd;i++) {
            const base=141+i*23, kx=71-i*10, ky=100+i*43;
            tubo(`M124 ${base} L${kx} ${ky} L${24+i*12} ${ky+49}`,organico?8:12,organico?corBase:escuro);
            formaCel(`M119 ${base-6} L${kx} ${ky-7} L${kx-7} ${ky+5} L123 ${base+9}Z`,corpo,4);
            junta(kx,ky,organico?5:8);
            path(`M${24+i*12} ${ky+42} l-8 22 l18 -8Z`,organico?corOsso:metal,tinta,3.5);
          }
        });
        formaCel(aranha?'M104 168 Q88 204 112 248 Q160 279 206 248 Q232 205 216 168Z':'M129 165 Q108 220 139 272 L160 289 L181 272 Q211 218 191 165Z',casco,6);
        if(aranha) {
          formaCel('M117 180 L160 160 L203 180 L206 221 L160 249 L114 221Z',metal,4.5);
          lente(160,204,22); painel(138,237,44,8);
        } else {
          for(let y=194;y<270;y+=18) linha(`M133 ${y} Q160 ${y+12} 187 ${y}`,3,escuro);
          linha('M160 186 V279',3,organico?corSec:neon);
        }
        formaCel('M130 117 L160 105 L190 117 L200 165 L160 188 L120 165Z',corpo,5.5);
        espelhar(()=>{
          tubo('M143 89 L123 57 L101 43',4,organico?corSombra:corAco);
          circulo(101,43,5,neon,tinta,2);
        });
        formaCel(aranha?'M116 99 L138 81 H182 L205 99 L198 137 L160 151 L122 137Z':'M102 90 L160 74 L218 90 L186 126 L160 144 L134 126Z',corpo,5.5);
        if(organico) {
          elipse(120,100,17,20,corSec,tinta,4); elipse(200,100,17,20,corSec,tinta,4);
          for(const cx of [120,200]) for(let j=-1;j<=1;j++) for(let k=-1;k<=1;k++) circulo(cx+j*7,100+k*9,2.2,corLuz,'none',0);
        } else if(aranha) {
          for(const [x,y,r] of [[137,110,10],[183,110,10],[151,94,5],[169,94,5]]) lente(x,y,r);
        } else { lente(130,102,14); lente(190,102,14); }
        path('M143 127 Q117 146 149 158 L145 143Z M177 127 Q203 146 171 158 L175 143Z',organico?corOsso:metal,tinta,3.5);
        if(!aranha) {
          espelhar(()=>{
            formaCel('M124 152 L84 122 L57 153 L68 167 L89 145 L122 170Z',corpo,4.5);
            formaCel('M58 151 L27 200 Q58 194 80 166Z',organico?`url(#${uid}_sec)`:metal,4.5);
            linha('M36 190 L67 165',2,neon);
          });
        }
      } else if (subtipo === 'drone') {
        const formato=int(0,2);
        espelhar(()=>{
          formaCel('M109 151 L70 121 L37 130 L25 170 L67 189 L107 176Z',metal,5);
          painel(37,146,29,12); propulsor(59,195,.63);
          tubo('M129 210 L103 242 L87 239',8,escuro); junta(103,242,7);
          path('M88 234 L72 240 L79 256 M88 245 L91 258 L104 252','none',corAco,5);
        });
        if(formato===0) circulo(160,152,68,casco,tinta,6);
        else formaCel(formato===1?'M101 110 L160 76 L219 110 L223 174 L187 211 H133 L97 174Z':'M98 127 Q99 79 160 80 Q220 79 222 127 L209 199 L160 223 L110 199Z',casco,6);
        lente(160,149,43); linha('M139 100 Q161 89 184 104',3,neon);
        painel(140,201,40,8); tubo('M160 83 V54',5,metal); circulo(160,48,9,neon,tinta,3);
      } else if (subtipo === 'sentinela') {
        // Trípode de exploração, com três pernas e um único sensor elevado.
        for(const [kx,ky,fx] of [[160,226,167],[76,222,34],[244,222,286]]) {
          tubo(`M160 160 L${kx} ${ky} L${fx} 285`,13,escuro);
          junta(kx,ky,10);
          formaCel(`M${fx-15} 279 L${fx+13} 279 L${fx+22} 292 H${fx-24}Z`,metal,4);
          linha(`M${kx} ${ky+13} L${fx} 273`,3,neon);
        }
        formaCel('M112 96 L146 71 L199 87 L220 126 L192 175 L134 179 L100 144Z',metal,6);
        formaCel('M108 131 L145 109 L204 115 L194 150 L145 164Z',casco,4.5);
        lente(158,133,25);
        tubo('M128 94 L116 58',5,escuro); circulo(113,51,7,neon,tinta,3);
        tubo('M196 101 L221 76',5,escuro); painel(215,61,23,17);
      } else if (['nave','disco-voador','nave-viva'].includes(subtipo)) {
        if(subtipo==='disco-voador') {
          const raio=int(111,134), altura=int(125,148);
          path(`M129 ${altura+39} L80 286 Q160 309 240 286 L191 ${altura+39}Z`,neon,'none',0,'opacity="0.12"');
          elipse(160,287,80,13,'none',neon,1.5);
          formaCel(`M${160-raio} ${altura} Q160 ${altura-70} ${160+raio} ${altura} L${160+raio-21} ${altura+37} Q160 ${altura+78} ${181-raio} ${altura+37}Z`,metal,6);
          elipse(160,altura,raio,32,casco,tinta,5);
          formaCel(`M104 ${altura-9} Q104 ${altura-80} 160 ${altura-80} Q216 ${altura-80} 216 ${altura-9} Q160 ${altura+12} 104 ${altura-9}Z`,escuro,4.5);
          path(`M114 ${altura-20} Q112 ${altura-63} 157 ${altura-69} Q134 ${altura-45} 144 ${altura-17}Z`,neon,'none',0,'opacity="0.48"');
          if(chance(.6)) { elipse(174,altura-32,17,23,corBase,tinta,2); elipse(167,altura-35,5,8,tinta,'none',0); elipse(181,altura-35,5,8,tinta,'none',0); }
          for(let i=0;i<7;i++) circulo(61+i*33,altura+24+Math.sin(i/6*Math.PI)*17,5,neon,tinta,2);
          elipse(160,altura+58,23,6,neon,tinta,3);
        } else if(subtipo==='nave') {
          const asa=esc([18,30,42]);
          propulsor(116,251,.78); propulsor(204,251,.78);
          // Vista superior: cabine, duas asas, canhões e motores separados.
          formaCel(`M140 102 L${asa} 222 L${asa+9} 251 L118 215 L160 247 L202 215 L${320-asa-9} 251 L${320-asa} 222 L180 102Z`,casco,6);
          espelhar(()=>{
            formaCel('M106 136 L88 144 L89 240 L123 250 L134 203Z',metal,4.5);
            painel(98,197,19,22);
            tubo('M62 191 V147',7,escuro); circulo(62,145,4,neon,tinta,2);
            linha(`M${asa+15} 224 L117 159`,3,neon);
          });
          formaCel('M160 29 L184 98 L182 207 L160 250 L138 207 L136 98Z',metal,5.5);
          formaCel('M160 74 L174 112 L169 170 H151 L146 112Z',escuro,4);
          path('M160 86 L165 116 L162 154 H153 L153 114Z',neon,'none',0);
          painel(147,193,26,10); linha('M160 215 V236',3,corSec);
        } else {
          // Organonave em forma de arraia: asas vivas, costelas e bolsas de propulsão.
          formaCel('M146 191 Q88 220 47 211 L20 229 L35 192 L18 171 L68 135 L121 111 L160 83 L199 111 L252 135 L302 171 L285 192 L300 229 L273 211 Q232 220 174 191Z',casco,6);
          espelhar(()=>{
            for(let i=0;i<4;i++) linha(`M${136-i*8} ${135+i*11} Q${90-i*12} ${147+i*12} ${43+i*7} ${180+i*5}`,3,corLuz);
            formaCel('M112 153 Q77 178 86 214 Q110 227 125 204Z',escuro,4);
            elipse(105,197,10,17,neon,tinta,2.5);
            tubo('M121 202 Q105 255 79 267',6,corSec);
          });
          formaCel('M160 57 Q202 97 188 161 L173 200 L182 272 L160 297 L139 272 L147 200 L132 162 Q118 99 160 57Z',`url(#${uid}_sec)`,5.5);
          for(let y=176;y<276;y+=16) linha(`M147 ${y} Q160 ${y+8} 174 ${y}`,2.5,escuro);
          desenharOlho(151,121,8,'fenda',neon,20); desenharOlho(173,121,8,'fenda',neon,-20);
          path('M150 147 L160 170 L172 146Z',escuro,tinta,3);
        }
      } else if (subtipo === 'cinzento' || subtipo === 'tecnologico') {
        const tec=subtipo==='tecnologico', corPele=esc(['#9aaeb2','#94ada3','#b7a5c5','#a2b9cd']);
        const cranioLargo=int(43,56);
        if(tec) {
          circulo(160,113,87,'none',corSec,2,'stroke-dasharray="12 7"');
          formaCel('M116 147 L89 200 L102 255 L135 227 M204 147 L231 200 L218 255 L185 227',metal,5);
          lente(72,116,13); lente(248,116,13);
        }
        tubo('M146 221 L134 252 L128 280',12,corPele); tubo('M174 221 L185 253 L196 280',12,corPele);
        formaCel('M128 274 L111 289 L139 291 L142 279 M193 274 L182 289 L213 291 L208 280Z',tec?metal:corPele,4);
        formaCel('M142 144 Q160 131 179 144 L194 182 L178 230 Q160 241 141 230 L128 181Z',tec?casco:corPele,5.5);
        tubo('M136 159 L104 197 L84 181',11,corPele); tubo('M184 159 L215 200 L241 180',11,corPele);
        for(const [x,s] of [[84,-1],[241,1]]) {
          elipse(x,176,9,12,corPele,tinta,3);
          for(let i=0;i<3;i++) tubo(`M${x-6+i*6} 174 Q${x-9+i*8} 153 ${x+s*(6+i*4)} ${146+i*3}`,3,corPele,false);
        }
        if(tec) { formaCel('M137 160 L159 177 L183 160 L174 198 H146Z',metal,3.5); lente(160,189,10); painel(145,217,29,7); }
        else { linha('M145 177 Q160 185 176 177 M149 203 Q160 209 173 203',2.5,'#627d83'); }
        tubo('M159 151 V130',14,corPele);
        formaCel(`M160 33 C${160-cranioLargo-26} 31 ${160-cranioLargo-10} 98 127 125 L149 145 H172 L194 124 C${160+cranioLargo+10} 98 ${160+cranioLargo+26} 31 160 33Z`,corPele,5.5);
        path('M115 83 Q138 81 149 108 Q128 120 115 99Z M205 83 Q182 81 171 108 Q192 120 205 99Z','#16242c',tinta,3);
        elipse(127,93,4,7,'#c6edf0','none',0); elipse(192,93,4,7,'#c6edf0','none',0);
        linha('M151 128 Q160 132 169 128',2.5); circulo(157,118,1.5,tinta,'none',0); circulo(164,118,1.5,tinta,'none',0);
        if(tec) { formaCel('M121 63 Q160 20 199 63 L186 68 L160 56 L135 69Z',metal,4); lente(160,57,8); }
      } else if (subtipo === 'predador' || subtipo === 'reptiliano') {
        const reptil=subtipo==='reptiliano';
        formaCel('M192 218 Q257 245 273 185 Q299 237 270 262 Q224 289 178 247Z',casco,5.5);
        for(let i=0;i<4;i++) path(`M${223+i*13} ${249-i*8} l12 -19 l5 18Z`,corSec,tinta,3);
        tubo('M136 222 L111 253 L112 280',22,corBase); tubo('M185 222 L208 250 L221 280',22,corBase);
        formaCel('M99 274 L89 292 L129 291 L127 275 M210 275 L207 291 H245 L234 275Z',casco,4.5);
        formaCel('M118 135 L93 172 L110 196 L133 162 M201 135 L226 171 L211 199 L188 162',casco,5);
        formaCel('M108 178 L84 193 L66 224 L89 241 L111 219 L127 193Z',reptil?casco:metal,5);
        formaCel('M213 178 L235 196 L255 216 L240 239 L218 219 L198 193Z',reptil?casco:metal,5);
        path('M68 224 L54 247 L72 240 L74 256 L90 237 M250 221 L270 238 L254 238 L260 252 L240 238Z',corOsso,tinta,3);
        formaCel('M126 134 L159 121 L195 135 L205 176 L184 226 L161 245 L134 228 L113 174Z',casco,6);
        formaCel('M140 150 L161 162 L184 149 L181 218 L160 232 L139 215Z',reptil?`url(#${uid}_osso)`:metal,4);
        for(let y=176;y<=213;y+=12) linha(`M142 ${y} Q161 ${y+9} 179 ${y}`,2.5);
        if(!reptil) {
          espelhar(()=>{
            for(let i=0;i<3;i++) tubo(`M${129-i*5} ${74+i*11} Q${81-i*12} ${98+i*13} ${101-i*8} ${164+i*8}`,8,escuro);
            path('M103 199 L46 154 L75 212Z',metal,tinta,3.5);
          });
        } else {
          formaCel('M129 91 L114 48 L140 60 L151 27 L169 55 L190 35 L195 76Z',`url(#${uid}_sec)`,4.5);
        }
        formaCel(reptil?'M119 78 L151 60 L190 72 L207 105 L187 137 L146 145 L115 114Z':'M121 65 L160 47 L199 67 L206 112 L188 139 L160 151 L132 137 L115 112Z',casco,5.5);
        desenharOlho(138,96,9,'fenda',neon,15); desenharOlho(183,95,9,'fenda',neon,-15);
        if(reptil) {
          formaCel('M126 111 L163 102 L198 115 L186 140 L147 144 L123 131Z',corBase,4);
          linha('M132 129 L185 131',3); path('M140 129 L144 140 L148 130 M175 129 L179 139 L183 129',corOsso,tinta,2);
          circulo(153,115,2.5,tinta,'none',0); circulo(173,115,2.5,tinta,'none',0);
          for(let i=0;i<5;i++) path(`M${124+i*8} ${78+(i%2)*5} l4 -6 l4 6 l-4 3Z`,corLuz,'none',0);
        } else {
          path('M141 113 L129 133 L147 147 L153 125 M180 113 L193 134 L174 149 L168 125',corOsso,tinta,3.5);
          path('M151 118 L161 111 L171 119 L166 138 H155Z',escuro,tinta,3);
          lente(160,74,6);
        }
      } else if (subtipo === 'tentacular') {
        const bulbo=int(0,2), tentaculos=int(6,8);
        for(let i=0;i<tentaculos;i++) {
          const x=128+i*64/(tentaculos-1), end=30+i*260/(tentaculos-1), y=int(247,290), desvio=end<160?-28:28;
          tubo(`M${x} 160 C${x+desvio} 202 ${end+desvio} ${y-40} ${end} ${y} Q${end-desvio*.5} ${y+12} ${end-desvio*.7} ${y-9}`,int(11,16),i%2?corBase:corSec);
          for(let j=0;j<3;j++) circulo(end+(x-end)*(.24+j*.09),y-35-j*10,2.2,corLuz,'none',0);
        }
        formaCel(bulbo===0?'M108 114 Q83 44 154 33 Q217 25 220 98 L202 154 L160 183 L120 153Z':bulbo===1?'M92 98 Q100 40 145 69 L160 38 L178 68 Q223 41 229 99 L196 156 L160 175 L121 152Z':'M111 76 L159 29 L208 77 L221 126 L192 159 L160 175 L125 157 L98 125Z',casco,6);
        const olhos=esc([3,5]);
        for(let i=0;i<olhos;i++) desenharOlho(120+i*80/(olhos-1),104+Math.sin(i*Math.PI/(olhos-1))*12,olhos===3?11:7,'fenda',neon,12-i*24/(olhos-1));
        path('M145 143 Q160 133 177 144 L163 158Z',escuro,tinta,3.5);
        for(let i=0;i<4;i++) circulo(145+i*11,75-Math.sin(i)*12,3,corLuz,'none',0);
      } else if (subtipo === 'aquatico') {
        // Alien abissal: lanterna, barbatanas e cauda, sem pernas humanoides.
        formaCel('M148 192 Q121 242 167 258 Q196 280 162 293 Q228 301 232 263 Q224 232 179 207Z',casco,5);
        path('M170 258 L152 241 L138 253 L153 280 L162 293 L190 283Z',`url(#${uid}_sec)`,tinta,3.5);
        espelhar(()=>{
          formaCel('M121 132 L58 98 L79 132 L30 153 L68 170 L51 198 L109 177Z',`url(#${uid}_sec)`,5);
          linha('M117 150 L47 152 M111 155 L67 183 M112 141 L73 117',2.5,corLuz);
        });
        formaCel('M104 115 Q99 65 157 61 Q218 62 219 119 L202 185 L174 222 H146 L115 186Z',casco,6);
        tubo('M158 66 Q161 19 205 31 Q225 39 218 60',5,corBase); circulo(217,64,12,neon,tinta,3); circulo(214,60,4,'#fff','none',0);
        desenharOlho(130,118,11,'fenda',neon,15); desenharOlho(190,118,11,'fenda',neon,-15);
        formaCel('M122 158 Q159 137 197 160 Q190 199 160 204 Q130 195 122 158Z',escuro,4);
        for(let i=0;i<6;i++) path(`M${130+i*11} ${158+Math.abs(2.5-i)*2} l4 18 l5 -18Z`,corOsso,tinta,1.5);
        for(let i=0;i<4;i++) path(`M${139+i*12} 194 l4 -14 l5 14Z`,corOsso,tinta,1.5);
        for(const s of [-1,1]) for(let i=0;i<4;i++) circulo(160+s*(44-i*4),139+i*15,3,neon,'none',0);
      } else if (subtipo === 'fungoide') {
        for(let i=0;i<6;i++) {
          const x=82+i*31;
          tubo(`M${141+i*7} 229 Q${x} 251 ${x-13} 288 Q${x+4} 276 ${x+14} 286`,9,i%2?corBase:corSec);
        }
        tubo('M130 177 Q86 165 72 203 L49 211',11,corBase); tubo('M194 169 Q224 154 253 177 L264 163',11,corBase);
        formaCel('M133 117 Q147 176 118 232 Q160 258 202 232 Q175 181 190 118Z',`url(#${uid}_osso)`,5.5);
        linha('M147 160 Q156 199 138 231 M175 157 Q165 199 184 234',3,corSombra);
        const chapeu=esc([0,1]);
        formaCel(chapeu===0?'M51 116 Q80 80 102 65 Q163 15 219 66 L270 116 Q161 156 51 116Z':'M61 116 L97 94 L109 54 L137 63 L157 24 L181 60 L214 52 L225 92 L264 116 Q162 160 61 116Z',casco,6);
        path('M68 117 Q160 150 252 117 Q158 130 68 117Z',corSombra,tinta,2.5);
        for(const [x,y,r] of [[106,93,10],[146,68,12],[188,91,15],[215,108,6],[169,106,7]]) {
          elipse(x,y,r,r*.6,neon,tinta,2.5); circulo(x-2,y-2,2,'#fff','none',0);
        }
        desenharOlho(146,164,8,'energia',corSec,14); desenharOlho(181,165,8,'energia',corSec,-14);
        path('M154 196 Q164 189 176 197 L170 211 H160Z',escuro,tinta,3);
        for(const [x,y] of [[46,203],[266,155],[83,57]]) { circulo(x,y,6,neon,tinta,2); linha(`M${x} ${y+8} l-4 11`,2,corBase); }
      } else if (subtipo === 'cristalino') {
        // Facetas orientadas: a seed altera as proporções dos cristais.
        const cristal=(x,y,w,h,angle=0)=>em(x,y,1,()=>{
          formaCel(`M0 ${-h} L${w} ${-h*.42} L${w*.67} ${h*.25} L0 ${h*.5} L${-w*.7} ${h*.25} L${-w} ${-h*.42}Z`,casco,4.5);
          path(`M0 ${-h} V${h*.5} L${-w*.7} ${h*.25} L${-w} ${-h*.42}Z`,corSec,tinta,2);
          path(`M0 ${-h} L${w} ${-h*.42} L0 ${-h*.2}Z`,corLuz,tinta,2);
          linha(`M0 ${-h*.2} L${w*.67} ${h*.25}`,2,neon);
        },angle);
        cristal(93,171,27,int(50,72),-38); cristal(228,175,26,int(54,75),38);
        cristal(123,254,22,48,20); cristal(195,252,22,49,-20);
        cristal(160,166,51,int(76,99));
        cristal(123,108,19,51,-30); cristal(199,103,19,56,28);
        cristal(163,84,25,53);
        lente(160,166,18);
        for(const [x,y] of [[52,91],[263,99],[71,256],[252,267]]) cristal(x,y,8,int(11,18),int(-25,25));
      } else if (subtipo === 'gelatinoso') {
        const lobos=int(4,7);
        // Membrana assimétrica; olhos e organelas ficam restritos ao corpo central.
        formaCel('M65 195 C30 154 50 104 83 102 C79 63 126 41 153 66 C186 30 226 61 225 97 C278 94 291 138 262 170 C296 211 257 256 215 249 C192 290 141 279 120 256 C61 280 35 235 65 195Z',casco,6);
        path('M82 169 Q58 138 88 121 Q94 81 125 87 Q103 111 101 145Z',corLuz,'none',0,'opacity="0.5"');
        for(let i=0;i<lobos;i++) {
          const x=int(100,218),y=int(116,221),r=int(7,14);
          circulo(x,y,r,corSec,tinta,2.5); circulo(x-2,y-2,r*.25,neon,'none',0);
        }
        const olhos=esc([1,3,5]);
        if(olhos===1) lente(160,147,36);
        else for(let i=0;i<olhos;i++) lente(99+i*122/(olhos-1),140+Math.sin(i*1.8)*22,olhos===3?19:12);
        path('M130 210 Q161 231 198 204 Q180 247 146 237Z',escuro,tinta,3);
        for(let i=0;i<3;i++) path(`M${148+i*13} 220 l4 9 l5 -8Z`,corOsso,'none',0);
        elipse(84,276,20,9,corBase,tinta,3); elipse(239,273,13,6,corSec,tinta,3);
      } else if (subtipo === 'cosmico') {
        // Entidade não humanoide: anéis orbitais, núcleo vivo e fragmentos flutuantes.
        for(const a of [-42,38,88]) em(160,160,1,()=>elipse(0,0,125,44,'none',corSec,3),a);
        formaCel('M161 47 L195 88 L191 122 L224 154 L201 190 L194 233 L161 270 L130 232 L123 192 L95 159 L128 123 L125 88Z',escuro,5.5);
        path('M161 58 L145 102 L160 129 L142 165 L164 198 L148 230 L161 259 L182 225 L175 194 L192 160 L176 128 L183 99Z',casco,tinta,3);
        for(let i=0;i<12;i++) circulo(int(139,182),int(94,229),num(1.2,2.5),neon,'none',0);
        desenharOlho(160,156,28,'fenda',neon,0);
        for(let i=0;i<6;i++) {
          const a=(i*60+15)*Math.PI/180,x=160+Math.cos(a)*118,y=160+Math.sin(a)*118;
          em(x,y,1,()=>path('M0 -12 L9 0 L0 13 L-9 0Z',casco,tinta,3),i*30);
        }
        circulo(160,156,53,'none',neon,2,'stroke-dasharray="5 11"');
      } else if (subtipo === 'verme-espacial') {
        // Anéis sucessivos ao longo da curva formam o corpo serpentiforme.
        tubo('M244 277 C96 288 68 236 138 216 C234 196 231 150 185 129',43,corBase);
        for(let i=0;i<9;i++) {
          const t=i/8, x=99+143*t, y=252+Math.sin(t*Math.PI)*22;
          linha(`M${x} ${y-16} Q${x-8} ${y} ${x+3} ${y+18}`,3,corSombra);
        }
        formaCel('M229 263 L290 265 L268 281 L288 294 L245 296 L226 284Z',`url(#${uid}_sec)`,4.5);
        espelhar(()=>{
          formaCel('M119 150 L81 177 L99 127 L82 102 L114 111Z',`url(#${uid}_sec)`,4.5);
        });
        const largura=int(52,65);
        elipse(160,112,largura,68,casco,tinta,6);
        elipse(160,118,largura-14,51,escuro,tinta,4);
        for(let i=0;i<12;i++) {
          const a=i*Math.PI*2/12,x=160+Math.cos(a)*(largura-17),y=118+Math.sin(a)*46;
          const bx=160+Math.cos(a+.16)*(largura-17),by=118+Math.sin(a+.16)*46;
          path(`M${x} ${y} L${160+Math.cos(a+.08)*23} ${118+Math.sin(a+.08)*25} L${bx} ${by}Z`,corOsso,tinta,1.6);
        }
        elipse(160,118,19,24,corSombra,tinta,3);
        for(const [x,y] of [[119,75],[142,55],[179,55],[202,75]]) lente(x,y,7);
        linha('M146 114 L154 122 L167 112 L176 121',2,neon);
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img" data-familia="${TIPOS[id]}" data-subtipo="${subtipo}" data-genero="${genero}"><title>${TIPOS[id]} (${subtipo})</title>${svg.join('')}</svg>`;
  }

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

  const api = { gerarCriatura, gerarSVG, TIPOS, SUBTIPOS, NOMES_SUBTIPOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(raiz, api);
})
  export { gerarCriatura, gerarSVG, TIPOS, SUBTIPOS, NOMES_SUBTIPOS };
  (typeof globalThis !== 'undefined' ? globalThis : this);