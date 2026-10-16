import { Carta } from "../Carta";
import { CartaCriatura } from "../CartaCriatura";
import { Deck } from "../Deck";
import { Jogador } from "../Jogador";
import { Partida } from "../Partida";
import { Coluna, Linha, Posicao } from "../Tabuleiro";
import { TiposEventos } from "../tiposEventos";
import { decksParaTeste } from "../montagemCriaturasDecks";
import { BotSimples } from "./BotSimples";

type ChaveDeck = keyof typeof decksParaTeste;
type Iniciativa = "aleatoria" | "humano" | "bot";
type FaseInterface = "setup" | "mulligan" | "jogo";
type LadoVisual = "humano" | "bot";
type TipoAtaqueVisual = CartaCriatura["tipoAtaque"];
type TipoFeedback = "neutro" | "ataque" | "ataque-direto" | "destruicao" | "impedido" | "fim";


type OpcoesGeradorSVG = {
    seed?: string;
    fundo?: boolean;
    subtipo?: string;
    genero?: "M" | "F";
};

type GeradorSVG = (tipo: string, opcoes?: OpcoesGeradorSVG) => string;

type ConfiguracaoArteCriatura = {
    tipo: "Humanos" | "Monstros" | "Alien" | "Mortos-Vivos" | "Animais";
    subtipo: string;
    seed: string;
    genero?: "M" | "F";
};

type GlobalComGerador = typeof globalThis & {
    gerarSVG?: GeradorSVG;
};

/**
 * A arte é uma preocupação exclusiva da interface de playtest.
 * O domínio continua sem saber nada sobre SVG, seed ou família visual.
 *
 * A chave é o nome normalizado porque a Criatura em campo não carrega o id
 * da CartaCriatura que a originou. Para as 40 cartas atuais isso é estável e
 * faz a mesma carta usar a mesma imagem na mão e no tabuleiro.
 */
const CONFIGURACOES_ARTE: Record<string, ConfiguracaoArteCriatura> = {
    "aranha filhote":       { tipo: "Animais",      subtipo: "aranha",          seed: "tcg-card-001" },
    "servo":                 { tipo: "Mortos-Vivos", subtipo: "zumbi",           seed: "tcg-card-002" },
    "barreira magica":       { tipo: "Alien",        subtipo: "cristalino",      seed: "tcg-card-003" },
    "guerreiro":             { tipo: "Humanos",      subtipo: "guerreiro",       seed: "tcg-card-004", genero: "M" },
    "golem menor":           { tipo: "Monstros",     subtipo: "golem",           seed: "tcg-card-005" },
    "goblin":                { tipo: "Monstros",     subtipo: "goblin",          seed: "tcg-card-006" },
    "arqueiro":              { tipo: "Humanos",      subtipo: "arqueiro",        seed: "tcg-card-007", genero: "M" },
    "besteiro":              { tipo: "Humanos",      subtipo: "arqueiro",        seed: "tcg-card-008", genero: "M" },
    "mago aprendiz":         { tipo: "Humanos",      subtipo: "mago",            seed: "tcg-card-009", genero: "M" },
    "lich enfraquecido":     { tipo: "Mortos-Vivos", subtipo: "lich",            seed: "tcg-card-010" },

    "guerreiro armadurado":  { tipo: "Humanos",      subtipo: "guerreiro",       seed: "tcg-card-011", genero: "M" },
    "golem medio":           { tipo: "Monstros",     subtipo: "golem",           seed: "tcg-card-012" },
    "goblin guerreiro":      { tipo: "Monstros",     subtipo: "goblin",          seed: "tcg-card-013" },
    "arqueiro treinado":     { tipo: "Humanos",      subtipo: "arqueiro",        seed: "tcg-card-014", genero: "M" },
    "besteiro pesado":       { tipo: "Humanos",      subtipo: "arqueiro",        seed: "tcg-card-015", genero: "M" },
    "monge":                 { tipo: "Humanos",      subtipo: "monge",           seed: "tcg-card-016", genero: "M" },
    "feiticeiro":            { tipo: "Humanos",      subtipo: "necromante",      seed: "tcg-card-017", genero: "M" },

    "aranha alien":          { tipo: "Alien",        subtipo: "robo-aracnideo",  seed: "tcg-card-018" },
    "urso":                  { tipo: "Animais",      subtipo: "urso",            seed: "tcg-card-019" },
    "muralha viva":          { tipo: "Monstros",     subtipo: "golem",           seed: "tcg-card-020" },
    "barbaro da pedra":      { tipo: "Humanos",      subtipo: "barbaro",         seed: "tcg-card-021", genero: "M" },
    "tripod":                { tipo: "Alien",        subtipo: "sentinela",       seed: "tcg-card-022" },
    "dragao zumbi":          { tipo: "Mortos-Vivos", subtipo: "dragao-zumbi",    seed: "tcg-card-023" },
    "muminho":               { tipo: "Mortos-Vivos", subtipo: "mumia",           seed: "tcg-card-024" },
    "mumia":                 { tipo: "Mortos-Vivos", subtipo: "mumia",           seed: "tcg-card-024" },

    "cacador alien":         { tipo: "Alien",        subtipo: "predador",        seed: "tcg-card-025" },
    "tigre":                 { tipo: "Animais",      subtipo: "tigre",           seed: "tcg-card-026" },
    "colosso":               { tipo: "Monstros",     subtipo: "ciclope",         seed: "tcg-card-027" },
    "canhao cerrado":        { tipo: "Alien",        subtipo: "mecha",           seed: "tcg-card-028" },
    "tubarao voador":        { tipo: "Alien",        subtipo: "aquatico",        seed: "tcg-card-029" },
    "dragao":                { tipo: "Monstros",     subtipo: "dragao",          seed: "tcg-card-030" },
    "alien tecnomante":      { tipo: "Alien",        subtipo: "tecnologico",     seed: "tcg-card-031" },

    "slime gigante":         { tipo: "Monstros",     subtipo: "slime",           seed: "tcg-card-032" },
    "fantasma":              { tipo: "Mortos-Vivos", subtipo: "fantasma",        seed: "tcg-card-033" },
    "golem de concreto":     { tipo: "Monstros",     subtipo: "golem",           seed: "tcg-card-034" },
    "cospe acido":           { tipo: "Alien",        subtipo: "reptiliano",      seed: "tcg-card-035" },
    "mago supremo":          { tipo: "Humanos",      subtipo: "mago",            seed: "tcg-card-036", genero: "M" },

    "aranha primordial":     { tipo: "Animais",      subtipo: "aranha",          seed: "tcg-card-037" },
    "primeiro mago":         { tipo: "Humanos",      subtipo: "mago",            seed: "tcg-card-038", genero: "M" },
    "guerreiro lendario":    { tipo: "Humanos",      subtipo: "paladino",        seed: "tcg-card-039", genero: "M" },
    "montanha viva":         { tipo: "Monstros",     subtipo: "golem",           seed: "tcg-card-040" }
};

let gerarSVGProcedural: GeradorSVG | null = null;
const cacheUrlArte = new Map<string, string>();
const avisosArteDesconhecida = new Set<string>();

const DURACAO_MELEE_MS = 440;
const DURACAO_DISTANCIA_MS = 460;
const DURACAO_MAGIA_MS = 540;
const DURACAO_IMPACTO_MS = 300;
const PAUSA_ENTRE_EVENTOS_MS = 210;
const PAUSA_ACOES_BOT_MS = 520;
const LIMITE_HISTORICO_VISUAL = 90;
const MOVIMENTO_REDUZIDO = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const appEncontrado = document.querySelector<HTMLDivElement>("#app");
if (appEncontrado === null) {
    throw new Error("Elemento #app não encontrado.");
}
const app: HTMLDivElement = appEncontrado;

let faseInterface: FaseInterface = "setup";
let partida: Partida | null = null;
let humano: Jogador | null = null;
let botJogador: Jogador | null = null;
let bot: BotSimples | null = null;
let indiceCartaSelecionada: number | null = null;
let modoSacrificioCampo = false;
let processando = false;
let ajudaAberta = false;
let mensagemInterface = "";
let historico: string[] = [];

void inicializarInterface();

async function inicializarInterface(): Promise<void> {
    await carregarGeradorSVG();
    renderizar();
}

async function carregarGeradorSVG(): Promise<void> {
    try {
        // O gerador atual é JavaScript legado/IIFE. Importamos apenas pelo efeito
        // colateral; ele publica gerarSVG em globalThis no navegador.
        // @ts-ignore arquivo JS temporário sem arquivo de declaração TypeScript.
        await import("./criaturas.js");

        const api = (globalThis as GlobalComGerador).gerarSVG;
        if (typeof api === "function") {
            gerarSVGProcedural = api;
        } else {
            console.warn("[TCG] criaturas.js carregou, mas gerarSVG não foi encontrado.");
        }
    } catch (erro) {
        console.warn("[TCG] Não foi possível carregar o gerador SVG. A interface seguirá com placeholders.", erro);
    }
}

function renderizar(): void {
    if (faseInterface === "setup") {
        renderizarSetup();
        return;
    }

    if (faseInterface === "mulligan") {
        renderizarMulligan();
        return;
    }

    renderizarJogo();
}

function renderizarSetup(): void {
    const opcoesDeck = Object.entries(decksParaTeste)
        .map(([chave, deck]) => `<option value="${chave}">${escaparHtml(deck.nome)} · ${deck.tamanhoDeck()} cartas</option>`)
        .join("");

    app.innerHTML = `
        <main class="setup-shell">
            <section class="setup-card panel">
                <div class="setup-brand-row">
                    <div>
                        <span class="product-badge">PLAYTEST</span>
                        <span class="build-label">TCG · Protótipo jogável</span>
                    </div>
                    <span class="setup-status"><i></i> Online no navegador</span>
                </div>

                <div class="setup-hero">
                    <p class="eyebrow">Prepare seu confronto</p>
                    <h1>Entre na arena.</h1>
                    <p class="setup-copy">
                        Escolha seu deck, defina o adversário e jogue uma partida completa.
                        Não precisa conhecer outros TCGs: as regras essenciais estão explicadas aqui.
                    </p>
                </div>

                <div class="setup-steps" aria-label="Como iniciar">
                    <div class="setup-step"><b>1</b><span><strong>Escolha seu deck</strong><small>Seu estilo para esta partida.</small></span></div>
                    <div class="setup-step"><b>2</b><span><strong>Escolha o oponente</strong><small>Use outro deck para comparar estratégias.</small></span></div>
                    <div class="setup-step"><b>3</b><span><strong>Jogue e observe</strong><small>O combate é resolvido automaticamente.</small></span></div>
                </div>

                <div class="setup-grid">
                    <label class="field-card">
                        <span class="field-label">Seu deck</span>
                        <select id="deck-humano">${opcoesDeck}</select>
                        <small>As cartas deste deck formarão sua mão e seu baralho.</small>
                    </label>

                    <label class="field-card">
                        <span class="field-label">Deck do oponente</span>
                        <select id="deck-bot">${opcoesDeck}</select>
                        <small>O oponente será controlado automaticamente.</small>
                    </label>

                    <label class="field-card">
                        <span class="field-label">Quem joga primeiro?</span>
                        <select id="iniciativa">
                            <option value="aleatoria">Sortear automaticamente</option>
                            <option value="humano">Eu começo</option>
                            <option value="bot">Oponente começa</option>
                        </select>
                        <small>O primeiro turno não pode causar dano direto ao jogador.</small>
                    </label>
                </div>

                <div class="setup-actions">
                    <button id="iniciar-partida" class="btn btn-primary btn-large">
                        <span>Iniciar partida</span><span aria-hidden="true">→</span>
                    </button>
                </div>

                <details class="rules-card">
                    <summary>Como funciona esta versão?</summary>
                    <div class="rules-content">
                        <div class="rule-item"><b>01</b><p><strong>Jogue criaturas.</strong> Selecione uma carta da mão e depois uma casa vazia do seu campo.</p></div>
                        <div class="rule-item"><b>02</b><p><strong>Posicione corretamente.</strong> Corpo a corpo ataca da frente; distância ataca do fundo; magia funciona nas duas linhas.</p></div>
                        <div class="rule-item"><b>03</b><p><strong>Use o sacrifício.</strong> Uma vez por turno, sacrifique para gerar mana extra e antecipar jogadas.</p></div>
                        <div class="rule-item"><b>04</b><p><strong>Encerre o turno.</strong> O combate acontece sozinho, seguindo a ordem e os alvos definidos pelas regras.</p></div>
                    </div>
                    <div class="type-legend">
                        ${htmlLegendaTipo("corpo-a-corpo")}
                        ${htmlLegendaTipo("distancia")}
                        ${htmlLegendaTipo("magico")}
                    </div>
                </details>
            </section>
        </main>
    `;

    const selectHumano = obterElemento<HTMLSelectElement>("deck-humano");
    const selectBot = obterElemento<HTMLSelectElement>("deck-bot");

    // Evita começar, por padrão, em mirror match sem impedir que o usuário escolha um.
    const chaves = Object.keys(decksParaTeste) as ChaveDeck[];
    if (chaves.length > 1) {
        selectBot.value = chaves[1];
    }

    obterElemento<HTMLButtonElement>("iniciar-partida").addEventListener("click", () => {
        const chaveHumano = selectHumano.value as ChaveDeck;
        const chaveBot = selectBot.value as ChaveDeck;
        const iniciativa = obterElemento<HTMLSelectElement>("iniciativa").value as Iniciativa;
        prepararPartida(chaveHumano, chaveBot, iniciativa);
    });
}

function prepararPartida(chaveHumano: ChaveDeck, chaveBot: ChaveDeck, iniciativa: Iniciativa): void {
    const deckHumano = prepararDeck(decksParaTeste[chaveHumano]);
    const deckBot = prepararDeck(decksParaTeste[chaveBot]);

    humano = new Jogador("Você", deckHumano);
    botJogador = new Jogador("Oponente", deckBot);

    const humanoComeca = iniciativa === "humano"
        || (iniciativa === "aleatoria" && Math.random() < 0.5);

    partida = humanoComeca
        ? new Partida(humano, botJogador)
        : new Partida(botJogador, humano);

    bot = new BotSimples(botJogador);
    historico = [
        `Você escolheu o deck ${deckHumano.nome}.`,
        `O oponente usa o deck ${deckBot.nome}.`,
        `${humanoComeca ? "Você" : "Oponente"} começa a partida.`
    ];
    mensagemInterface = "";
    indiceCartaSelecionada = null;
    modoSacrificioCampo = false;
    processando = false;
    ajudaAberta = false;

    partida.iniciarPartida();
    faseInterface = "mulligan";
    renderizar();
}

function prepararDeck(deckOriginal: Deck): Deck {
    const copia = deckOriginal.clonarParaPartida();
    copia.embaralhar();
    return copia;
}

function renderizarMulligan(): void {
    garantirPartida();

    app.innerHTML = `
        <main class="mulligan-shell">
            <section class="mulligan-card panel">
                <div class="mulligan-heading">
                    <div>
                        <span class="product-badge">MÃO INICIAL</span>
                        <p class="eyebrow">Antes do primeiro turno</p>
                        <h1>Quer trocar sua mão?</h1>
                    </div>
                    <div class="mulligan-help">
                        <strong>Mulligan</strong>
                        <span>É apenas o nome dado à troca da mão inicial. Você pode fazer isso uma única vez.</span>
                    </div>
                </div>

                <p class="mulligan-copy">
                    Analise as cinco cartas abaixo. Se elas parecem caras demais ou pouco úteis para o começo,
                    você pode trocar todas de uma vez. Caso contrário, mantenha e comece a partida.
                </p>

                <div class="hand hand-mulligan">
                    ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, false)).join("")}
                </div>

                <div class="mulligan-actions">
                    <button id="fazer-mulligan" class="btn btn-secondary btn-large">Trocar todas as cartas</button>
                    <button id="manter-mao" class="btn btn-primary btn-large">Ficar com esta mão</button>
                </div>
            </section>
        </main>
    `;

    obterElemento<HTMLButtonElement>("fazer-mulligan").addEventListener("click", () => {
        const realizou = partida!.solicitarMulligan(humano!);
        if (realizou) {
            historico.push("Você realizou Mulligan.");
            renderizarMulliganAposTroca();
        }
    });

    obterElemento<HTMLButtonElement>("manter-mao").addEventListener("click", () => {
        historico.push("Você manteve a mão inicial.");
        entrarNoJogo();
    });
}

function renderizarMulliganAposTroca(): void {
    app.innerHTML = `
        <main class="mulligan-shell">
            <section class="mulligan-card panel">
                <div class="mulligan-heading">
                    <div>
                        <span class="product-badge">NOVA MÃO</span>
                        <p class="eyebrow">Mulligan concluído</p>
                        <h1>Estas são suas novas cartas.</h1>
                    </div>
                </div>

                <p class="mulligan-copy">A troca já foi usada. Agora esta será sua mão inicial para a partida.</p>

                <div class="hand hand-mulligan">
                    ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, false)).join("")}
                </div>

                <div class="mulligan-actions">
                    <button id="continuar-apos-mulligan" class="btn btn-primary btn-large">Começar partida</button>
                </div>
            </section>
        </main>
    `;

    obterElemento<HTMLButtonElement>("continuar-apos-mulligan").addEventListener("click", entrarNoJogo);
}

function entrarNoJogo(): void {
    faseInterface = "jogo";
    void continuarFluxoAutomatico();
}

async function continuarFluxoAutomatico(): Promise<void> {
    garantirPartida();

    processando = true;
    renderizar();

    while (partida!.estado !== "Encerrada") {
        if (partida!.estado === "Abertura" || partida!.estado === "AguardandoTurno") {
            partida!.iniciarTurno();
        }

        if (partida!.estado !== "FasePrincipal") {
            break;
        }

        if (partida!.obterJogadorAtivo() === humano) {
            processando = false;
            mensagemInterface = "Seu turno: selecione uma carta da mão e escolha onde colocá-la.";
            renderizar();
            return;
        }

        mensagemInterface = "O oponente está escolhendo as jogadas...";
        renderizar();
        await esperar(ajustarDuracao(420));

        // O bot executa apenas a Fase Principal. A interface renderiza o campo
        // antes de pedir à Partida que resolva o combate. Assim conseguimos
        // reproduzir visualmente os eventos em ordem sem mexer nas regras.
        const acoes = bot!.executarAcoes(partida!);
        historico.push(...acoes);
        indiceCartaSelecionada = null;
        modoSacrificioCampo = false;
        mensagemInterface = "Jogadas concluídas. Preparando o combate...";
        renderizar();
        await esperar(ajustarDuracao(PAUSA_ACOES_BOT_MS));

        const turnoDoCombate = partida!.turnoAtual;
        registrarSeparadorCombate(turnoDoCombate, "Oponente");
        const eventos = partida!.passarTurno();
        await reproduzirEventosCombate(eventos, "bot");
        renderizar();

        if (eventos.some(evento => evento.tipo === "PartidaEncerrada")) {
            break;
        }

        await esperar(ajustarDuracao(420));
    }

    processando = false;
    mensagemInterface = "Partida encerrada.";
    renderizar();
}

function renderizarJogo(): void {
    garantirPartida();

    const ativo = partida!.obterJogadorAtivo();
    const turnoHumano = ativo === humano && partida!.estado === "FasePrincipal";
    const controlesAtivos = turnoHumano && !processando;
    const historicoVisivel = historico.slice(-LIMITE_HISTORICO_VISUAL);

    app.innerHTML = `
        <main class="game-shell">
            <header class="topbar panel">
                <div class="topbar-brand">
                    <span class="product-badge compact">PLAYTEST</span>
                    <div>
                        <strong>Turno ${partida!.turnoAtual}</strong>
                        <span>Combate automático</span>
                    </div>
                </div>

                <div class="turn-pill ${turnoHumano ? "is-player" : "is-bot"}">
                    <span class="turn-dot"></span>
                    ${partida!.estado === "Encerrada"
                        ? "Fim da partida"
                        : turnoHumano
                            ? "Seu turno"
                            : "Turno do oponente"}
                </div>

                <div class="topbar-actions">
                    <button id="ajuda-jogo" class="btn btn-ghost btn-compact">Como jogar</button>
                    <button id="nova-partida-topo" class="btn btn-ghost btn-compact">Nova partida</button>
                </div>
            </header>

            <section class="battlefield panel" aria-label="Campo de batalha">
                <div id="combat-feedback" class="combat-feedback" aria-live="polite"></div>

                ${htmlCabecalhoJogador(botJogador!, false)}
                ${htmlTabuleiro(botJogador!, false, false)}

                <div class="combat-divider">
                    <span class="combat-divider-icon">⚔</span>
                    <span>Resolução de combate</span>
                </div>

                ${htmlTabuleiro(humano!, true, controlesAtivos)}
                ${htmlCabecalhoJogador(humano!, true)}
            </section>

            <section class="play-area-grid">
                <section class="panel hand-panel">
                    <div class="panel-title-row hand-title-row">
                        <div>
                            <span class="section-kicker">SUAS OPÇÕES</span>
                            <h2>Sua mão</h2>
                            <span class="muted">${humano!.mao.length} cartas na mão · ${humano!.deck.tamanhoDeck()} restantes no deck</span>
                        </div>
                        <div class="mana-display" aria-label="Mana disponível: ${humano!.mostrarMana}">
                            <span class="mana-symbol" aria-hidden="true">◆</span>
                            <span class="mana-copy"><small>MANA</small><strong>${humano!.mostrarMana}</strong></span>
                        </div>
                    </div>

                    <div class="hand" id="mao-jogador">
                        ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, controlesAtivos)).join("")}
                    </div>

                    <div class="action-bar">
                        <div class="action-status">
                            <span class="action-status-label">O QUE FAZER AGORA</span>
                            <p>${htmlMensagemAcao(controlesAtivos)}</p>
                        </div>
                        <div class="action-buttons">
                            <button id="sacrificar-mao" class="btn btn-secondary" ${!controlesAtivos || indiceCartaSelecionada === null ? "disabled" : ""}>
                                <span>Sacrificar carta selecionada</span>
                                <small>gera mana extra</small>
                            </button>
                            <button id="sacrificar-campo" class="btn ${modoSacrificioCampo ? "btn-warning" : "btn-secondary"}" ${!controlesAtivos ? "disabled" : ""}>
                                <span>${modoSacrificioCampo ? "Escolha uma criatura" : "Sacrificar do campo"}</span>
                                <small>${modoSacrificioCampo ? "clique no campo" : "+1 mana"}</small>
                            </button>
                            <button id="passar-turno" class="btn btn-primary btn-end-turn" ${!controlesAtivos ? "disabled" : ""}>
                                <span>Encerrar turno</span>
                                <small>resolver combate →</small>
                            </button>
                        </div>
                    </div>
                </section>

                <aside class="side-column">
                    <section class="panel quick-guide-panel">
                        <div class="panel-title-row compact-row">
                            <div>
                                <span class="section-kicker">LEITURA RÁPIDA</span>
                                <h2>Posicionamento</h2>
                            </div>
                        </div>
                        <div class="mini-legend-list">
                            ${htmlLegendaTipo("corpo-a-corpo", true)}
                            ${htmlLegendaTipo("distancia", true)}
                            ${htmlLegendaTipo("magico", true)}
                        </div>
                        <p class="sacrifice-note"><strong>Sacrifício:</strong> no máximo uma vez por turno. Criatura da mão gera +2 mana; criatura do campo gera +1.</p>
                    </section>

                    <details class="panel log-panel" open>
                        <summary class="log-summary">
                            <span><span class="section-kicker">PARTIDA</span><strong>Histórico</strong></span>
                            <span class="log-count">${historico.length}</span>
                        </summary>
                        <div class="event-log" id="event-log">
                            ${historicoVisivel.length === 0
                                ? '<p class="muted">A partida ainda não gerou eventos.</p>'
                                : historicoVisivel.map(item => `<p class="${item.startsWith("—") ? "log-separator" : ""}">${escaparHtml(item)}</p>`).join("")}
                        </div>
                    </details>
                </aside>
            </section>

            ${ajudaAberta ? htmlAjuda() : ""}
            ${partida!.estado === "Encerrada" ? htmlFimDeJogo() : ""}
        </main>
    `;

    conectarEventosDoJogo(controlesAtivos);

    const log = document.querySelector<HTMLDivElement>("#event-log");
    if (log !== null) {
        log.scrollTop = log.scrollHeight;
    }
}

function htmlCabecalhoJogador(jogador: Jogador, ehHumano: boolean): string {
    const nomeDeck = jogador.deck.nome;
    const lado = ehHumano ? "humano" : "bot";
    const titulo = ehHumano ? "VOCÊ" : "OPONENTE";

    return `
        <div id="player-strip-${lado}" class="player-strip ${ehHumano ? "player-strip-human" : "player-strip-bot"}">
            <div class="player-identity">
                <span class="player-role">${titulo}</span>
                <strong>${escaparHtml(jogador.nome)}</strong>
                <span class="deck-name">${escaparHtml(nomeDeck)}</span>
            </div>

            <div class="player-resources">
                <div id="hp-${lado}" class="resource-box hp-resource">
                    <span class="resource-icon" aria-hidden="true">♥</span>
                    <span><small>VIDA</small><strong data-vida-jogador>${jogador.vidaAtual}</strong></span>
                </div>
                <div class="resource-box mana-resource-small">
                    <span class="resource-icon" aria-hidden="true">◆</span>
                    <span><small>MANA</small><strong>${jogador.mostrarMana}</strong></span>
                </div>
                <div class="resource-meta"><small>MÃO</small><strong>${jogador.mao.length}</strong></div>
                <div class="resource-meta"><small>DECK</small><strong>${jogador.deck.tamanhoDeck()}</strong></div>
            </div>
        </div>
    `;
}

function htmlTabuleiro(jogador: Jogador, ehHumano: boolean, interativo: boolean): string {
    if (ehHumano) {
        return `
            <div class="board-zone board-human">
                ${htmlLinhaTabuleiro(jogador, "frente", interativo)}
                ${htmlLinhaTabuleiro(jogador, "fundo", interativo)}
            </div>
        `;
    }

    return `
        <div class="board-zone board-bot">
            ${htmlLinhaTabuleiro(jogador, "fundo", false)}
            ${htmlLinhaTabuleiro(jogador, "frente", false)}
        </div>
    `;
}

function htmlLinhaTabuleiro(jogador: Jogador, linha: Linha, interativo: boolean): string {
    const colunas = [Coluna.Esquerda, Coluna.Meio, Coluna.Direita];
    const descricao = linha === "frente" ? "corpo a corpo" : "distância";

    return `
        <div class="board-row ${linha === "frente" ? "row-front" : "row-back"}">
            <span class="row-label"><strong>${linha === "frente" ? "Frente" : "Fundo"}</strong><small>${descricao}</small></span>
            <div class="slots">
                ${colunas.map(coluna => htmlSlot(jogador, { linha, coluna }, interativo)).join("")}
            </div>
        </div>
    `;
}

function htmlSlot(jogador: Jogador, posicao: Posicao, interativo: boolean): string {
    const criatura = jogador.tabuleiro.obterCriatura(posicao.linha, posicao.coluna);
    const classeInteracao = interativo ? "slot-interactive" : "";
    const classeSacrificio = modoSacrificioCampo && jogador === humano && criatura !== null ? "slot-sacrifice" : "";

    if (criatura === null) {
        const orientacao = posicao.linha === "frente" ? "Corpo a corpo" : "Distância";
        return `
            <button class="board-slot empty ${classeInteracao}" data-linha="${posicao.linha}" data-coluna="${posicao.coluna}" ${interativo ? "" : "disabled"} aria-label="Espaço vazio: ${orientacao}">
                <span class="empty-mark">+</span>
                <span>espaço vazio</span>
            </button>
        `;
    }

    const classeTipo = classeTipoAtaque(criatura.tipoAtaque);
    return `
        <button
            class="board-slot creature-slot ${classeInteracao} ${classeSacrificio} ${classeTipo}"
            data-linha="${posicao.linha}"
            data-coluna="${posicao.coluna}"
            data-tipo-ataque="${criatura.tipoAtaque}"
            ${interativo ? "" : "disabled"}
            aria-label="${escaparHtml(criatura.nome)}, ataque ${criatura.ataque}, vida ${criatura.vida}"
        >
            <span class="board-creature-art" aria-hidden="true">
                ${htmlArteCriatura(criatura.nome, criatura.tipoAtaque, "board-creature-image")}
                <span class="board-type-badge" title="${nomeTipo(criatura.tipoAtaque)}">${iconeTipo(criatura.tipoAtaque)}</span>
            </span>

            <span class="board-creature-info">
                <strong class="board-creature-name" title="${escaparHtml(criatura.nome)}">${escaparHtml(criatura.nome)}</strong>
                <span class="mini-stats">
                    <b class="attack-stat"><small>ATQ</small>${criatura.ataque}</b>
                    <b class="life-stat"><small>VIDA</small><span data-vida-criatura>${criatura.vida}</span></b>
                </span>
            </span>
        </button>
    `;
}

function htmlCartaMao(carta: Carta, indice: number, interativo: boolean): string {
    const selecionada = indice === indiceCartaSelecionada;

    if (carta instanceof CartaCriatura) {
        const classeTipo = classeTipoAtaque(carta.tipoAtaque);
        return `
            <button class="game-card ${classeTipo} ${selecionada ? "selected" : ""}" data-indice-carta="${indice}" ${interativo ? "" : "disabled"} aria-pressed="${selecionada}">
                <span class="card-cost" title="Custo de mana"><small>MANA</small>${carta.custoMana}</span>
                <span class="card-type-pill">${iconeTipo(carta.tipoAtaque)} ${nomeTipo(carta.tipoAtaque)}</span>
                <span class="card-art creature-card-art" aria-hidden="true">
                    ${htmlArteCriatura(carta.nome, carta.tipoAtaque, "hand-creature-image")}
                </span>
                <strong class="card-name">${escaparHtml(carta.nome)}</strong>
                <span class="card-stats">
                    <b class="attack-stat"><small>ATQ</small>${carta.ataque}</b>
                    <b class="life-stat"><small>VIDA</small>${carta.vida}</b>
                </span>
            </button>
        `;
    }

    return `
        <button class="game-card generic-card ${selecionada ? "selected" : ""}" data-indice-carta="${indice}" ${interativo ? "" : "disabled"} aria-pressed="${selecionada}">
            <span class="card-cost" title="Custo de mana"><small>MANA</small>${carta.custoMana}</span>
            <span class="card-art-placeholder" aria-hidden="true"><i>◇</i></span>
            <strong class="card-name">${escaparHtml(carta.nome)}</strong>
            <span class="card-type-pill">${escaparHtml(carta.tipoCarta)}</span>
        </button>
    `;
}


function htmlArteCriatura(nome: string, tipoAtaque: TipoAtaqueVisual, classeImagem: string): string {
    const url = obterUrlArteCriatura(nome);

    if (url === null) {
        return `<span class="creature-art-fallback ${classeTipoAtaque(tipoAtaque)}"><i>${iconeTipo(tipoAtaque)}</i></span>`;
    }

    return `<img class="${classeImagem}" src="${url}" alt="" draggable="false" loading="eager">`;
}

function obterUrlArteCriatura(nome: string): string | null {
    if (gerarSVGProcedural === null) {
        return null;
    }

    const chave = normalizarChaveArte(nome);
    const configuracao = CONFIGURACOES_ARTE[chave] ?? criarConfiguracaoFallback(nome);
    const cacheKey = `${configuracao.tipo}|${configuracao.subtipo}|${configuracao.seed}|${configuracao.genero ?? ""}`;

    const existente = cacheUrlArte.get(cacheKey);
    if (existente !== undefined) {
        return existente;
    }

    try {
        // fundo:false deixa a silhueta inteira legível tanto na mão quanto no campo.
        // O SVG vira Blob URL para isolar ids de gradients/filters entre cópias repetidas
        // da mesma carta e para não inflar o innerHTML a cada renderização.
        const svg = gerarSVGProcedural(configuracao.tipo, {
            seed: configuracao.seed,
            subtipo: configuracao.subtipo,
            genero: configuracao.genero,
            fundo: false
        });

        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        cacheUrlArte.set(cacheKey, url);
        return url;
    } catch (erro) {
        console.warn(`[TCG] Falha ao gerar arte para "${nome}".`, erro);
        return null;
    }
}

function criarConfiguracaoFallback(nome: string): ConfiguracaoArteCriatura {
    const chave = normalizarChaveArte(nome);

    if (!avisosArteDesconhecida.has(chave)) {
        avisosArteDesconhecida.add(chave);
        console.warn(`[TCG] "${nome}" ainda não tem mapeamento visual explícito; usando arte procedural de fallback.`);
    }

    if (chave.includes("golem") || chave.includes("muralha") || chave.includes("montanha")) {
        return { tipo: "Monstros", subtipo: "golem", seed: `fallback-${chave}` };
    }
    if (chave.includes("aranha")) {
        return { tipo: "Animais", subtipo: "aranha", seed: `fallback-${chave}` };
    }
    if (chave.includes("dragao")) {
        return { tipo: "Monstros", subtipo: "dragao", seed: `fallback-${chave}` };
    }
    if (chave.includes("mago") || chave.includes("feiticeiro")) {
        return { tipo: "Humanos", subtipo: "mago", seed: `fallback-${chave}` };
    }
    if (chave.includes("arqueiro") || chave.includes("besteiro")) {
        return { tipo: "Humanos", subtipo: "arqueiro", seed: `fallback-${chave}` };
    }
    if (chave.includes("guerreiro")) {
        return { tipo: "Humanos", subtipo: "guerreiro", seed: `fallback-${chave}` };
    }
    if (chave.includes("alien")) {
        return { tipo: "Alien", subtipo: "predador", seed: `fallback-${chave}` };
    }

    return { tipo: "Monstros", subtipo: "orc", seed: `fallback-${chave}` };
}

function normalizarChaveArte(valor: string): string {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function htmlMensagemAcao(controlesAtivos: boolean): string {
    if (partida!.estado === "Encerrada") {
        return "Partida encerrada.";
    }

    if (!controlesAtivos) {
        return escaparHtml(mensagemInterface || "Aguardando o próximo passo...");
    }

    if (modoSacrificioCampo) {
        return "Escolha uma criatura do seu campo. Ela será removida e você receberá +1 mana.";
    }

    if (indiceCartaSelecionada !== null) {
        const carta = humano!.mao[indiceCartaSelecionada];
        return carta
            ? `<strong>${escaparHtml(carta.nome)}</strong> selecionada. Agora clique em um espaço vazio do campo para jogar, ou use o botão de sacrifício.`
            : "Selecione uma carta.";
    }

    return escaparHtml(mensagemInterface || "Selecione uma carta da mão para começar sua jogada.");
}

function htmlAjuda(): string {
    return `
        <div class="help-backdrop" role="dialog" aria-modal="true" aria-label="Como jogar">
            <section class="help-modal panel">
                <div class="help-header">
                    <div>
                        <span class="product-badge">GUIA RÁPIDO</span>
                        <h2>Como jogar esta versão</h2>
                    </div>
                    <button id="fechar-ajuda" class="btn btn-ghost btn-icon" aria-label="Fechar ajuda">×</button>
                </div>

                <div class="help-grid">
                    <article><b>1</b><div><strong>Veja sua mana.</strong><p>O custo da carta precisa caber na mana disponível naquele turno.</p></div></article>
                    <article><b>2</b><div><strong>Selecione uma carta.</strong><p>Depois clique em uma das seis posições do seu campo para jogá-la.</p></div></article>
                    <article><b>3</b><div><strong>Respeite as linhas.</strong><p>Corpo a corpo funciona na frente; distância no fundo; magia em qualquer uma.</p></div></article>
                    <article><b>4</b><div><strong>Considere sacrificar.</strong><p>Uma vez por turno você pode trocar uma carta ou criatura por mana extra.</p></div></article>
                    <article><b>5</b><div><strong>Encerre o turno.</strong><p>As criaturas atacam automaticamente e a interface mostra a ordem dos ataques.</p></div></article>
                    <article><b>6</b><div><strong>Reduza a vida adversária.</strong><p>Quando não há criaturas defendendo, seus atacantes podem atingir o jogador diretamente.</p></div></article>
                </div>

                <div class="type-legend help-legend">
                    ${htmlLegendaTipo("corpo-a-corpo")}
                    ${htmlLegendaTipo("distancia")}
                    ${htmlLegendaTipo("magico")}
                </div>

                <button id="entendi-ajuda" class="btn btn-primary btn-large">Entendi, voltar à partida</button>
            </section>
        </div>
    `;
}

function htmlFimDeJogo(): string {
    const venceu = humano!.estaVivo();
    return `
        <div class="game-over-backdrop">
            <div class="game-over panel ${venceu ? "victory" : "defeat"}">
                <span class="result-icon" aria-hidden="true">${venceu ? "◆" : "×"}</span>
                <div class="eyebrow">Partida encerrada</div>
                <h2>${venceu ? "Você venceu!" : "O oponente venceu."}</h2>
                <p>Vida final: <strong>Você ${humano!.vidaAtual}</strong> · <strong>Oponente ${botJogador!.vidaAtual}</strong></p>
                <button id="nova-partida-overlay" class="btn btn-primary btn-large">Jogar novamente</button>
            </div>
        </div>
    `;
}

function htmlLegendaTipo(tipo: TipoAtaqueVisual, compacto = false): string {
    const descricao = tipo === "corpo-a-corpo"
        ? "Ataca pela linha da frente"
        : tipo === "distancia"
            ? "Ataca pela linha de fundo"
            : "Ataca de qualquer linha";

    return `
        <div class="type-legend-item ${classeTipoAtaque(tipo)} ${compacto ? "compact" : ""}">
            <span class="type-legend-icon">${iconeTipo(tipo)}</span>
            <span><strong>${nomeTipo(tipo)}</strong><small>${descricao}</small></span>
        </div>
    `;
}

function conectarEventosDoJogo(controlesAtivos: boolean): void {
    document.querySelectorAll<HTMLButtonElement>("[data-indice-carta]").forEach(botaoCarta => {
        botaoCarta.addEventListener("click", () => {
            if (!controlesAtivos) return;
            const indice = Number(botaoCarta.dataset.indiceCarta);
            indiceCartaSelecionada = indiceCartaSelecionada === indice ? null : indice;
            modoSacrificioCampo = false;
            mensagemInterface = "";
            renderizar();
        });
    });

    document.querySelectorAll<HTMLButtonElement>(".board-human .board-slot").forEach(slot => {
        slot.addEventListener("click", () => {
            if (!controlesAtivos) return;

            const linha = slot.dataset.linha as Linha;
            const coluna = Number(slot.dataset.coluna) as Coluna;
            const posicao: Posicao = { linha, coluna };

            if (modoSacrificioCampo) {
                sacrificarDoCampo(posicao);
                return;
            }

            jogarCartaSelecionada(posicao);
        });
    });

    obterElemento<HTMLButtonElement>("sacrificar-mao").addEventListener("click", sacrificarCartaSelecionada);

    obterElemento<HTMLButtonElement>("sacrificar-campo").addEventListener("click", () => {
        if (!controlesAtivos) return;
        modoSacrificioCampo = !modoSacrificioCampo;
        indiceCartaSelecionada = null;
        mensagemInterface = "";
        renderizar();
    });

    obterElemento<HTMLButtonElement>("passar-turno").addEventListener("click", () => {
        if (!controlesAtivos) return;
        void passarTurnoHumano();
    });

    obterElemento<HTMLButtonElement>("nova-partida-topo").addEventListener("click", voltarAoSetup);
    obterElemento<HTMLButtonElement>("ajuda-jogo").addEventListener("click", () => {
        ajudaAberta = true;
        renderizar();
    });

    document.querySelector<HTMLButtonElement>("#nova-partida-overlay")?.addEventListener("click", voltarAoSetup);
    document.querySelector<HTMLButtonElement>("#fechar-ajuda")?.addEventListener("click", fecharAjuda);
    document.querySelector<HTMLButtonElement>("#entendi-ajuda")?.addEventListener("click", fecharAjuda);
}

function fecharAjuda(): void {
    ajudaAberta = false;
    renderizar();
}

function jogarCartaSelecionada(posicao: Posicao): void {
    if (indiceCartaSelecionada === null) {
        mensagemInterface = "Primeiro selecione uma carta da sua mão; depois escolha uma posição vazia.";
        renderizar();
        return;
    }

    const carta = humano!.mao[indiceCartaSelecionada];
    if (!(carta instanceof CartaCriatura)) {
        mensagemInterface = "Este tipo de carta ainda não foi implementado.";
        renderizar();
        return;
    }

    const resultado = partida!.tentarJogarCarta(carta, posicao);

    if (resultado === "Sucesso") {
        historico.push(`Você jogou ${carta.nome} em ${posicao.linha}/${nomeColuna(posicao.coluna)}.`);
        indiceCartaSelecionada = null;
        mensagemInterface = `${carta.nome} entrou no campo. Você pode jogar novamente, sacrificar ou encerrar o turno.`;
    } else {
        mensagemInterface = mensagemResultadoJogada(resultado);
    }

    renderizar();
}

function sacrificarCartaSelecionada(): void {
    if (indiceCartaSelecionada === null) {
        return;
    }

    const carta = humano!.mao[indiceCartaSelecionada];
    if (carta === undefined) {
        indiceCartaSelecionada = null;
        renderizar();
        return;
    }

    const manaAntes = humano!.mostrarMana;
    const resultado = partida!.tentarSacrificarCartaMao(carta);

    if (resultado === "Sucesso") {
        const manaGerada = humano!.mostrarMana - manaAntes;
        historico.push(`Você sacrificou ${carta.nome} da mão e ganhou +${manaGerada} mana.`);
        indiceCartaSelecionada = null;
        mensagemInterface = `Sacrifício realizado: +${manaGerada} mana disponível neste turno.`;
    } else {
        mensagemInterface = mensagemResultadoSacrificio(resultado);
    }

    renderizar();
}

function sacrificarDoCampo(posicao: Posicao): void {
    const criatura = humano!.tabuleiro.obterCriatura(posicao.linha, posicao.coluna);
    if (criatura === null) {
        mensagemInterface = "Não existe criatura nessa posição para sacrificar.";
        renderizar();
        return;
    }

    const nome = criatura.nome;
    const resultado = partida!.tentarSacrificarCriaturaCampo(posicao);

    if (resultado === "Sucesso") {
        historico.push(`Você sacrificou ${nome} do campo e ganhou +1 mana.`);
        modoSacrificioCampo = false;
        mensagemInterface = `${nome} foi sacrificado: +1 mana disponível neste turno.`;
    } else {
        mensagemInterface = mensagemResultadoSacrificio(resultado);
    }

    renderizar();
}

async function passarTurnoHumano(): Promise<void> {
    processando = true;
    indiceCartaSelecionada = null;
    modoSacrificioCampo = false;
    mensagemInterface = "Combate em andamento...";

    // Renderizamos antes de resolver o combate. O DOM permanece mostrando
    // o estado pré-combate enquanto a Partida produz todos os eventos.
    renderizar();

    const turnoDoCombate = partida!.turnoAtual;
    registrarSeparadorCombate(turnoDoCombate, "Você");
    const eventos = partida!.passarTurno();
    await reproduzirEventosCombate(eventos, "humano");
    renderizar();

    if (partida!.estado === "Encerrada") {
        processando = false;
        renderizar();
        return;
    }

    await esperar(ajustarDuracao(340));
    await continuarFluxoAutomatico();
}

async function reproduzirEventosCombate(eventos: TiposEventos[], ladoAtacante: LadoVisual): Promise<void> {
    const ladoDefensor: LadoVisual = ladoAtacante === "humano" ? "bot" : "humano";

    if (eventos.length === 0) {
        mostrarFeedbackCombate("Nenhuma criatura atacou neste combate.", "neutro");
        await esperar(ajustarDuracao(520));
        limparFeedbackCombate();
        return;
    }

    for (const evento of eventos) {
        registrarEventoNoHistorico(evento);

        switch (evento.tipo) {
            case "AtaqueCriatura": {
                const origem = obterSlotVisual(ladoAtacante, evento.posicaoAtacante);
                const destino = obterSlotVisual(ladoDefensor, evento.posicaoDefensor);
                const tipoAtaque = obterTipoAtaqueVisual(origem);

                mostrarFeedbackCombate(
                    `${iconeTipo(tipoAtaque)} ${evento.nomeAtacante} atacou ${evento.nomeDefensor} · ${evento.danoCausado} de dano`,
                    "ataque"
                );

                await animarAtaque(origem, destino, tipoAtaque);
                atualizarVidaCriaturaVisual(destino, evento.vidaAposDano);
                await animarImpacto(destino, tipoAtaque);
                break;
            }

            case "CriaturaDestruida": {
                const slot = obterSlotVisual(ladoDefensor, evento.posicaoCriatura);
                mostrarFeedbackCombate(`${evento.nomeCriatura} foi destruída`, "destruicao");
                await animarDestruicao(slot);
                break;
            }

            case "AtaqueDireto": {
                const origem = obterSlotVisual(ladoAtacante, evento.posicaoAtacante);
                const destino = document.querySelector<HTMLElement>(`#hp-${ladoDefensor}`);
                const tipoAtaque = obterTipoAtaqueVisual(origem);

                mostrarFeedbackCombate(
                    `${iconeTipo(tipoAtaque)} ${evento.nomeAtacante} atingiu ${evento.nomeDefensor} diretamente · ${evento.danoCausado} de dano`,
                    "ataque-direto"
                );

                await animarAtaque(origem, destino, tipoAtaque);
                atualizarVidaJogadorVisual(ladoDefensor, evento.vidaAposDano);
                await animarImpacto(destino, tipoAtaque);
                break;
            }

            case "AtaqueImpedido": {
                const origem = obterSlotVisual(ladoAtacante, evento.posicaoAtacante);
                const texto = evento.motivo === "LinhaInvalida"
                    ? `${evento.nomeCriatura} está na linha errada e não atacou`
                    : `${evento.nomeCriatura} não pode atacar o jogador diretamente no turno 1`;

                mostrarFeedbackCombate(texto, "impedido");
                await animarAtaqueImpedido(origem);
                break;
            }

            case "PartidaEncerrada":
                mostrarFeedbackCombate(`${evento.vencedorNome} venceu a partida`, "fim");
                await esperar(ajustarDuracao(760));
                break;
        }

        await esperar(ajustarDuracao(PAUSA_ENTRE_EVENTOS_MS));
    }

    limparFeedbackCombate();
}

function obterSlotVisual(lado: LadoVisual, posicao: Posicao): HTMLElement | null {
    const seletorTabuleiro = lado === "humano" ? ".board-human" : ".board-bot";
    return document.querySelector<HTMLElement>(
        `${seletorTabuleiro} .board-slot[data-linha="${posicao.linha}"][data-coluna="${posicao.coluna}"]`
    );
}

function obterTipoAtaqueVisual(origem: HTMLElement | null): TipoAtaqueVisual {
    const tipo = origem?.dataset.tipoAtaque;
    if (tipo === "distancia" || tipo === "magico" || tipo === "corpo-a-corpo") {
        return tipo;
    }
    return "corpo-a-corpo";
}

async function animarAtaque(
    origem: HTMLElement | null,
    destino: HTMLElement | null,
    tipoAtaque: TipoAtaqueVisual
): Promise<void> {
    if (origem === null || destino === null) {
        await esperar(ajustarDuracao(duracaoAtaque(tipoAtaque)));
        return;
    }

    origem.classList.add("is-attacking", classeTipoAtaque(tipoAtaque));

    if (MOVIMENTO_REDUZIDO) {
        await esperar(90);
        origem.classList.remove("is-attacking");
        return;
    }

    if (tipoAtaque === "corpo-a-corpo") {
        // Mantemos o avanço físico aprovado no playtest.
        await animarAtaqueCorpoACorpo(origem, destino);
    } else if (tipoAtaque === "distancia") {
        // Ataque à distância usa uma flecha verde claramente direcional.
        await animarAtaqueDistancia(origem, destino);
    } else {
        // Ataque mágico usa um orbe azul e deixa a explosão para o impacto.
        await animarAtaqueMagico(origem, destino);
    }

    origem.classList.remove("is-attacking");
}

async function animarAtaqueCorpoACorpo(origem: HTMLElement, destino: HTMLElement): Promise<void> {
    const inicio = centroElemento(origem);
    const fim = centroElemento(destino);
    const dxTotal = fim.x - inicio.x;
    const dyTotal = fim.y - inicio.y;
    const distancia = Math.max(Math.hypot(dxTotal, dyTotal), 1);
    const avanco = Math.min(38, distancia * 0.13);
    const dx = (dxTotal / distancia) * avanco;
    const dy = (dyTotal / distancia) * avanco;

    const animacao = origem.animate(
        [
            { transform: "translate(0, 0) scale(1)" },
            { transform: `translate(${dx * -0.18}px, ${dy * -0.18}px) scale(0.99)`, offset: 0.22 },
            { transform: `translate(${dx}px, ${dy}px) scale(1.055)`, offset: 0.60 },
            { transform: "translate(0, 0) scale(1)" }
        ],
        { duration: DURACAO_MELEE_MS, easing: "cubic-bezier(.22,.72,.22,1)" }
    );

    await aguardarAnimacao(animacao);
    criarEfeitoImpacto(destino, "corpo-a-corpo");
}

async function animarAtaqueDistancia(origem: HTMLElement, destino: HTMLElement): Promise<void> {
    const inicio = centroElemento(origem);
    const fim = centroElemento(destino);
    const dx = fim.x - inicio.x;
    const dy = fim.y - inicio.y;
    const distancia = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / distancia;
    const uy = dy / distancia;
    const angulo = Math.atan2(dy, dx) * 180 / Math.PI;

    // A flecha nasce um pouco para fora da carta e termina dentro do alvo.
    // Isso evita que o projétil pareça surgir do centro do texto.
    const origemX = inicio.x + ux * 14;
    const origemY = inicio.y + uy * 14;
    const alvoX = fim.x - ux * 8;
    const alvoY = fim.y - uy * 8;

    const flecha = document.createElement("div");
    flecha.className = "attack-projectile projectile-ranged";
    flecha.style.left = `${origemX}px`;
    flecha.style.top = `${origemY}px`;
    flecha.style.setProperty("--projectile-angle", `${angulo}deg`);
    document.body.appendChild(flecha);

    const animacao = flecha.animate(
        [
            {
                left: `${origemX}px`,
                top: `${origemY}px`,
                opacity: 0,
                transform: `translate(-50%, -50%) rotate(${angulo}deg) scale(.80)`
            },
            {
                opacity: 1,
                transform: `translate(-50%, -50%) rotate(${angulo}deg) scale(1)`,
                offset: 0.12
            },
            {
                left: `${alvoX}px`,
                top: `${alvoY}px`,
                opacity: 1,
                transform: `translate(-50%, -50%) rotate(${angulo}deg) scale(1.05)`
            }
        ],
        { duration: DURACAO_DISTANCIA_MS, easing: "cubic-bezier(.18,.72,.16,1)", fill: "forwards" }
    );

    await aguardarAnimacao(animacao);
    flecha.remove();
}

async function animarAtaqueMagico(origem: HTMLElement, destino: HTMLElement): Promise<void> {
    const inicio = centroElemento(origem);
    const fim = centroElemento(destino);
    const dx = fim.x - inicio.x;
    const dy = fim.y - inicio.y;
    const distancia = Math.max(Math.hypot(dx, dy), 1);

    // Um arco muito discreto deixa o orbe vivo sem tornar o combate espalhafatoso.
    const perpendicularX = -dy / distancia;
    const perpendicularY = dx / distancia;
    const curvatura = Math.min(18, distancia * 0.045);
    const meioX = inicio.x + dx * 0.52 + perpendicularX * curvatura;
    const meioY = inicio.y + dy * 0.52 + perpendicularY * curvatura;

    const orbe = document.createElement("div");
    orbe.className = "attack-projectile projectile-magic";
    orbe.style.left = `${inicio.x}px`;
    orbe.style.top = `${inicio.y}px`;
    document.body.appendChild(orbe);

    const animacao = orbe.animate(
        [
            {
                left: `${inicio.x}px`,
                top: `${inicio.y}px`,
                opacity: 0,
                transform: "translate(-50%, -50%) scale(.42)"
            },
            {
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1.04)",
                offset: 0.14
            },
            {
                left: `${meioX}px`,
                top: `${meioY}px`,
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1.14)",
                offset: 0.58
            },
            {
                left: `${fim.x}px`,
                top: `${fim.y}px`,
                opacity: 1,
                transform: "translate(-50%, -50%) scale(.92)"
            }
        ],
        { duration: DURACAO_MAGIA_MS, easing: "cubic-bezier(.18,.74,.18,1)", fill: "forwards" }
    );

    await aguardarAnimacao(animacao);
    orbe.remove();
}

async function animarImpacto(destino: HTMLElement | null, tipoAtaque: TipoAtaqueVisual): Promise<void> {
    if (destino === null) {
        await esperar(ajustarDuracao(DURACAO_IMPACTO_MS));
        return;
    }

    const classeHit = `hit-${classeTipoAtaque(tipoAtaque)}`;
    destino.classList.add("is-hit", classeHit);

    if (tipoAtaque === "magico") {
        // A explosão mágica precisa ser sentida no alvo, sem deslocá-lo de verdade.
        destino.classList.add("magic-hit-shake");
    }

    criarEfeitoImpacto(destino, tipoAtaque);
    await esperar(ajustarDuracao(tipoAtaque === "magico" ? 360 : DURACAO_IMPACTO_MS));

    destino.classList.remove("is-hit", classeHit, "magic-hit-shake");
}

function criarEfeitoImpacto(destino: HTMLElement, tipoAtaque: TipoAtaqueVisual): void {
    if (MOVIMENTO_REDUZIDO) return;

    const centro = centroElemento(destino);
    const efeito = document.createElement("div");
    efeito.className = `combat-impact impact-${classeTipoAtaque(tipoAtaque)}`;
    efeito.style.left = `${centro.x}px`;
    efeito.style.top = `${centro.y}px`;
    efeito.innerHTML = tipoAtaque === "corpo-a-corpo" ? "<i></i><i></i>" : "<i></i>";
    document.body.appendChild(efeito);

    window.setTimeout(() => efeito.remove(), tipoAtaque === "magico" ? 700 : 440);
}

async function animarDestruicao(slot: HTMLElement | null): Promise<void> {
    if (slot === null) {
        await esperar(ajustarDuracao(420));
        return;
    }

    slot.classList.add("is-destroyed");
    await esperar(ajustarDuracao(420));
    slot.classList.remove("creature-slot", "is-destroyed", "type-melee", "type-ranged", "type-magic");
    slot.removeAttribute("data-tipo-ataque");
    slot.classList.add("empty", "slot-after-destruction");
    slot.innerHTML = '<span class="empty-mark">×</span><span>destruída</span>';
}

async function animarAtaqueImpedido(slot: HTMLElement | null): Promise<void> {
    if (slot === null) {
        await esperar(ajustarDuracao(500));
        return;
    }

    slot.classList.add("is-blocked");
    await esperar(ajustarDuracao(500));
    slot.classList.remove("is-blocked");
}

function atualizarVidaCriaturaVisual(slot: HTMLElement | null, vida: number): void {
    const elementoVida = slot?.querySelector<HTMLElement>("[data-vida-criatura]");
    if (elementoVida !== null && elementoVida !== undefined) {
        elementoVida.textContent = String(vida);
    }
}

function atualizarVidaJogadorVisual(lado: LadoVisual, vida: number): void {
    const hp = document.querySelector<HTMLElement>(`#hp-${lado}`);
    const valor = hp?.querySelector<HTMLElement>("[data-vida-jogador]");
    if (valor !== null && valor !== undefined) {
        valor.textContent = String(vida);
    }
}

function mostrarFeedbackCombate(texto: string, tipo: TipoFeedback): void {
    const feedback = document.querySelector<HTMLDivElement>("#combat-feedback");
    if (feedback === null) return;

    feedback.textContent = texto;
    feedback.className = `combat-feedback visible ${tipo}`;
}

function limparFeedbackCombate(): void {
    const feedback = document.querySelector<HTMLDivElement>("#combat-feedback");
    if (feedback === null) return;
    feedback.className = "combat-feedback";
    feedback.textContent = "";
}

function registrarSeparadorCombate(turno: number, atacante: string): void {
    const texto = `— Combate do turno ${turno} · ${atacante} ataca —`;
    historico.push(texto);

    const log = document.querySelector<HTMLDivElement>("#event-log");
    if (log === null) return;

    const linha = document.createElement("p");
    linha.className = "log-separator";
    linha.textContent = texto;
    log.appendChild(linha);
    log.scrollTop = log.scrollHeight;
}

function registrarEventoNoHistorico(evento: TiposEventos): void {
    const texto = formatarEvento(evento);
    historico.push(texto);

    const log = document.querySelector<HTMLDivElement>("#event-log");
    if (log === null) return;

    const vazio = log.querySelector(".muted");
    vazio?.remove();

    const linha = document.createElement("p");
    linha.className = "event-log-entry newest";
    linha.textContent = texto;
    log.appendChild(linha);

    while (log.children.length > LIMITE_HISTORICO_VISUAL) {
        log.firstElementChild?.remove();
    }

    log.scrollTop = log.scrollHeight;
    window.setTimeout(() => linha.classList.remove("newest"), 700);
}

function formatarEvento(evento: TiposEventos): string {
    switch (evento.tipo) {
        case "AtaqueCriatura":
            return `${evento.nomeAtacante} (${formatarPosicao(evento.posicaoAtacante)}) atacou ${evento.nomeDefensor} (${formatarPosicao(evento.posicaoDefensor)}): ${evento.danoCausado} de dano (${evento.vidaAposDano} de vida).`;
        case "CriaturaDestruida":
            return `${evento.nomeCriatura} foi destruída em ${formatarPosicao(evento.posicaoCriatura)}.`;
        case "AtaqueDireto":
            return `${evento.nomeAtacante} (${formatarPosicao(evento.posicaoAtacante)}) atacou ${evento.nomeDefensor} diretamente: ${evento.danoCausado} de dano (${evento.vidaAposDano} de vida).`;
        case "AtaqueImpedido":
            return evento.motivo === "LinhaInvalida"
                ? `${evento.nomeCriatura} (${formatarPosicao(evento.posicaoAtacante)}) não atacou porque está na linha errada.`
                : `${evento.nomeCriatura} (${formatarPosicao(evento.posicaoAtacante)}) não pôde atacar diretamente no turno 1.`;
        case "PartidaEncerrada":
            return `Partida encerrada. ${evento.vencedorNome} venceu ${evento.derrotadoNome}.`;
    }
}

function formatarPosicao(posicao: Posicao): string {
    return `${posicao.linha}/${nomeColuna(posicao.coluna)}`;
}

function mensagemResultadoJogada(resultado: ReturnType<Partida["tentarJogarCarta"]>): string {
    switch (resultado) {
        case "Sucesso": return "Carta jogada.";
        case "ManaInsuficiente": return "Mana insuficiente. Sacrifique uma carta ou escolha uma opção mais barata.";
        case "CartaNaoEstaNaMao": return "A carta não está mais na sua mão.";
        case "PosicaoOcupada": return "Essa posição já está ocupada. Escolha um espaço vazio.";
        case "ForaDaFasePrincipal": return "Essa ação só pode ser feita durante o seu turno.";
    }
}

function mensagemResultadoSacrificio(resultado: ReturnType<Partida["tentarSacrificarCartaMao"]>): string {
    switch (resultado) {
        case "Sucesso": return "Sacrifício realizado.";
        case "ForaDaFasePrincipal": return "O sacrifício só pode ser feito durante o seu turno.";
        case "SacrificioJaRealizado": return "Você já utilizou o único sacrifício permitido neste turno.";
        case "CartaNaoEstaNaMao": return "Essa carta não está mais na sua mão.";
        case "CriaturaNaoEncontrada": return "Não existe criatura nessa posição.";
    }
}

function voltarAoSetup(): void {
    faseInterface = "setup";
    partida = null;
    humano = null;
    botJogador = null;
    bot = null;
    indiceCartaSelecionada = null;
    modoSacrificioCampo = false;
    processando = false;
    ajudaAberta = false;
    mensagemInterface = "";
    historico = [];
    renderizar();
}

function garantirPartida(): void {
    if (partida === null || humano === null || botJogador === null || bot === null) {
        throw new Error("Partida ainda não foi preparada.");
    }
}

function obterElemento<T extends HTMLElement>(id: string): T {
    const elemento = document.getElementById(id);
    if (elemento === null) {
        throw new Error(`Elemento #${id} não encontrado.`);
    }
    return elemento as T;
}

function nomeColuna(coluna: Coluna): string {
    switch (coluna) {
        case Coluna.Esquerda: return "esquerda";
        case Coluna.Meio: return "meio";
        case Coluna.Direita: return "direita";
    }
}

function iconeTipo(tipo: TipoAtaqueVisual): string {
    switch (tipo) {
        case "corpo-a-corpo": return "⚔";
        case "distancia": return "➶";
        case "magico": return "✦";
    }
}

function nomeTipo(tipo: TipoAtaqueVisual): string {
    switch (tipo) {
        case "corpo-a-corpo": return "Corpo a corpo";
        case "distancia": return "Distância";
        case "magico": return "Mágico";
    }
}

function classeTipoAtaque(tipo: TipoAtaqueVisual): string {
    switch (tipo) {
        case "corpo-a-corpo": return "type-melee";
        case "distancia": return "type-ranged";
        case "magico": return "type-magic";
    }
}

function duracaoAtaque(tipo: TipoAtaqueVisual): number {
    switch (tipo) {
        case "corpo-a-corpo": return DURACAO_MELEE_MS;
        case "distancia": return DURACAO_DISTANCIA_MS;
        case "magico": return DURACAO_MAGIA_MS;
    }
}

function centroElemento(elemento: HTMLElement): { x: number; y: number } {
    const retangulo = elemento.getBoundingClientRect();
    return {
        x: retangulo.left + retangulo.width / 2,
        y: retangulo.top + retangulo.height / 2
    };
}

async function aguardarAnimacao(animacao: Animation): Promise<void> {
    try {
        await animacao.finished;
    } catch {
        // A animação pode ser cancelada se o navegador desmontar o elemento.
    }
}

function escaparHtml(valor: string): string {
    return valor
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function ajustarDuracao(ms: number): number {
    return MOVIMENTO_REDUZIDO ? Math.min(ms, 90) : ms;
}

function esperar(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}
