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

const DURACAO_PROJETIL_MS = 480;
const DURACAO_IMPACTO_MS = 220;
const PAUSA_ENTRE_EVENTOS_MS = 180;
const PAUSA_ACOES_BOT_MS = 420;

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) {
    throw new Error("Elemento #app não encontrado.");
}

let faseInterface: FaseInterface = "setup";
let partida: Partida | null = null;
let humano: Jogador | null = null;
let botJogador: Jogador | null = null;
let bot: BotSimples | null = null;
let indiceCartaSelecionada: number | null = null;
let modoSacrificioCampo = false;
let processando = false;
let mensagemInterface = "";
let historico: string[] = [];

renderizar();

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
        .map(([chave, deck]) => `<option value="${chave}">${deck.nome}</option>`)
        .join("");

    app.innerHTML = `
        <main class="setup-shell">
            <section class="setup-card panel">
                <div class="eyebrow">TCG — Playtest v0.1</div>
                <h1>Partida de teste</h1>
                <p class="setup-copy">
                    Escolha seu deck e o deck adversário. O oponente usa um bot simples,
                    criado apenas para colocar criaturas em campo e permitir o playtest.
                </p>

                <div class="setup-grid">
                    <label>
                        <span>Seu deck</span>
                        <select id="deck-humano">${opcoesDeck}</select>
                    </label>

                    <label>
                        <span>Deck do bot</span>
                        <select id="deck-bot">${opcoesDeck}</select>
                    </label>

                    <label>
                        <span>Quem começa</span>
                        <select id="iniciativa">
                            <option value="aleatoria">Aleatório</option>
                            <option value="humano">Você</option>
                            <option value="bot">Bot</option>
                        </select>
                    </label>
                </div>

                <button id="iniciar-partida" class="btn btn-primary btn-large">Iniciar partida</button>
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
    botJogador = new Jogador("Bot", deckBot);

    const humanoComeca = iniciativa === "humano"
        || (iniciativa === "aleatoria" && Math.random() < 0.5);

    partida = humanoComeca
        ? new Partida(humano, botJogador)
        : new Partida(botJogador, humano);

    bot = new BotSimples(botJogador);
    historico = [
        `Você escolheu o deck ${deckHumano.nome}.`,
        `O Bot usa o deck ${deckBot.nome}.`,
        `${humanoComeca ? "Você" : "Bot"} começa a partida.`
    ];
    mensagemInterface = "";
    indiceCartaSelecionada = null;
    modoSacrificioCampo = false;
    processando = false;

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
                <div class="eyebrow">Mão inicial</div>
                <h1>Mulligan</h1>
                <p>Você pode trocar toda a sua mão uma única vez.</p>

                <div class="hand hand-mulligan">
                    ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, false)).join("")}
                </div>

                <div class="mulligan-actions">
                    <button id="fazer-mulligan" class="btn btn-secondary">Trocar a mão</button>
                    <button id="manter-mao" class="btn btn-primary">Manter e jogar</button>
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
                <div class="eyebrow">Nova mão</div>
                <h1>Mulligan realizado</h1>
                <div class="hand hand-mulligan">
                    ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, false)).join("")}
                </div>
                <div class="mulligan-actions">
                    <button id="continuar-apos-mulligan" class="btn btn-primary">Começar partida</button>
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
            mensagemInterface = "Seu turno. Escolha suas ações e depois passe o turno.";
            renderizar();
            return;
        }

        mensagemInterface = "O Bot está jogando...";
        renderizar();
        await esperar(350);

        // O bot executa apenas a Fase Principal. A interface renderiza o campo
        // antes de pedir à Partida que resolva o combate. Assim conseguimos
        // reproduzir visualmente os eventos em ordem sem mexer nas regras.
        const acoes = bot!.executarAcoes(partida!);
        historico.push(...acoes);
        indiceCartaSelecionada = null;
        modoSacrificioCampo = false;
        mensagemInterface = "O Bot terminou as ações. Combate...";
        renderizar();
        await esperar(PAUSA_ACOES_BOT_MS);

        const eventos = partida!.passarTurno();
        await reproduzirEventosCombate(eventos, "bot");
        renderizar();

        if (eventos.some(evento => evento.tipo === "PartidaEncerrada")) {
            break;
        }

        await esperar(350);
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

    app.innerHTML = `
        <main class="game-shell">
            <header class="topbar panel">
                <div>
                    <span class="eyebrow">Playtest v0.1</span>
                    <strong>Turno ${partida!.turnoAtual}</strong>
                </div>
                <div class="turn-pill ${turnoHumano ? "is-player" : "is-bot"}">
                    ${partida!.estado === "Encerrada" ? "Fim de jogo" : `Turno: ${ativo.nome}`}
                </div>
                <button id="nova-partida-topo" class="btn btn-ghost">Nova partida</button>
            </header>

            <section class="battlefield panel">
                <div id="combat-feedback" class="combat-feedback" aria-live="polite"></div>
                ${htmlCabecalhoJogador(botJogador!, false)}
                ${htmlTabuleiro(botJogador!, false, false)}

                <div class="combat-divider">
                    <span>Campo de batalha</span>
                </div>

                ${htmlTabuleiro(humano!, true, controlesAtivos)}
                ${htmlCabecalhoJogador(humano!, true)}
            </section>

            <section class="lower-grid">
                <aside class="panel log-panel">
                    <div class="panel-title-row">
                        <h2>Eventos</h2>
                        <span>${historico.length}</span>
                    </div>
                    <div class="event-log" id="event-log">
                        ${historico.length === 0
                            ? '<p class="muted">A partida ainda não gerou eventos.</p>'
                            : historico.map(item => `<p>${escaparHtml(item)}</p>`).join("")}
                    </div>
                </aside>

                <section class="panel hand-panel">
                    <div class="panel-title-row">
                        <div>
                            <h2>Sua mão</h2>
                            <span class="muted">${humano!.mao.length} cartas · Deck: ${humano!.deck.tamanhoDeck()}</span>
                        </div>
                        <div class="mana-large">◆ ${humano!.mostrarMana}</div>
                    </div>

                    <div class="hand" id="mao-jogador">
                        ${humano!.mao.map((carta, indice) => htmlCartaMao(carta, indice, controlesAtivos)).join("")}
                    </div>

                    <div class="action-bar">
                        <div class="action-status">
                            ${htmlMensagemAcao(controlesAtivos)}
                        </div>
                        <div class="action-buttons">
                            <button id="sacrificar-mao" class="btn btn-secondary" ${!controlesAtivos || indiceCartaSelecionada === null ? "disabled" : ""}>
                                Sacrificar carta da mão
                            </button>
                            <button id="sacrificar-campo" class="btn ${modoSacrificioCampo ? "btn-warning" : "btn-secondary"}" ${!controlesAtivos ? "disabled" : ""}>
                                ${modoSacrificioCampo ? "Clique numa criatura" : "Sacrificar do campo"}
                            </button>
                            <button id="passar-turno" class="btn btn-primary" ${!controlesAtivos ? "disabled" : ""}>
                                Passar turno
                            </button>
                        </div>
                    </div>
                </section>
            </section>

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
    return `
        <div id="player-strip-${ehHumano ? "humano" : "bot"}" class="player-strip ${ehHumano ? "player-strip-human" : "player-strip-bot"}">
            <div>
                <strong>${escaparHtml(jogador.nome)}</strong>
                <span>${escaparHtml(nomeDeck)}</span>
            </div>
            <div class="player-stats">
                <span id="hp-${ehHumano ? "humano" : "bot"}" class="stat hp">♥ ${jogador.vidaAtual}</span>
                <span class="stat mana">◆ ${jogador.mostrarMana}</span>
                <span class="stat cards">▣ ${ehHumano ? jogador.mao.length : `${jogador.mao.length} na mão`}</span>
                <span class="stat deck">Deck ${jogador.deck.tamanhoDeck()}</span>
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

    return `
        <div class="board-row">
            <span class="row-label">${linha === "frente" ? "Frente" : "Fundo"}</span>
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
        return `
            <button class="board-slot empty ${classeInteracao}" data-linha="${posicao.linha}" data-coluna="${posicao.coluna}" ${interativo ? "" : "disabled"}>
                <span>vazio</span>
            </button>
        `;
    }

    return `
        <button class="board-slot creature-slot ${classeInteracao} ${classeSacrificio}" data-linha="${posicao.linha}" data-coluna="${posicao.coluna}" ${interativo ? "" : "disabled"}>
            <span class="mini-type">${iconeTipo(criatura.tipoAtaque)}</span>
            <strong>${escaparHtml(criatura.nome)}</strong>
            <span class="mini-stats"><b>⚔ ${criatura.ataque}</b><b>♥ <span data-vida-criatura>${criatura.vida}</span></b></span>
        </button>
    `;
}

function htmlCartaMao(carta: Carta, indice: number, interativo: boolean): string {
    const selecionada = indice === indiceCartaSelecionada;

    if (carta instanceof CartaCriatura) {
        return `
            <button class="game-card ${selecionada ? "selected" : ""}" data-indice-carta="${indice}" ${interativo ? "" : "disabled"}>
                <span class="card-cost">${carta.custoMana}</span>
                <span class="card-type-icon">${iconeTipo(carta.tipoAtaque)}</span>
                <strong class="card-name">${escaparHtml(carta.nome)}</strong>
                <span class="card-type">${nomeTipo(carta.tipoAtaque)}</span>
                <span class="card-stats">
                    <b>⚔ ${carta.ataque}</b>
                    <b>♥ ${carta.vida}</b>
                </span>
            </button>
        `;
    }

    return `
        <button class="game-card ${selecionada ? "selected" : ""}" data-indice-carta="${indice}" ${interativo ? "" : "disabled"}>
            <span class="card-cost">${carta.custoMana}</span>
            <strong class="card-name">${escaparHtml(carta.nome)}</strong>
            <span class="card-type">${escaparHtml(carta.tipoCarta)}</span>
        </button>
    `;
}

function htmlMensagemAcao(controlesAtivos: boolean): string {
    if (partida!.estado === "Encerrada") {
        return "Partida encerrada.";
    }

    if (!controlesAtivos) {
        return escaparHtml(mensagemInterface || "Aguardando...");
    }

    if (modoSacrificioCampo) {
        return "Clique em uma criatura do seu campo para sacrificá-la e ganhar +1 mana.";
    }

    if (indiceCartaSelecionada !== null) {
        const carta = humano!.mao[indiceCartaSelecionada];
        return carta
            ? `${escaparHtml(carta.nome)} selecionada. Clique em um espaço vazio para jogar ou sacrifique a carta.`
            : "Selecione uma carta.";
    }

    return escaparHtml(mensagemInterface || "Selecione uma carta da mão.");
}

function htmlFimDeJogo(): string {
    const vencedor = humano!.estaVivo() ? "Você venceu!" : "O Bot venceu.";
    return `
        <div class="game-over-backdrop">
            <div class="game-over panel">
                <div class="eyebrow">Partida encerrada</div>
                <h2>${vencedor}</h2>
                <p>Vida final: Você ${humano!.vidaAtual} · Bot ${botJogador!.vidaAtual}</p>
                <button id="nova-partida-overlay" class="btn btn-primary btn-large">Jogar novamente</button>
            </div>
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
    document.querySelector<HTMLButtonElement>("#nova-partida-overlay")?.addEventListener("click", voltarAoSetup);
}

function jogarCartaSelecionada(posicao: Posicao): void {
    if (indiceCartaSelecionada === null) {
        mensagemInterface = "Selecione uma carta da mão antes de escolher a posição.";
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
        mensagemInterface = "Carta jogada com sucesso.";
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
        mensagemInterface = `Sacrifício realizado. +${manaGerada} mana.`;
    } else {
        mensagemInterface = mensagemResultadoSacrificio(resultado);
    }

    renderizar();
}

function sacrificarDoCampo(posicao: Posicao): void {
    const criatura = humano!.tabuleiro.obterCriatura(posicao.linha, posicao.coluna);
    if (criatura === null) {
        mensagemInterface = "Não existe criatura nessa posição.";
        renderizar();
        return;
    }

    const nome = criatura.nome;
    const resultado = partida!.tentarSacrificarCriaturaCampo(posicao);

    if (resultado === "Sucesso") {
        historico.push(`Você sacrificou ${nome} do campo e ganhou +1 mana.`);
        modoSacrificioCampo = false;
        mensagemInterface = "Criatura sacrificada. +1 mana.";
    } else {
        mensagemInterface = mensagemResultadoSacrificio(resultado);
    }

    renderizar();
}

async function passarTurnoHumano(): Promise<void> {
    processando = true;
    indiceCartaSelecionada = null;
    modoSacrificioCampo = false;
    mensagemInterface = "Resolvendo combate...";

    // Renderizamos antes de resolver o combate. O DOM permanece mostrando
    // o estado pré-combate enquanto a Partida produz todos os eventos.
    renderizar();

    const eventos = partida!.passarTurno();
    await reproduzirEventosCombate(eventos, "humano");
    renderizar();

    if (partida!.estado === "Encerrada") {
        processando = false;
        renderizar();
        return;
    }

    await esperar(300);
    await continuarFluxoAutomatico();
}


async function reproduzirEventosCombate(eventos: TiposEventos[], ladoAtacante: LadoVisual): Promise<void> {
    const ladoDefensor: LadoVisual = ladoAtacante === "humano" ? "bot" : "humano";

    if (eventos.length === 0) {
        mostrarFeedbackCombate("Nenhum ataque neste combate.", "neutro");
        await esperar(450);
        limparFeedbackCombate();
        return;
    }

    for (const evento of eventos) {
        registrarEventoNoHistorico(evento);

        switch (evento.tipo) {
            case "AtaqueCriatura": {
                const origem = obterSlotVisual(ladoAtacante, evento.posicaoAtacante);
                const destino = obterSlotVisual(ladoDefensor, evento.posicaoDefensor);

                mostrarFeedbackCombate(
                    `${evento.nomeAtacante} → ${evento.nomeDefensor} · ${evento.danoCausado} de dano`,
                    "ataque"
                );

                await animarAtaque(origem, destino);
                atualizarVidaCriaturaVisual(destino, evento.vidaAposDano);
                await animarImpacto(destino);
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

                mostrarFeedbackCombate(
                    `${evento.nomeAtacante} → ${evento.nomeDefensor} · ${evento.danoCausado} de dano direto`,
                    "ataque-direto"
                );

                await animarAtaque(origem, destino);
                atualizarVidaJogadorVisual(ladoDefensor, evento.vidaAposDano);
                await animarImpacto(destino);
                break;
            }

            case "AtaqueImpedido": {
                const origem = obterSlotVisual(ladoAtacante, evento.posicaoAtacante);
                const texto = evento.motivo === "LinhaInvalida"
                    ? `${evento.nomeCriatura} não pode atacar dessa linha`
                    : `${evento.nomeCriatura} não pode atacar diretamente no turno 1`;

                mostrarFeedbackCombate(texto, "impedido");
                await animarAtaqueImpedido(origem);
                break;
            }

            case "PartidaEncerrada":
                mostrarFeedbackCombate(`${evento.vencedorNome} venceu a partida`, "fim");
                await esperar(650);
                break;
        }

        await esperar(PAUSA_ENTRE_EVENTOS_MS);
    }

    limparFeedbackCombate();
}

function obterSlotVisual(lado: LadoVisual, posicao: Posicao): HTMLElement | null {
    const seletorTabuleiro = lado === "humano" ? ".board-human" : ".board-bot";
    return document.querySelector<HTMLElement>(
        `${seletorTabuleiro} .board-slot[data-linha="${posicao.linha}"][data-coluna="${posicao.coluna}"]`
    );
}

async function animarAtaque(origem: HTMLElement | null, destino: HTMLElement | null): Promise<void> {
    if (origem === null || destino === null) {
        await esperar(DURACAO_PROJETIL_MS);
        return;
    }

    origem.classList.add("is-attacking");
    await esperar(110);

    const inicio = origem.getBoundingClientRect();
    const fim = destino.getBoundingClientRect();
    const inicioX = inicio.left + inicio.width / 2;
    const inicioY = inicio.top + inicio.height / 2;
    const fimX = fim.left + fim.width / 2;
    const fimY = fim.top + fim.height / 2;

    const projetil = document.createElement("div");
    projetil.className = "attack-projectile";
    projetil.style.left = `${inicioX}px`;
    projetil.style.top = `${inicioY}px`;
    document.body.appendChild(projetil);

    const animacao = projetil.animate(
        [
            { transform: "translate(-50%, -50%) translate(0px, 0px) scale(0.75)", opacity: 0.4 },
            { transform: `translate(-50%, -50%) translate(${fimX - inicioX}px, ${fimY - inicioY}px) scale(1.1)`, opacity: 1 }
        ],
        { duration: DURACAO_PROJETIL_MS, easing: "cubic-bezier(.2,.75,.25,1)", fill: "forwards" }
    );

    try {
        await animacao.finished;
    } catch {
        // A animação pode ser cancelada se o navegador desmontar o elemento.
    }

    projetil.remove();
    origem.classList.remove("is-attacking");
}

async function animarImpacto(destino: HTMLElement | null): Promise<void> {
    if (destino === null) {
        await esperar(DURACAO_IMPACTO_MS);
        return;
    }

    destino.classList.add("is-hit");
    await esperar(DURACAO_IMPACTO_MS);
    destino.classList.remove("is-hit");
}

async function animarDestruicao(slot: HTMLElement | null): Promise<void> {
    if (slot === null) {
        await esperar(360);
        return;
    }

    slot.classList.add("is-destroyed");
    await esperar(360);
    slot.classList.remove("creature-slot", "is-destroyed");
    slot.classList.add("empty", "slot-after-destruction");
    slot.innerHTML = "<span>destruído</span>";
}

async function animarAtaqueImpedido(slot: HTMLElement | null): Promise<void> {
    if (slot === null) {
        await esperar(480);
        return;
    }

    slot.classList.add("is-blocked");
    await esperar(480);
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
    if (hp !== null) {
        hp.textContent = `♥ ${vida}`;
    }
}

function mostrarFeedbackCombate(
    texto: string,
    tipo: "neutro" | "ataque" | "ataque-direto" | "destruicao" | "impedido" | "fim"
): void {
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
    log.scrollTop = log.scrollHeight;

    window.setTimeout(() => linha.classList.remove("newest"), 500);
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
        case "ManaInsuficiente": return "Mana insuficiente para jogar essa carta.";
        case "CartaNaoEstaNaMao": return "A carta não está mais na sua mão.";
        case "PosicaoOcupada": return "Essa posição já está ocupada.";
        case "ForaDaFasePrincipal": return "Essa ação só pode ser feita na Fase Principal.";
    }
}

function mensagemResultadoSacrificio(resultado: ReturnType<Partida["tentarSacrificarCartaMao"]>): string {
    switch (resultado) {
        case "Sucesso": return "Sacrifício realizado.";
        case "ForaDaFasePrincipal": return "O sacrifício só pode ser feito na Fase Principal.";
        case "SacrificioJaRealizado": return "Você já realizou o sacrifício permitido neste turno.";
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

function iconeTipo(tipo: CartaCriatura["tipoAtaque"]): string {
    switch (tipo) {
        case "corpo-a-corpo": return "⚔";
        case "distancia": return "➶";
        case "magico": return "✦";
    }
}

function nomeTipo(tipo: CartaCriatura["tipoAtaque"]): string {
    switch (tipo) {
        case "corpo-a-corpo": return "Corpo-a-corpo";
        case "distancia": return "Distância";
        case "magico": return "Mágico";
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

function esperar(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}
