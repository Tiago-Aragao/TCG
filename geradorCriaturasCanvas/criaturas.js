/* ============================================================================
 * GERADOR PROCEDURAL DE CENAS PARA CARDGAME v5 (CANVAS SHADER & SCENE ENGINE)
 * Soldagem de Silhueta, Detector de Bordas (Sobel/Ink), Rim-Light e Cenas MTG
 * 100% compatível com o index.html original. Sem dependências externas ou IA.
 * ============================================================================ */
(function (raiz) {
  'use strict';

  const TIPOS = ['Humanos', 'Monstros', 'Alien', 'Mortos-Vivos', 'Animais'];

  const SUBTIPOS = {
    0: ['guerreiro', 'mago', 'arqueiro', 'barbaro', 'paladino', 'assassino', 'monge', 'necromante'],
    1: ['dragao', 'orc', 'minotauro', 'slime', 'goblin', 'ciclope', 'golem', 'lobisomem', 'hidra', 'demonio'],
    2: ['robo', 'predador', 'cosmico', 'tecnologico', 'cinzento', 'insetoide', 'drone'],
    3: ['ceifador', 'vampiro', 'dragao-zumbi', 'fantasma', 'lich', 'esqueleto', 'zumbi', 'mumia'],
    4: ['lobo', 'cachorro', 'raposa', 'urso', 'leao', 'tigre', 'pantera', 'touro', 'cervo', 'javali', 'aguia', 'coruja', 'besouro', 'louva-a-deus', 'aranha', 'cobra']
  };

  const aliases = {
    humano: [0], humanos: [0], homem: [0], mulher: [0],
    monstro: [1], monstros: [1],
    alien: [2], aliens: [2],
    'morto-vivo': [3], 'mortos-vivos': [3],
    animal: [4], animais: [4],
    canino: [4, 'lobo'], felino: [4, 'tigre'], bovino: [4, 'touro'], passaro: [4, 'aguia'], inseto: [4, 'louva-a-deus']
  };
  Object.entries(SUBTIPOS).forEach(([id, lista]) => {
    lista.forEach(sub => { aliases[sub] = [Number(id), sub]; });
  });

  function aleatorio(seed) {
    let h = 2166136261;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return () => {
      h += 0x6D2B79F5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
  }

  /** Renderiza a cena completa em um HTMLCanvasElement 320x320 */
  function renderizarCenaCanvas(tipo, { seed = Math.random().toString(36).slice(2, 10), fundo = true } = {}) {
    const chave = String(tipo).trim().toLowerCase().replace(/\s+/g, '-');
    if (!Object.prototype.hasOwnProperty.call(aliases, chave)) {
      throw new RangeError('Tipo inválido. Use: ' + TIPOS.join(', '));
    }

    const [id, subForcado] = aliases[chave];
    const rnd = aleatorio(id + ':' + (subForcado || 'all') + ':' + seed);
    const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
    const num = (a, b) => a + rnd() * (b - a);
    const esc = lista => lista[int(0, lista.length - 1)];
    const chance = (p = 0.5) => rnd() < p;

    const subtipo = subForcado || esc(SUBTIPOS[id]);

    // Sorteia a AÇÃO / COMPOSIÇÃO DA CENA (Estilo Magic: The Gathering)
    const acoesPorTipo = {
      0: ['golpe-dinamico', 'conjuracao', 'guarda-heroica', 'emboscada'],
      1: ['sopro-energia', 'golpe-dinamico', 'colosso-horizonte', 'furia-berserk'],
      2: ['feixe-orbital', 'portal-cosmico', 'emboscada', 'colosso-horizonte'],
      3: ['ritual-necromantico', 'emboscada', 'ceifa-fatal', 'colosso-horizonte'],
      4: ['bote-selvagem', 'uivo-horizonte', 'espreita-mata', 'investida-feroz']
    };
    const acao = esc(acoesPorTipo[id]);

    // Paletas dramáticas de Iluminação e Corpo
    const matizes = {
      0: [210, 38, 350, 275, 155, 22],
      1: [12, 115, 350, 280, 32, 175],
      2: [185, 290, 145, 215, 325],
      3: [155, 270, 345, 195, 85],
      4: [28, 36, 18, 205, 125, 42]
    };
    const H = (esc(matizes[id]) + int(-15, 15) + 360) % 360;
    const HLuz = (H + esc([35, 145, 180, 215])) % 360;

    // Cores naturais específicas para animais
    const HCorpo = id === 4
      ? esc({ lobo: [215, 30], cachorro: [32, 25], raposa: [18], urso: [25, 200], leao: [38], tigre: [24], pantera: [230], touro: [20], cervo: [28], javali: [22], aguia: [28], coruja: [32], besouro: [165, 220], 'louva-a-deus': [105], aranha: [350, 260], cobra: [115, 42] }[subtipo] || [28])
      : H;
    const SCorpo = id === 4 && ['lobo', 'pantera', 'urso'].includes(subtipo) ? int(12, 32) : int(45, 78);
    const LCorpo = id === 4 && ['pantera', 'touro'].includes(subtipo) ? int(16, 26) : int(34, 48);

    const rgbBase = hslToRgb(HCorpo, SCorpo, LCorpo);
    const rgbSombra = hslToRgb(HCorpo, Math.min(90, SCorpo + 10), Math.max(8, LCorpo - 20));
    const rgbLuz = hslToRgb(HLuz, 92, 66);
    const rgbSec = hslToRgb((HCorpo + 165) % 360, 78, 52);

    const W = 320, H_CANVAS = 320;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H_CANVAS;
    const ctx = canvas.getContext('2d');

    // Posição da Fonte Principal de Luz da Cena (Lua, Magia, Fogo, Sol, Laser)
    const luzX = chance(0.5) ? int(45, 105) : int(215, 275);
    const luzY = ['conjuracao', 'sopro-energia', 'golpe-dinamico'].includes(acao) ? int(110, 180) : int(45, 95);

    // =========================================================================
    // PASSO 1: PINTURA DO CENÁRIO ATMOSFÉRICO (PROFUNDO)
    // =========================================================================
    if (fundo) {
      const gradCeu = ctx.createRadialGradient(luzX, luzY, 10, 160, 160, 260);
      gradCeu.addColorStop(0, `hsl(${HLuz}, 80%, 38%)`);
      gradCeu.addColorStop(0.45, `hsl(${H}, 48%, 14%)`);
      gradCeu.addColorStop(1, `hsl(${H}, 55%, 5%)`);
      ctx.fillStyle = gradCeu;
      ctx.fillRect(0, 0, W, H_CANVAS);

      // Astro / Portal / Fonte de Luz no Céu
      ctx.save();
      const raioAstro = acao === 'portal-cosmico' ? int(65, 85) : int(32, 52);
      const gradAstro = ctx.createRadialGradient(luzX, luzY, raioAstro * 0.2, luzX, luzY, raioAstro * 1.8);
      gradAstro.addColorStop(0, `hsla(${HLuz}, 100%, 88%, 0.95)`);
      gradAstro.addColorStop(0.5, `hsla(${HLuz}, 90%, 55%, 0.45)`);
      gradAstro.addColorStop(1, `hsla(${HLuz}, 90%, 40%, 0)`);
      ctx.fillStyle = gradAstro;
      ctx.beginPath(); ctx.arc(luzX, luzY, raioAstro * 1.8, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `hsl(${HLuz}, 95%, 85%)`;
      ctx.beginPath(); ctx.arc(luzX, luzY, raioAstro * 0.65, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Camadas de Cenário Distante (Montanhas, Ruínas Góticas, Floresta ou Cidade Sci-Fi)
      for (let camada = 0; camada < 2; camada++) {
        const yBase = 215 + camada * 38;
        ctx.fillStyle = `hsl(${H}, ${28 - camada * 8}%, ${11 - camada * 5}%)`;
        ctx.beginPath();
        ctx.moveTo(0, H_CANVAS);
        ctx.lineTo(0, yBase);
        for (let x = 0; x <= W; x += 20) {
          const desnivel = id === 2
            ? (x % 40 === 0 ? -int(15, 45) : 0) // Torres Sci-Fi
            : Math.sin(x * 0.03 + camada * 2 + rnd()) * int(18, 38);
          ctx.lineTo(x, yBase + desnivel);
        }
        ctx.lineTo(W, H_CANVAS);
        ctx.closePath();
        ctx.fill();

        // Silhuetas de Pinheiros (Animais), Torres/Cruzes (Mortos-Vivos) ou Pilares
        if (camada === 1) {
          for (let i = 0; i < 6; i++) {
            const tx = int(10, 310);
            if (Math.abs(tx - 160) < 65) continue; // Deixa o centro livre para o foco
            ctx.beginPath();
            if (id === 4) {
              // Árvores selvagens nas bordas
              ctx.moveTo(tx, 140 + int(0, 40));
              ctx.lineTo(tx - 18, 275);
              ctx.lineTo(tx + 18, 275);
            } else if (id === 3) {
              // Ruínas / Lápides / Grades Góticas
              ctx.rect(tx - 8, 190, 16, 85);
              ctx.moveTo(tx - 16, 205); ctx.lineTo(tx + 16, 205);
            }
            ctx.fill();
          }
        }
      }

      // Neblina atmosférica entre o fundo e o personagem
      const gradNeblina = ctx.createLinearGradient(0, 180, 0, 300);
      gradNeblina.addColorStop(0, `hsla(${HLuz}, 60%, 50%, 0)`);
      gradNeblina.addColorStop(0.6, `hsla(${HLuz}, 50%, 35%, 0.25)`);
      gradNeblina.addColorStop(1, `hsla(${H}, 60%, 6%, 0.9)`);
      ctx.fillStyle = gradNeblina;
      ctx.fillRect(0, 180, W, 140);
    }

    // =========================================================================
    // PASSO 2: BUFFER DE PERSONAGEM COM "SOLDAGEM DE SILHUETA" (OFFSCREEN)
    // =========================================================================
    const charCanvas = document.createElement('canvas');
    charCanvas.width = W;
    charCanvas.height = H_CANVAS;
    const c = charCanvas.getContext('2d');

    // Funções de escultura orgânica (fundem formas sem linhas divisórias internas!)
    const corPrimaria = `rgb(${rgbBase.join(',')})`;
    const corSecundaria = `rgb(${rgbSec.join(',')})`;
    const corOsso = '#e8dfc5';
    const corAco = '#98a9b8';
    const corOuro = '#f0b840';

    // Desenha um membro/músculo com transição de espessura orgânica (Tapered Bezier Limb)
    function membroOrganico(x1, y1, r1, cx, cy, x2, y2, r2, cor = corPrimaria) {
      const ang1 = Math.atan2(cy - y1, cx - x1) + Math.PI / 2;
      const ang2 = Math.atan2(y2 - cy, x2 - cx) + Math.PI / 2;
      c.fillStyle = cor;
      c.beginPath();
      c.arc(x1, y1, r1, 0, Math.PI * 2);
      c.arc(x2, y2, r2, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(x1 + Math.cos(ang1) * r1, y1 + Math.sin(ang1) * r1);
      c.quadraticCurveTo(cx + Math.cos(ang1) * ((r1 + r2) * 0.6), cy + Math.sin(ang1) * ((r1 + r2) * 0.6), x2 + Math.cos(ang2) * r2, y2 + Math.sin(ang2) * r2);
      c.lineTo(x2 - Math.cos(ang2) * r2, y2 - Math.sin(ang2) * r2);
      c.quadraticCurveTo(cx - Math.cos(ang1) * ((r1 + r2) * 0.6), cy - Math.sin(ang1) * ((r1 + r2) * 0.6), x1 - Math.cos(ang1) * r1, y1 - Math.sin(ang1) * r1);
      c.closePath();
      c.fill();
    }

    function poligonoCurvo(pontos, cor = corPrimaria) {
      c.fillStyle = cor;
      c.beginPath();
      c.moveTo(pontos[0][0], pontos[0][1]);
      for (let i = 1; i < pontos.length; i++) {
        const p = pontos[i];
        if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]);
        else c.lineTo(p[0], p[1]);
      }
      c.closePath();
      c.fill();
    }

    // Marca recortes de espaço negativo ou detalhes internos que o shader vai contornar
    const olhosBrilhantes = [];
    function registrarOlho(x, y, r, cor = `hsl(${HLuz}, 100%, 65%)`, ang = 0.2) {
      olhosBrilhantes.push({ x, y, r, cor, ang });
    }

    // Transformação de Câmera Dinâmica e Pose da Cena
    c.save();
    const flip = luzX < 160 ? 1 : -1; // Orienta a ação em relação à luz/câmera
    const inclinacaoCena = ['golpe-dinamico', 'bote-selvagem', 'investida-feroz'].includes(acao) ? num(-0.14, 0.14) : 0;
    const escalaCena = acao === 'colosso-horizonte' ? 1.15 : 1.0;

    c.translate(160, 175);
    c.rotate(inclinacaoCena);
    c.scale(flip * escalaCena, escalaCena);
    c.translate(-160, -175);

    // ==================== ESCULTURA DINÂMICA POR ARQUÉTIPO ====================

    // 1. ANIMAIS EM AÇÃO SELVAGEM (Bote, Uivo no Penhasco, Espreita ou Investida)
    if (id === 4) {
      if (subtipo === 'aguia' || subtipo === 'coruja') {
        // Ave de Rapina dando rasante de caça com garras estendidas à frente!
        // Asas imensas em V dinâmico
        poligonoCurvo([[145, 155], [75, 55, 10, 45], [35, 85, 22, 115], [55, 110, 42, 145], [85, 135, 75, 165], [140, 175]], corPrimaria);
        poligonoCurvo([[175, 145], [235, 45, 308, 28], [285, 75, 298, 105], [260, 105, 272, 138], [225, 132, 232, 158], [175, 168]], corPrimaria);
        // Corpo em mergulho diagonal
        membroOrganico(165, 135, 28, 155, 175, 135, 215, 18, corPrimaria);
        // Cauda aberta em leque
        poligonoCurvo([[135, 205], [85, 255], [115, 268], [145, 262], [150, 215]], corSecundaria);
        // Garras abertas prontas para agarrar a presa
        membroOrganico(148, 195, 10, 165, 225, 185, 248, 6, corOuro);
        membroOrganico(168, 192, 10, 190, 220, 212, 242, 6, corOuro);
        // Cabeça e bico adunco
        membroOrganico(168, 128, 22, 178, 125, 190, 132, 15, subtipo === 'aguia' ? '#f4f1ea' : corPrimaria);
        poligonoCurvo([[198, 124], [224, 134, 216, 152], [192, 142]], corOuro);
        registrarOlho(192, 128, 5.5, '#ffbe00', 0.25);

      } else if (['besouro', 'louva-a-deus', 'aranha'].includes(subtipo)) {
        // Inseto Gigante / Aracnídeo saindo das sombras em postura de ataque
        // Abdômen e Tórax encouraçado
        membroOrganico(95, 225, 38, 130, 195, 162, 168, 26, corPrimaria);
        membroOrganico(162, 168, 24, 180, 150, 194, 136, 20, corSecundaria);
        // Patas articuladas agressivas
        for (let p = 0; p < 4; p++) {
          const bx = 135 + p * 14, by = 185 - p * 8;
          membroOrganico(bx, by, 7, bx - 35, by - 48, bx - 68, by + 25, 3, corPrimaria);
          membroOrganico(bx + 8, by + 6, 7, bx + 48, by + 12, bx + 78, by + 72, 3, corPrimaria);
        }
        if (subtipo === 'louva-a-deus') {
          // Foices raptoriais erguidas para cortar
          membroOrganico(192, 138, 9, 238, 92, 265, 135, 12, corSecundaria);
          poligonoCurvo([[265, 135], [295, 185, 235, 215], [248, 145]], corOsso);
        } else if (subtipo === 'besouro') {
          // Chifre Hércules colossal
          poligonoCurvo([[194, 126], [255, 85, 298, 52], [268, 112, 204, 142]], corOsso);
          poligonoCurvo([[198, 144], [245, 148, 275, 122], [238, 162, 194, 156]], corOsso);
        }
        registrarOlho(202, 130, 6.5, '#ff1e42', 0.3);
        registrarOlho(190, 122, 5, '#ff1e42', 0.2);

      } else if (subtipo === 'cobra') {
        // Serpente Gigante dando o bote com bocarra escancarada e presas
        membroOrganico(65, 285, 26, 145, 265, 215, 235, 22, corPrimaria);
        membroOrganico(215, 235, 22, 115, 195, 135, 125, 18, corPrimaria);
        // Capelo de Naja
        poligonoCurvo([[115, 165], [75, 115, 118, 78], [168, 78, 178, 135], [148, 175]], corSecundaria);
        // Cabeça e Mandíbula escancarada no bote
        poligonoCurvo([[125, 92], [185, 68, 235, 88], [195, 112, 145, 112]], corPrimaria);
        poligonoCurvo([[140, 108], [195, 128, 225, 158], [175, 148, 132, 122]], corPrimaria);
        // Presas de veneno e língua
        poligonoCurvo([[212, 88], [218, 116], [204, 92]], corOsso);
        poligonoCurvo([[202, 90], [206, 112], [195, 92]], corOsso);
        registrarOlho(188, 86, 6, '#ffea00', 0.35);

      } else {
        // QUADRÚPEDES SELVAGENS (Lobo, Cachorro, Raposa, Urso, Leão, Tigre, Pantera, Touro, Cervo, Javali)
        const emBote = acao === 'bote-selvagem' || acao === 'investida-feroz';
        const uivando = acao === 'uivo-horizonte' && ['lobo', 'cachorro', 'raposa', 'leao', 'cervo'].includes(subtipo);

        // Cauda dinâmica
        if (['lobo', 'cachorro', 'raposa'].includes(subtipo)) {
          membroOrganico(88, 212, 14, 42, 185, 22, 215, 20, corPrimaria);
        } else if (['leao', 'tigre', 'pantera'].includes(subtipo)) {
          membroOrganico(85, 205, 9, 35, 175, 28, 135, 7, corPrimaria);
        }

        // Patas Traseiras impulsionando no chão ou na rocha
        membroOrganico(98, 208, 26, 78, 248, 62, 292, 10, `rgb(${rgbSombra.join(',')})`);
        membroOrganico(112, 208, 28, 96, 252, 88, 294, 11, corPrimaria);

        // Torso Muscular (Caixa torácica potente inclinada na ação)
        const toraxX = emBote ? 192 : 176;
        const toraxY = emBote ? 158 : uivando ? 168 : 182;
        const raioTorax = ['urso', 'touro', 'leao'].includes(subtipo) ? 44 : 34;
        membroOrganico(104, 210, 28, 145, 195, toraxX, toraxY, raioTorax, corPrimaria);

        // Juba de Leão ou Cupim de Touro/Urso
        if (subtipo === 'leao') {
          poligonoCurvo([[145, 125], [185, 85, 232, 112], [248, 165, 212, 218], [158, 215, 135, 175]], '#3b1d0b');
        }

        // Patas Dianteiras (Lançadas à frente com garras no bote, ou fincadas na rocha)
        if (emBote) {
          membroOrganico(toraxX + 8, toraxY + 10, 18, 248, 148, 288, 172, 12, `rgb(${rgbSombra.join(',')})`);
          membroOrganico(toraxX - 4, toraxY + 18, 20, 242, 182, 282, 208, 13, corPrimaria);
          // Garras afiadas rasgando o ar
          for (let g = 0; g < 3; g++) {
            poligonoCurvo([[282, 198 + g * 8], [306, 204 + g * 10], [280, 205 + g * 8]], corOsso);
          }
        } else {
          membroOrganico(toraxX + 10, toraxY + 18, 18, 198, 242, 206, 292, 10, `rgb(${rgbSombra.join(',')})`);
          membroOrganico(toraxX - 6, toraxY + 20, 20, 174, 245, 178, 294, 11, corPrimaria);
        }

        // Pescoço, Cabeça, Focinho e Orelhas/Chifres
        const cabX = uivando ? 196 : emBote ? 226 : 212;
        const cabY = uivando ? 98 : emBote ? 118 : 134;
        membroOrganico(toraxX, toraxY - 8, raioTorax * 0.75, (toraxX + cabX) / 2, (toraxY + cabY) / 2, cabX, cabY, 26, corPrimaria);

        // Chifres (Touro / Cervo) ou Orelhas
        if (subtipo === 'touro') {
          poligonoCurvo([[cabX - 8, cabY - 14], [cabX + 25, cabY - 58, cabX + 68, cabY - 32], [cabX + 28, cabY - 22, cabX + 6, cabY - 4]], corOsso);
        } else if (subtipo === 'cervo') {
          membroOrganico(cabX - 6, cabY - 18, 5, cabX - 38, cabY - 58, cabX - 62, cabY - 92, 2, corOsso);
          membroOrganico(cabX - 28, cabY - 48, 4, cabX - 12, cabY - 72, cabX - 8, cabY - 95, 2, corOsso);
          membroOrganico(cabX - 42, cabY - 65, 3, cabX - 32, cabY - 85, cabX - 35, cabY - 102, 2, corOsso);
        } else if (subtipo === 'urso') {
          c.beginPath(); c.arc(cabX - 14, cabY - 22, 11, 0, Math.PI * 2); c.fill();
        } else {
          poligonoCurvo([[cabX - 18, cabY - 12], [cabX - 32, cabY - 52], [cabX + 2, cabY - 20]], corPrimaria);
          poligonoCurvo([[cabX - 6, cabY - 14], [cabX - 14, cabY - 50], [cabX + 12, cabY - 18]], corPrimaria);
        }

        // Focinho Esculpido (Fechado ou Escancarado rugindo/uivando)
        const angFocinho = uivando ? -0.65 : 0.08;
        c.save();
        c.translate(cabX, cabY);
        c.rotate(angFocinho);
        // Maxilar superior
        poligonoCurvo([[0, -18], [44, -14, 52, 4], [22, 10, 0, 8]], corPrimaria);
        // Mandíbula inferior aberta com presas!
        if (emBote || uivando || ['lobo', 'leao', 'tigre', 'urso', 'pantera'].includes(subtipo)) {
          poligonoCurvo([[2, 6], [36, 18, 44, 30], [12, 26, -4, 14]], corPrimaria);
          poligonoCurvo([[38, 2], [41, 16], [32, 4]], corOsso);
          poligonoCurvo([[34, 24], [38, 12], [28, 22]], corOsso);
        }
        if (subtipo === 'javali') {
          poligonoCurvo([[36, 8], [58, -8, 48, -26], [42, -4, 28, 8]], corOsso);
        }
        c.restore();

        registrarOlho(cabX + 12, cabY - 6 + (uivando ? -8 : 0), 5.5, '#ffbe00', 0.25);
      }
    }

    // 2. MONSTROS, DRAGÕES, DEMÔNIOS E TITÃS EM CENA DE COMBATE
    else if (id === 1 || subtipo === 'dragao-zumbi') {
      if (subtipo === 'dragao' || subtipo === 'dragao-zumbi' || subtipo === 'hidra') {
        // Dragão empoleirado/voando com Asas de Espaço Negativo (Imagem 2) cuspindo fogo/energia!
        // Grande Asa Traseira com recortes agressivos
        poligonoCurvo([[135, 165], [65, 45, 5, 22], [35, 68, 12, 112], [58, 102, 38, 148], [88, 138, 78, 178], [135, 185]], corSecundaria);
        membroOrganico(135, 155, 12, 75, 65, 8, 24, 5, corPrimaria);
        // Cauda chicoteando com espinhos
        membroOrganico(115, 245, 26, 55, 275, 18, 215, 6, corPrimaria);
        // Corpo e Pescoço Serpentino em S
        membroOrganico(115, 255, 36, 145, 205, 148, 145, 28, corPrimaria);
        membroOrganico(148, 145, 24, 122, 98, 172, 72, 20, corPrimaria);
        // Espinhos dorsais
        for (let s = 0; s < 5; s++) {
          poligonoCurvo([[125 - s * 4, 135 - s * 14], [98 - s * 5, 125 - s * 15], [132 - s * 3, 122 - s * 14]], corOsso);
        }
        // Chifres Dracônicos longos para trás (Imagem 2)
        poligonoCurvo([[168, 62], [115, 28, 78, 12], [125, 48, 162, 76]], corOsso);
        poligonoCurvo([[162, 72], [118, 52, 92, 42], [128, 66, 158, 84]], corOsso);
        // Mandíbula Dracônica escancarada cuspindo sopro elemental!
        poligonoCurvo([[165, 56], [218, 54, 246, 76], [202, 86, 165, 82]], corPrimaria);
        poligonoCurvo([[165, 78], [208, 98, 232, 124], [188, 112, 158, 92]], corPrimaria);
        // Segunda e terceira cabeça se for Hidra
        if (subtipo === 'hidra') {
          membroOrganico(142, 168, 18, 185, 125, 224, 118, 15, corPrimaria);
          poligonoCurvo([[218, 106], [262, 108], [254, 132], [218, 126]], corPrimaria);
          registrarOlho(236, 114, 4.5, '#ffea00', 0.2);
        }
        registrarOlho(196, 68, 6.5, subtipo === 'dragao-zumbi' ? '#00ffaa' : '#ffea00', 0.3);

      } else if (subtipo === 'slime') {
        // Slime Colossal em Onda Ácida engolindo espadas e crânios
        poligonoCurvo([[35, 288], [15, 215, 68, 165], [55, 95, 145, 78], [235, 65, 265, 155], [305, 195, 285, 288]], corPrimaria);
        // Tentáculos/Pseudópodes ácidos atacando
        membroOrganico(225, 145, 22, 268, 95, 302, 118, 12, corPrimaria);
        membroOrganico(85, 155, 18, 38, 112, 18, 138, 10, corPrimaria);
        // Olhos flutuando assimetricamente dentro da massa
        registrarOlho(135, 138, 11, `hsl(${HLuz}, 100%, 70%)`, 0.1);
        registrarOlho(195, 125, 14, `hsl(${HLuz}, 100%, 70%)`, -0.2);
        registrarOlho(168, 168, 8, `hsl(${HLuz}, 100%, 70%)`, 0);

      } else {
        // BRUTAMONTES EM AÇÃO (Orc, Minotauro, Demônio [Imagem 3], Ciclope, Golem, Lobisomem, Goblin)
        const escalaBruto = subtipo === 'goblin' ? 0.78 : 1.05;
        c.translate(160, 260); c.scale(escalaBruto, escalaBruto); c.translate(-160, -260);

        if (subtipo === 'demonio' || subtipo === 'minotauro') {
          poligonoCurvo([[125, 145], [55, 65, 8, 85], [42, 118, 28, 158], [72, 148, 118, 182]], corSecundaria);
          poligonoCurvo([[195, 145], [265, 65, 312, 85], [278, 118, 292, 158], [248, 148, 202, 182]], corSecundaria);
        }

        // Pernas pesadas em base de combate
        membroOrganico(125, 218, 26, 98, 255, 92, 295, 16, `rgb(${rgbSombra.join(',')})`);
        membroOrganico(192, 218, 26, 218, 255, 228, 295, 16, corPrimaria);

        // Torso Colossal em V (Proporção Imagem 3)
        poligonoCurvo([[92, 132], [160, 112, 228, 132], [212, 208, 188, 238], [160, 248, 132, 238], [108, 208, 92, 132]], corPrimaria);
        // Placas peitorais e abdominais (Imagem 3)
        poligonoCurvo([[104, 142], [160, 134, 216, 142], [206, 188, 160, 182], [114, 188, 104, 142]], corSecundaria);

        // Braço Esquerdo e Braço Direito erguido desferindo golpe!
        membroOrganico(102, 142, 24, 54, 178, 42, 228, 20, corPrimaria);
        membroOrganico(218, 142, 26, 268, 108, 252, 54, 22, corPrimaria);

        // Clava / Machado Gigante na mão erguida (ou Garras Gigantes)
        if (['orc', 'minotauro', 'ciclope', 'goblin'].includes(subtipo)) {
          membroOrganico(252, 54, 8, 195, 32, 128, 14, 12, '#4a2c16');
          poligonoCurvo([[165, 6], [118, -12, 96, 38], [148, 58, 182, 24]], corAco);
        } else {
          // Garras monstruosas (Imagem 3)
          for (let g = 0; g < 3; g++) poligonoCurvo([[32 + g * 10, 228], [24 + g * 10, 262], [44 + g * 10, 232]], corSecundaria);
        }

        // Chifres Segmentados Imensos (Imagem 3) ou Orelhas de Lobisomem/Goblin
        if (['minotauro', 'demonio', 'orc'].includes(subtipo)) {
          poligonoCurvo([[132, 92], [68, 78, 62, 18], [92, 52, 142, 78]], corOsso);
          poligonoCurvo([[188, 92], [252, 78, 258, 18], [228, 52, 178, 78]], corOsso);
        } else if (subtipo === 'goblin' || subtipo === 'lobisomem') {
          poligonoCurvo([[125, 98], [58, 68], [118, 118]], corPrimaria);
          poligonoCurvo([[195, 98], [262, 68], [202, 118]], corPrimaria);
        }

        // Cabeça afundada entre os trapézios (Estilo Imagem 3)
        membroOrganico(160, 108, 34, 160, 118, 160, 134, 28, corPrimaria);
        // Presas inferiores salientes
        poligonoCurvo([[138, 136], [144, 114], [152, 136]], corOsso);
        poligonoCurvo([[182, 136], [176, 114], [168, 136]], corOsso);

        if (subtipo === 'ciclope') {
          registrarOlho(160, 102, 14, '#ffbe00', 0);
        } else {
          registrarOlho(144, 104, 7, '#ffbe00', 0.25);
          registrarOlho(176, 104, 7, '#ffbe00', -0.25);
          if (subtipo === 'minotauro' || subtipo === 'demonio') registrarOlho(160, 76, 8, '#ffbe00', 0);
        }
      }
    }

    // 3. HUMANOS, MORTOS-VIVOS E ALIENS EM CENA DE COMBATE / CONJURAÇÃO
    else {
      const corPele = id === 3 ? corOsso : id === 2 ? corPrimaria : esc(['#eab892', '#c98c63', '#7d4e34']);

      // Capa rasgada / Manto esvoaçando dramaticamente no vento
      if (subtipo !== 'robo' && subtipo !== 'drone') {
        poligonoCurvo([[135, 138], [58, 168, 12, 268], [65, 258, 92, 285], [135, 255, 165, 225]], corSecundaria);
      }

      if (subtipo === 'drone' || subtipo === 'cosmico') {
        // Entidade Cósmica / Sonda Orbital Flutuante com Tentáculos/Garras
        for (let t = 0; t < 6; t++) {
          const ang = (t / 6) * Math.PI * 2;
          membroOrganico(160, 145, 18, 160 + Math.cos(ang) * 65, 145 + Math.sin(ang) * 65, 160 + Math.cos(ang + 0.5) * 115, 145 + Math.sin(ang + 0.5) * 115, 4, corSecundaria);
        }
        c.fillStyle = corPrimaria;
        c.beginPath(); c.arc(160, 145, 46, 0, Math.PI * 2); c.fill();
        registrarOlho(160, 145, 18, `hsl(${HLuz}, 100%, 65%)`, 0);
        if (subtipo === 'cosmico') {
          registrarOlho(132, 122, 8, `hsl(${HLuz}, 100%, 65%)`, 0.2);
          registrarOlho(188, 122, 8, `hsl(${HLuz}, 100%, 65%)`, -0.2);
        }
      } else {
        // Corpo em Postura Dinâmica de Ação (Avanço de Combate / Conjuração)
        // Pernas ou Cauda Espectral (Fantasma/Ceifador)
        if (subtipo === 'fantasma' || subtipo === 'ceifador') {
          poligonoCurvo([[125, 195], [95, 255, 65, 298], [135, 275, 168, 298], [198, 255, 195, 195]], corPrimaria);
        } else {
          membroOrganico(142, 208, 18, 118, 252, 102, 295, 11, `rgb(${rgbSombra.join(',')})`);
          membroOrganico(176, 208, 18, 204, 248, 218, 295, 12, corPrimaria);
        }

        // Tronco e Ombreiras (Pauldrons de Cavaleiro/Mecha/Lich)
        poligonoCurvo([[122, 134], [160, 124, 198, 134], [188, 214], [132, 214]], corPrimaria);
        if (['guerreiro', 'paladino', 'robo', 'lich', 'predador'].includes(subtipo)) {
          poligonoCurvo([[128, 136], [86, 118, 78, 158], [122, 166]], corAco);
          poligonoCurvo([[192, 136], [234, 118, 242, 158], [198, 166]], corAco);
        }

        // Braços e ARMAS EM AÇÃO (Cortando, Atirando, Ceifando ou Conjurando)
        membroOrganico(128, 146, 13, 96, 178, 108, 205, 10, corPele);
        membroOrganico(192, 146, 14, 232, 128, 256, 98, 11, corPele);

        if (['guerreiro', 'paladino', 'barbaro', 'esqueleto', 'assassino'].includes(subtipo)) {
          // Espada / Machado rasgando o ar diagonalmente
          poligonoCurvo([[248, 104], [298, 18, 312, 8], [284, 52, 260, 112]], corAco);
          poligonoCurvo([[234, 92], [274, 118], [268, 126], [228, 100]], corOuro);
          if (subtipo === 'paladino' || subtipo === 'guerreiro') {
            // Escudo erguido na frente
            poligonoCurvo([[82, 152], [132, 144], [126, 218, 104, 238], [82, 218, 82, 152]], corSecundaria);
          }
        } else if (subtipo === 'ceifador') {
          // Foice Gigante da Morte cruzando a tela inteira
          membroOrganico(92, 268, 5, 180, 150, 265, 42, 5, '#3b2313');
          poligonoCurvo([[265, 42], [165, 8, 88, 68], [168, 42, 254, 64]], corAco);
        } else if (subtipo === 'arqueiro') {
          // Arco curvado tensionado
          poligonoCurvo([[238, 52], [288, 118, 238, 188], [272, 118, 238, 52]], corOuro);
        } else if (['mago', 'necromante', 'lich', 'monge'].includes(subtipo)) {
          // Cajado Arcano erguido canalizando feitiço
          membroOrganico(242, 198, 5, 252, 120, 262, 42, 6, corOuro);
          c.fillStyle = corSecundaria;
          c.beginPath(); c.arc(262, 38, 16, 0, Math.PI * 2); c.fill();
        }

        // Cabeça, Capuz, Elmo ou Crânio
        membroOrganico(160, 128, 14, 162, 108, 164, 92, 24, corPele);
        if (['mago', 'necromante', 'assassino', 'ceifador', 'fantasma', 'arqueiro'].includes(subtipo)) {
          // Capuz pontiagudo dramático
          poligonoCurvo([[132, 118], [122, 58, 158, 42], [198, 58, 196, 118], [164, 88]], corPrimaria);
        } else if (subtipo === 'lich' || subtipo === 'paladino') {
          // Coroa de Espinhos / Crista Real
          poligonoCurvo([[138, 78], [142, 42], [156, 66], [166, 34], [176, 66], [190, 42], [192, 78]], corOuro);
        }

        registrarOlho(156, 92, 4.5, `hsl(${HLuz}, 100%, 68%)`, 0.15);
        registrarOlho(176, 92, 4.5, `hsl(${HLuz}, 100%, 68%)`, -0.15);
      }
    }
    c.restore();

    // =========================================================================
    // PASSO 3: SHADER DE PÓS-PROCESSAMENTO DE PIXELS (SOLDAGEM + NANQUIM + RIM LIGHT)
    // =========================================================================
    const imgData = c.getImageData(0, 0, W, H_CANVAS);
    const src = new Uint8ClampedArray(imgData.data);
    const dst = imgData.data;

    const dirLuzX = luzX < 160 ? -1 : 1;

    for (let y = 3; y < H_CANVAS - 3; y++) {
      for (let x = 3; x < W - 3; x++) {
        const idx = (y * W + x) * 4;
        const alpha = src[idx + 3];

        if (alpha < 128) {
          // Se o pixel é transparente, verifica se está na borda da silhueta para criar o CONTORNO PESADO DE NANQUIM (Estilo Imagem 3)
          let vizinhoOpaco = false;
          for (let dy = -3; dy <= 3 && !vizinhoOpaco; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              if (dx * dx + dy * dy <= 10) {
                const nIdx = ((y + dy) * W + (x + dx)) * 4;
                if (src[nIdx + 3] >= 128) { vizinhoOpaco = true; break; }
              }
            }
          }
          if (vizinhoOpaco) {
            dst[idx] = 7; dst[idx + 1] = 9; dst[idx + 2] = 14; dst[idx + 3] = 255;
          }
        } else {
          // Pixel DENTRO da criatura: calcula iluminação direcional (Rim-Light), Cel-Shading e Hachuras de Gravura!
          const checkLuzIdx = ((y - 3) * W + (x + dirLuzX * 3)) * 4;
          const checkSombraIdx = ((y + 3) * W + (x - dirLuzX * 3)) * 4;

          // Detecção de borda interna entre cores diferentes (Line-Art interno)
          const diffCor = Math.abs(src[idx] - src[checkLuzIdx]) + Math.abs(src[idx + 1] - src[checkLuzIdx + 1]);

          if (src[checkLuzIdx + 3] < 128) {
            // Borda voltada para a luz/magia -> RIM LIGHT DRAMÁTICO!
            dst[idx] = Math.min(255, (src[idx] * 0.35 + rgbLuz[0] * 0.85));
            dst[idx + 1] = Math.min(255, (src[idx + 1] * 0.35 + rgbLuz[1] * 0.85));
            dst[idx + 2] = Math.min(255, (src[idx + 2] * 0.35 + rgbLuz[2] * 0.85));
          } else if (diffCor > 55) {
            // Contorno interno de armadura/músculo
            dst[idx] = 10; dst[idx + 1] = 13; dst[idx + 2] = 18;
          } else if (src[checkSombraIdx + 3] < 128 || (x * dirLuzX < 155 * dirLuzX && (x + y) % 6 < 2)) {
            // Sombra profunda Cel-Shaded + Hachura de Nanquim (Inspirado na Imagem 1 e 2)
            const fatorHachura = ((x - y) % 5 === 0) ? 0.22 : 0.58;
            dst[idx] = src[idx] * fatorHachura;
            dst[idx + 1] = src[idx + 1] * fatorHachura;
            dst[idx + 2] = src[idx + 2] * fatorHachura;
          }
        }
      }
    }
    c.putImageData(imgData, 0, 0);

    // Transfere o personagem processado para a tela principal da carta
    ctx.drawImage(charCanvas, 0, 0);

    // Desenha os Olhos Brilhantes com Glow (Bloom) por cima do personagem
    olhosBrilhantes.forEach(({ x, y, r, cor }) => {
      const realX = flip === 1 ? x : W - x;
      ctx.save();
      ctx.shadowColor = cor;
      ctx.shadowBlur = 14;
      ctx.fillStyle = cor;
      ctx.beginPath();
      ctx.arc(realX, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(realX, y, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // =========================================================================
    // PASSO 4: EFEITOS DE PRIMEIRO PLANO (MAGIA, SOPRO DE FOGO, GOLPES E PARTÍCULAS)
    // =========================================================================
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (['golpe-dinamico', 'ceifa-fatal', 'bote-selvagem', 'furia-berserk'].includes(acao)) {
      // Arco de Corte Luminoso / Rastro de Garras rasgando a frente da carta!
      const qtdCortes = id === 4 || id === 1 ? 3 : 1;
      for (let k = 0; k < qtdCortes; k++) {
        const offset = (k - 1) * 24;
        ctx.strokeStyle = `hsla(${HLuz}, 100%, 68%, 0.85)`;
        ctx.lineWidth = 10 - k * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(35, 55 + offset);
        ctx.quadraticCurveTo(185, 135 + offset, 295, 255 + offset);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else if (['sopro-energia', 'conjuracao', 'feixe-orbital', 'ritual-necromantico'].includes(acao)) {
      // Torrente de Fogo / Feixe Arcano / Energia Necromântica iluminando a tela
      const startX = flip === 1 ? 215 : 105;
      const endX = flip === 1 ? 320 : 0;
      const gradFeixe = ctx.createLinearGradient(startX, 95, endX, 245);
      gradFeixe.addColorStop(0, '#ffffff');
      gradFeixe.addColorStop(0.3, `hsla(${HLuz}, 100%, 62%, 0.9)`);
      gradFeixe.addColorStop(1, `hsla(${HLuz}, 100%, 45%, 0)`);

      ctx.fillStyle = gradFeixe;
      ctx.beginPath();
      ctx.moveTo(startX, 92);
      ctx.lineTo(endX, 165);
      ctx.lineTo(endX, 285);
      ctx.closePath();
      ctx.fill();
    }

    // Brasas, Faíscas, Folhas ou Partículas de Energia subindo na frente
    for (let p = 0; p < 28; p++) {
      const px = int(10, 310), py = int(15, 305), pr = num(1, 3.8);
      ctx.fillStyle = p % 3 === 0 ? '#ffffff' : `hsla(${HLuz}, 100%, 65%, ${num(0.35, 0.85)})`;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Vinheta Cinematográfica nas bordas da carta (enquadramento estilo pintura MTG)
    if (fundo) {
      const vinheta = ctx.createRadialGradient(160, 155, 105, 160, 160, 225);
      vinheta.addColorStop(0, 'rgba(0,0,0,0)');
      vinheta.addColorStop(1, 'rgba(3,5,9,0.78)');
      ctx.fillStyle = vinheta;
      ctx.fillRect(0, 0, W, H_CANVAS);
    }

    return canvas;
  }

  /** Mantém compatibilidade com o botão de download SVG do index.html */
  function gerarSVG(tipo, opcoes) {
    const canvas = renderizarCenaCanvas(tipo, opcoes);
    const dataUrl = canvas.toDataURL('image/png');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320"><image width="320" height="320" href="${dataUrl}"/></svg>`;
  }

  /** Retorna HTMLImageElement pronto para ser exibido na galeria do jogo */
  function gerarCriatura(tipo, opcoes) {
    const canvas = renderizarCenaCanvas(tipo, opcoes);
    const imagem = new Image();
    imagem.alt = 'Arte de carta procedural: ' + tipo;
    imagem.width = 320;
    imagem.height = 320;
    imagem.style.cssText = 'display:block;width:100%;height:auto;object-fit:contain';
    imagem.src = canvas.toDataURL('image/png');
    return imagem;
  }

  const api = { gerarCriatura, gerarSVG, renderizarCenaCanvas, TIPOS, SUBTIPOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(raiz, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);