/* ============================================================================
 * GERADOR PROCEDURAL DE CARTAS SVG v4 (MASTER ILLUSTRATION ENGINE)
 * Renderização Vetorial Multi-Camadas: Cel-Shading, Espaço Negativo e Rigging
 * Compatível com navegador (DOM) e Node.js. Zero dependências externas.
 * ============================================================================ */
(function (raiz) {
  'use strict';

  const TIPOS = ['Humanos', 'Monstros', 'Alien', 'Mortos-Vivos', 'Animais'];

  const SUBTIPOS = {
    0: ['guerreiro', 'mago', 'arqueiro', 'barbaro', 'paladino', 'assassino', 'monge', 'necromante'],
    1: ['orc', 'minotauro', 'dragao', 'slime', 'goblin', 'ciclope', 'golem', 'lobisomem', 'homem-fera', 'hidra', 'demonio'],
    2: ['robo', 'predador', 'cosmico', 'tecnologico', 'cinzento', 'insetoide', 'drone'],
    3: ['vampiro', 'dragao-zumbi', 'fantasma', 'lich', 'esqueleto', 'zumbi', 'mumia', 'ceifador'],
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

  function gerarSVG(tipo, { seed = Math.random().toString(36).slice(2, 10), fundo = true } = {}) {
    const chave = String(tipo).trim().toLowerCase().replace(/\s+/g, '-');
    if (!Object.prototype.hasOwnProperty.call(aliases, chave)) {
      throw new RangeError('Tipo inválido. Use: ' + TIPOS.join(', '));
    }

    const [id, subForcado, genForcado] = aliases[chave];
    const rnd = aleatorio(id + ':' + (subForcado || 'all') + ':' + seed);
    const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
    const num = (a, b) => +(a + rnd() * (b - a)).toFixed(1);
    const esc = lista => lista[int(0, lista.length - 1)];
    const chance = (p = 0.5) => rnd() < p;

    const subtipo = subForcado || esc(SUBTIPOS[id]);
    const genero = genForcado || (chance(0.5) ? 'F' : 'M');
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
    if (fundo) {
      const hBg = id === 4 ? esc([125, 32, 200, 15]) : H;
      path('M0 0 H320 V320 H0 Z', hsl(hBg, 38, 7), 'none', 0);
      circulo(160, 148, 150, `url(#${uid}_aura)`, 'none', 0);

      if (id === 4) {
        // Cenário Selvagem Detalhado (Lua/Sol, Cordilheiras, Pinheiros/Rochas)
        circulo(int(75, 245), int(62, 95), int(30, 44), hsl(42, 85, 72), 'none', 0, 'opacity="0.22"');
        path('M0 242 L55 168 L112 218 L182 148 L255 212 L320 165 V320 H0 Z', hsl(hBg, 30, 13), 'none', 0);
        path('M0 264 L42 228 L88 258 L148 218 L218 256 L278 224 L320 258 V320 H0 Z', hsl(hBg, 35, 9), 'none', 0);
        path('M0 276 Q90 258 165 276 T320 272 V320 H0 Z', '#05070a', 'none', 0);
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
          formaCel('M112 108 C112 82 208 82 208 108 L220 156 C188 146 132 146 100 156 Z', corSombra, tinta, 7);
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
    // MOTOR 4: MORTOS-VIVOS (8 Subarquétipos Sombrios e Detalhados)
    // =========================================================================
    else if (id === 3) {
      if (subtipo === 'vampiro') {
        desenharAsas('draconica', `url(#${uid}_sec)`);
        formaCel('M70 164 L92 84 L160 148 L228 84 L250 164 L232 292 H88 Z', '#12060b', 7.5);
        formaCel('M110 160 L160 228 L210 160 L198 292 H122 Z', '#8f0f26', 6.5);
        espelhar(() => formaCel('M110 106 L76 88 L94 126 Z', '#dfdce8', 5.5));
        formaCel('M114 94 C114 50 206 50 206 94 L196 138 L160 166 L124 138 Z', '#dfdce8', 6.5);
        formaCel('M110 96 C106 42 214 42 210 96 C192 68 174 68 160 88 C146 68 128 68 110 96 Z', '#100e17', 6);
        desenharOlho(138, 108, 8.5, 'fenda', '#ff143b', 12);
        desenharOlho(182, 108, 8.5, 'fenda', '#ff143b', -12);
        linha('M138 140 Q160 134 182 140', 4);
        path('M142 139 L147 156 L152 139 M178 139 L173 156 L168 139', '#ffffff', tinta, 3.2);

      } else if (subtipo === 'ceifador') {
        // Ceifador da Morte com Capuz Vazio, Correntes e Foice Colossal à Frente
        formaCel('M62 292 L88 146 L160 32 L232 146 L258 292 L218 274 L188 292 L160 274 L132 292 L102 274 Z', '#10141d', 7.5);
        formaCel('M106 136 C106 68 214 68 214 136 C198 176 122 176 106 136 Z', '#030407', 6.5);
        desenharOlho(136, 116, 7.5, 'energia', '#ff1e42', 12);
        desenharOlho(184, 116, 7.5, 'energia', '#ff1e42', -12);
        // Foice Gigante detalhada
        formaCel('M56 288 L236 38 L246 44 L66 294 Z', '#3d2415', 6);
        formaCel('M232 48 C134 12 56 54 28 132 C88 86 164 74 224 78 Z', `url(#${uid}_aco)`, 6.5);
        linha('M42 116 C92 78 158 66 218 68', 3, '#ffffff');
        // Mão Esquelética segurando a haste da foice
        formaCel('M132 168 L158 174 L152 194 L126 188 Z', `url(#${uid}_osso)`, 5);

      } else if (subtipo === 'zumbi') {
        // Zumbi Assimétrico com Pescoço Torto, Cérebro Exposto e Costelas à Mostra
        formaCel('M84 180 L68 292 H240 L226 166 Z', `url(#${uid}_sec)`, 7);
        for (let r = 0; r < 3; r++) {
          formaCel(`M164 ${194 + r * 18} Q198 ${202 + r * 18} 210 ${190 + r * 18} L208 ${200 + r * 18} Q194 ${210 + r * 18} 164 ${202 + r * 18} Z`, `url(#${uid}_osso)`, 4.5);
        }
        svg.push('<g transform="rotate(14 160 118)">');
        formaCel('M110 94 C106 44 214 44 210 94 C214 138 192 166 160 168 C128 166 106 138 110 94 Z', hsl(112, 28, 38), 7);
        formaCel('M158 52 C188 48 210 66 208 92 C188 94 170 80 158 52 Z', '#d95b76', 5.5);
        linha('M170 64 Q184 72 196 66 M176 76 Q190 84 200 78', 3);
        desenharOlho(134, 112, 13, 'fera', '#e8ff66', 0);
        circulo(184, 112, 11, '#080a0f', tinta, 4);
        linha('M176 104 L192 120 M192 104 L176 120', 3.5, '#ff3355');
        formaCel('M128 144 Q160 134 192 148 L186 164 H134 Z', '#14080c', 5);
        formaCel('M156 146 C154 174 174 184 180 164 Z', '#d93852', 4.5);
        svg.push('</g>');

      } else if (subtipo === 'mumia') {
        // Faraó Múmia Amaldiçoado com Colar Egípcio de Ouro e Faixas Flutuantes
        formaCel('M92 168 L78 292 H242 L228 168 Z', `url(#${uid}_osso)`, 7);
        formaCel('M88 164 C118 212 202 212 232 164 L214 152 C186 184 134 184 106 152 Z', `url(#${uid}_ouro)`, 6);
        formaCel('M110 94 C106 44 214 44 210 94 C214 138 190 166 160 168 C130 166 106 138 110 94 Z', `url(#${uid}_osso)`, 7);
        for (let y = 68; y <= 272; y += 16) {
          linha(`M102 ${y} L218 ${y + (y % 32 === 0 ? 12 : -12)}`, 3.8, '#8a7d62');
        }
        formaCel('M114 100 H206 L198 124 H122 Z', '#07090e', 5);
        desenharOlho(136, 112, 7.5, 'energia', corSec, 8);
        desenharOlho(184, 112, 7.5, 'energia', corSec, -8);

      } else if (subtipo === 'fantasma') {
        formaCel('M62 288 C78 246 48 196 68 134 C84 62 120 30 160 30 C200 30 236 62 252 134 C272 196 242 246 258 288 L218 260 L188 292 L160 262 L132 292 L102 260 Z', `url(#${uid}_pri)`, 7, 'rgba(255,255,255,0.45)');
        formaCel('M106 136 C106 74 214 74 214 136 C202 178 118 178 106 136 Z', '#04060a', 6);
        desenharOlho(136, 120, 9, 'energia', corSec, 12);
        desenharOlho(184, 120, 9, 'energia', corSec, -12);
        espelhar(() => formaCel('M64 176 L28 158 L42 186 L20 192 L48 206 L32 218 L66 208 Z', `url(#${uid}_osso)`, 5.5));

      } else {
        // Lich Rei Arcano, Esqueleto Guerreiro ou Dragão-Zumbi
        if (subtipo === 'dragao-zumbi') desenharAsas('draconica', hsl(275, 35, 18));
        formaCel('M84 170 L58 292 H262 L236 170 Z', `url(#${uid}_sec)`, 7);
        // Coluna Vertebral e Caixa Torácica Anatômica Real
        formaCel('M152 164 H168 V282 H152 Z', `url(#${uid}_osso)`, 5.5);
        for (let r = 0; r < 4; r++) {
          const ry = 182 + r * 20;
          formaCel(`M112 ${ry} Q160 ${ry + 18} 208 ${ry} L202 ${ry + 10} Q160 ${ry + 26} 118 ${ry + 10} Z`, `url(#${uid}_osso)`, 5);
        }
        if (subtipo === 'dragao-zumbi') desenharChifres(122, 88, 1.05, 1);
        // Crânio Anatômico com Arcos Zigomáticos, Cavidade Nasal e Dentes Individuais
        formaCel('M108 102 C100 42 220 42 212 102 C218 122 206 138 190 142 L186 174 H134 L130 142 C114 138 102 122 108 102 Z', `url(#${uid}_osso)`, 7);
        if (subtipo === 'lich') {
          formaCel('M108 76 L114 30 L138 58 L160 18 L182 58 L206 30 L212 76 Z', `url(#${uid}_ouro)`, 6);
          circulo(160, 52, 8, corSec, tinta, 3.5);
        }
        circulo(136, 110, 16, '#06080c', tinta, 4.5);
        circulo(184, 110, 16, '#06080c', tinta, 4.5);
        desenharOlho(136, 110, 6.5, 'energia', '#00ffaa', 0);
        desenharOlho(184, 110, 6.5, 'energia', '#00ffaa', 0);
        path('M160 118 L148 138 H172 Z', '#06080c', tinta, 3.5);
        linha('M134 156 H186 M144 144 V170 M154 144 V170 M166 144 V170 M176 144 V170', 3.5);
        linha('M178 52 L168 74 L182 82 L172 96', 3);
      }
    }

    // =========================================================================
    // MOTOR 5: ALIENS, MECHAS & ENTIDADES CÓSMICAS (7 Subarquétipos Sci-Fi)
    // =========================================================================
    else {
      if (subtipo === 'robo') {
        // Mecha / Androide de Batalha Blindado com Canhões de Ombro e Visor HUD
        espelhar(() => {
          formaCel('M108 144 L42 114 L30 168 L96 190 Z', `url(#${uid}_aco)`, 7);
          formaCel('M64 124 L46 68 L76 68 L88 134 Z', corSombra, 6);
          formaCel('M102 92 L78 36 L94 36 L114 84 Z', `url(#${uid}_ouro)`, 5.5);
        });
        formaCel('M92 164 L112 292 H208 L228 164 Z', `url(#${uid}_aco)`, 7.5);
        // Placas peitorais mecânicas e Reator de Fusão Central
        linha('M104 196 L136 214 M216 196 L184 214 M136 214 V284 M184 214 V284', 4.5);
        formaCel('M160 184 L186 214 L160 244 L134 214 Z', corSec, 6);
        circulo(160, 214, 11, '#ffffff', 'none', 0);
        // Cabeça Mecha Angular
        formaCel('M108 74 L160 56 L212 74 L220 132 L188 160 H132 L100 132 Z', `url(#${uid}_aco)`, 7.5);
        formaCel('M116 96 L160 104 L204 96 L198 118 L160 124 L122 118 Z', corSec, 5);
        linha('M136 138 H184 M140 148 H180', 4);

      } else if (subtipo === 'drone') {
        // Sonda Sentinela Orbital Esférica com Braços de Plasma e Lente Central
        espelhar(() => {
          formaCel('M98 144 L24 98 L16 146 L72 174 Z', `url(#${uid}_aco)`, 6.5);
          formaCel('M86 188 C42 214 36 264 74 284 C60 252 68 220 102 204 Z', `url(#${uid}_sec)`, 6);
        });
        formaCel('M92 154 C92 64 228 64 228 154 C228 244 92 244 92 154 Z', `url(#${uid}_aco)`, 7.5);
        circulo(160, 154, 46, '#080c12', tinta, 6);
        circulo(160, 154, 28, corSec, tinta, 4.5);
        circulo(150, 144, 9, '#ffffff', 'none', 0);

      } else if (subtipo === 'predador') {
        // Caçador Biomecânico Galáctico com Dreadlocks, Mandíbulas e Lâminas Duplas
        formaCel('M88 164 L108 292 H212 L232 164 Z', `url(#${uid}_pri)`, 7);
        espelhar(() => {
          for (let d = 0; d < 4; d++) {
            formaCel(`M${108 - d * 6} ${84 + d * 12} C${58 - d * 8} ${128 + d * 14} ${54 - d * 8} ${176 + d * 14} ${72 - d * 6} ${204 + d * 12} L${84 - d * 6} ${196 + d * 12} C${72 - d * 6} ${168 + d * 14} ${76 - d * 6} ${128 + d * 14} ${114 - d * 6} ${94 + d * 12} Z`, '#141820', 5);
          }
          formaCel('M114 136 L88 162 L124 168 Z', `url(#${uid}_osso)`, 5);
          // Lâminas de Pulso Energizadas cruzadas à frente
          formaCel('M42 198 L148 258 L140 270 L34 210 Z', `url(#${uid}_aco)`, 5.5);
        });
        formaCel('M110 68 L160 50 L210 68 L204 158 L160 178 L116 158 Z', `url(#${uid}_aco)`, 7);
        desenharOlho(136, 108, 10, 'energia', '#ff2244', 14);
        desenharOlho(184, 108, 10, 'energia', '#ff2244', -14);

      } else {
        // Entidade Cósmica Astral / Alien Psíquico / Tecnológico
        espelhar(() => {
          for (let t = 0; t < 3; t++) {
            formaCel(`M142 ${162 + t * 14} C${72 - t * 16} ${178 + t * 18} ${48 - t * 12} ${248} ${84 - t * 18} 288 C${68 - t * 12} 248 ${92 - t * 12} ${198 + t * 14} 148 ${178 + t * 14} Z`, `url(#${uid}_sec)`, 5.5);
          }
        });
        formaCel('M92 174 L116 292 H204 L228 174 L192 148 H128 Z', `url(#${uid}_sec)`, 7);
        formaCel('M160 22 C74 26 78 124 118 164 L144 188 H176 L202 164 C242 124 246 26 160 22 Z', `url(#${uid}_pri)`, 7.5);
        linha('M160 36 V96 M132 52 L160 76 L188 52', 3.5, corSec);
        desenharOlho(130, 118, 13, subtipo === 'cosmico' ? 'fenda' : 'energia', '#00ffcc', 18);
        desenharOlho(190, 118, 13, subtipo === 'cosmico' ? 'fenda' : 'energia', '#00ffcc', -18);
        if (subtipo === 'cosmico') desenharOlho(160, 82, 15, 'fenda', '#00ffcc', 0);
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img" data-familia="${TIPOS[id]}" data-subtipo="${subtipo}"><title>${TIPOS[id]} (${subtipo})</title>${svg.join('')}</svg>`;
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

  const api = { gerarCriatura, gerarSVG, TIPOS, SUBTIPOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(raiz, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);