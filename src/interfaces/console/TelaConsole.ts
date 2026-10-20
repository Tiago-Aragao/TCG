import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Partida } from "./Partida";
import { Jogador } from "./Jogador";
import { Carta } from "./Carta";
import { CartaCriatura } from "./CartaCriatura";
import { Coluna, Linha, Posicao } from "./Tabuleiro";
import { TiposEventos } from "./tiposEventos";
import { ResultadoTentarJogarCarta, ResultadoTentarSacrificio } from "./tiposResultados";

/**
 * Porta mínima de entrada e saída usada pela TelaConsole.
 *
 * A implementação real usa o terminal.
 * Nos testes poderemos injetar uma implementação falsa.
 */

export interface PortaConsole {
    perguntar(pergunta: string): Promise<string>;
    escrever(texto?: string): void;
    limpar(): void;
    fechar(): void;
}

/**
 * Implementação real da porta usando o terminal do Node.
 */

export class ConsoleNode implements PortaConsole {

    private readonly leitor = readline.createInterface({ input, output });

    public async perguntar(pergunta: string): Promise<string> {
        return await this.leitor.question(pergunta);
    }

    public escrever(texto: string = ""): void {
        console.log(texto);
    }

    public limpar(): void {
        console.clear();
    }

    public fechar(): void {
        this.leitor.close();
    }
}

export class TelaConsole {

    private readonly partida: Partida;

    private readonly consoleIO: PortaConsole;
    constructor(partida: Partida, consoleIO: PortaConsole = new ConsoleNode()) {
        this.partida = partida;
        this.consoleIO = consoleIO;
    }
    /**
     * Ponto inicial da interface.
     */

    public async executar(): Promise<void> {
        try {
            this.consoleIO.limpar();
            this.consoleIO.escrever("==============================");
            this.consoleIO.escrever("        INÍCIO DA PARTIDA");
            this.consoleIO.escrever("==============================");
            this.consoleIO.escrever();
            await this.executarAbertura();
            while (this.partida.estado !== "Encerrada") {
                /*
                 * Se estivermos esperando um novo turno,
                 * ou ainda na abertura, pedimos ao domínio
                 * para iniciar o turno.
                 */
                if (this.partida.estado === "Abertura" || this.partida.estado === "AguardandoTurno") {
                    this.partida.iniciarTurno();
                }
                /*
                 * A TelaConsole só permite escolhas enquanto
                 * o domínio disser que estamos na FasePrincipal.
                 */
                if (this.partida.estado === "FasePrincipal") {
                    await this.executarFasePrincipal();
                    continue;
                }
                /*
                 * Se chegou aqui, a Partida está em algum estado
                 * que a TelaConsole não esperava.
                 */
                this.consoleIO.escrever(`Estado inesperado da partida: ${this.partida.estado}`);
                break;
            }
        } finally {
            this.consoleIO.fechar();
        }
    }

    // ============================================================
    // ABERTURA
    // ============================================================

    private async executarAbertura(): Promise<void> {
        if (this.partida.estado === "NaoIniciada") {
            this.partida.iniciarPartida();
        }
        /*
         * Se a partida já passou da abertura,
         * não há Mulligan para resolver.
         */
        if (this.partida.estado !== "Abertura") {
            return;
        }
        await this.oferecerMulligan(this.partida.jogador1);
        await this.oferecerMulligan(this.partida.jogador2);
    }

    private async oferecerMulligan(jogador: Jogador): Promise<void> {
        this.consoleIO.limpar();
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever(`MÃO INICIAL DE ${jogador.nome.toUpperCase()}`);
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever();
        this.mostrarMao(jogador);
        while (true) {
            const resposta = (await this.consoleIO.perguntar("\nDeseja fazer Mulligan? (S/N): ")).trim().toLowerCase();
            if (resposta === "n") {
                return;
            }
            if (resposta === "s") {
                const realizou = this.partida.solicitarMulligan(jogador);
                if (realizou) {
                    this.consoleIO.limpar();
                    this.consoleIO.escrever("==============================");
                    this.consoleIO.escrever("          NOVA MÃO");
                    this.consoleIO.escrever("==============================");
                    this.consoleIO.escrever();
                    this.mostrarMao(jogador);
                    await this.pausar();
                }
                return;
            }
            this.consoleIO.escrever("Digite S para sim ou N para não.");
        }
    }

    // ============================================================
    // FASE PRINCIPAL
    // ============================================================

    private async executarFasePrincipal(): Promise<void> {
        while (this.partida.estado === "FasePrincipal") {
            /*
             * A cada nova atualização visual,
             * limpamos a tela.
             */
            this.consoleIO.limpar();
            this.mostrarEstado();
            this.consoleIO.escrever();
            this.consoleIO.escrever("1 - Jogar carta");
            this.consoleIO.escrever("2 - Sacrificar");
            this.consoleIO.escrever("3 - Passar turno");
            const opcao = (await this.consoleIO.perguntar("\n> ")).trim();
            switch (opcao) {
                case "1":
                    await this.escolherCartaParaJogar();
                    await this.pausar();
                    break;
                case "2":
                    await this.executarMenuSacrificio();
                    await this.pausar();
                    break;
                case "3":
                    this.consoleIO.limpar();
                    this.executarPassagemDeTurno();
                    await this.pausar();
                    break;
                default:
                    this.consoleIO.escrever("Opção inválida.");
                    await this.pausar();
                    break;
            }
        }
    }

    private async escolherCartaParaJogar(): Promise<void> {
        const jogador = this.partida.obterJogadorAtivo();
        if (jogador.mao.length === 0) {
            this.consoleIO.escrever();
            this.consoleIO.escrever("Você não possui cartas na mão.");
            return;
        }
        this.consoleIO.escrever();
        this.mostrarMao(jogador);
        const resposta = await this.consoleIO.perguntar("\nEscolha o número da carta ou 0 para cancelar: ");
        const indiceEscolhido = this.converterParaInteiro(resposta);
        if (indiceEscolhido === null) {
            this.consoleIO.escrever("Número inválido.");
            return;
        }
        if (indiceEscolhido === 0) {
            return;
        }
        const indiceArray = indiceEscolhido - 1;
        if (indiceArray < 0 || indiceArray >= jogador.mao.length) {
            this.consoleIO.escrever("Essa carta não existe na sua mão.");
            return;
        }
        const cartaEscolhida = jogador.mao[indiceArray];
        /*
         * Neste momento o backend ainda implementa
         * apenas o uso de CartaCriatura.
         */
        if (!(cartaEscolhida instanceof CartaCriatura)) {
            this.consoleIO.escrever(`Cartas do tipo ${cartaEscolhida.tipoCarta} ` + "ainda não foram implementadas.");
            return;
        }
        const posicao = await this.escolherPosicao();
        if (posicao === null) {
            return;
        }
        const resultado = this.partida.tentarJogarCarta(cartaEscolhida, posicao);
        this.mostrarResultadoJogada(resultado);
    }

    private async executarMenuSacrificio(): Promise<void> {
        this.consoleIO.escrever();
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever("               SACRIFÍCIO");
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever("1 - Sacrificar carta da mão");
        this.consoleIO.escrever("    Criatura: +2 mana | Outras cartas: +1 mana");
        this.consoleIO.escrever("2 - Sacrificar criatura do campo (+1 mana)");
        this.consoleIO.escrever("0 - Cancelar");
        const opcao = (await this.consoleIO.perguntar("\n> ")).trim();
        switch (opcao) {
            case "1":
                await this.escolherCartaParaSacrificar();
                break;
            case "2":
                await this.escolherCriaturaCampoParaSacrificar();
                break;
            case "0":
                return;
            default:
                this.consoleIO.escrever("Opção inválida.");
                break;
        }
    }

    private async escolherCartaParaSacrificar(): Promise<void> {
        const jogador = this.partida.obterJogadorAtivo();
        if (jogador.mao.length === 0) {
            this.consoleIO.escrever();
            this.consoleIO.escrever("Você não possui cartas na mão para sacrificar.");
            return;
        }
        this.consoleIO.escrever();
        this.consoleIO.escrever("--- SUA MÃO ---");
        this.mostrarMao(jogador);
        const resposta = await this.consoleIO.perguntar(
            "\nEscolha o número da carta para sacrificar ou 0 para cancelar: "
        );
        const indiceEscolhido = this.converterParaInteiro(resposta);
        if (indiceEscolhido === null) {
            this.consoleIO.escrever("Número inválido.");
            return;
        }
        if (indiceEscolhido === 0) {
            return;
        }
        const indiceArray = indiceEscolhido - 1;
        if (indiceArray < 0 || indiceArray >= jogador.mao.length) {
            this.consoleIO.escrever("Essa carta não existe na sua mão.");
            return;
        }
        const cartaEscolhida = jogador.mao[indiceArray];
        const manaAntes = jogador.mostrarMana;
        const resultado = this.partida.tentarSacrificarCartaMao(cartaEscolhida);
        const manaGerada = jogador.mostrarMana - manaAntes;
        this.mostrarResultadoSacrificio(
            resultado,
            `${cartaEscolhida.nome} foi sacrificada da mão. Mana gerada: +${manaGerada}.`
        );
    }

    private async escolherCriaturaCampoParaSacrificar(): Promise<void> {
        const jogador = this.partida.obterJogadorAtivo();
        this.consoleIO.escrever();
        this.consoleIO.escrever("--- SEU TABULEIRO ---");
        this.mostrarTabuleiro(jogador);
        const posicao = await this.escolherPosicao();
        if (posicao === null) {
            return;
        }
        /*
         * Guardamos a criatura antes de solicitar o sacrifício,
         * porque em caso de sucesso ela será removida do tabuleiro.
         */
        const criaturaEscolhida = jogador.tabuleiro.obterCriatura(
            posicao.linha,
            posicao.coluna
        );
        const manaAntes = jogador.mostrarMana;
        const resultado = this.partida.tentarSacrificarCriaturaCampo(posicao);
        const manaGerada = jogador.mostrarMana - manaAntes;
        const nomeCriatura = criaturaEscolhida?.nome ?? "Criatura";
        this.mostrarResultadoSacrificio(
            resultado,
            `${nomeCriatura} foi sacrificada do campo. Mana gerada: +${manaGerada}.`
        );
    }

    private async escolherPosicao(): Promise<Posicao | null> {
        this.consoleIO.escrever();
        this.consoleIO.escrever("Escolha a linha:");
        this.consoleIO.escrever("1 - Frente");
        this.consoleIO.escrever("2 - Fundo");
        this.consoleIO.escrever("0 - Cancelar");
        const respostaLinha = await this.consoleIO.perguntar("\n> ");
        const numeroLinha = this.converterParaInteiro(respostaLinha);
        if (numeroLinha === 0) {
            return null;
        }
        let linha: Linha;
        if (numeroLinha === 1) {
            linha = "frente";
        } else if (numeroLinha === 2) {
            linha = "fundo";
        } else {
            this.consoleIO.escrever("Linha inválida.");
            return null;
        }
        this.consoleIO.escrever();
        this.consoleIO.escrever("Escolha a coluna:");
        this.consoleIO.escrever("1 - Esquerda");
        this.consoleIO.escrever("2 - Meio");
        this.consoleIO.escrever("3 - Direita");
        this.consoleIO.escrever("0 - Cancelar");
        const respostaColuna = await this.consoleIO.perguntar("\n> ");
        const numeroColuna = this.converterParaInteiro(respostaColuna);
        if (numeroColuna === 0) {
            return null;
        }
        let coluna: Coluna;
        switch (numeroColuna) {
            case 1:
                coluna = Coluna.Esquerda;
                break;
            case 2:
                coluna = Coluna.Meio;
                break;
            case 3:
                coluna = Coluna.Direita;
                break;
            default:
                this.consoleIO.escrever("Coluna inválida.");
                return null;
        }
        return { linha, coluna };
    }

    private executarPassagemDeTurno(): void {
        const eventos = this.partida.passarTurno();
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever("                COMBATE");
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever();
        if (eventos.length === 0) {
            this.consoleIO.escrever("Nenhum acontecimento durante o combate.");
        } else {
            this.mostrarEventos(eventos);
        }
        this.consoleIO.escrever();
        this.consoleIO.escrever("========================================");
    }

    // ============================================================
    // ESTADO DA PARTIDA
    // ============================================================

    private mostrarEstado(): void {
        const jogadorAtivo = this.partida.obterJogadorAtivo();
        const jogadorDefensor = this.partida.obterJogadorDefensor();
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever(`TURNO ${this.partida.turnoAtual}`);
        this.consoleIO.escrever(`Jogador ativo: ${jogadorAtivo.nome}`);
        this.consoleIO.escrever("========================================");
        this.consoleIO.escrever();
        this.consoleIO.escrever(jogadorAtivo.nome);
        this.consoleIO.escrever(`Vida: ${jogadorAtivo.vidaAtual}`);
        this.consoleIO.escrever(`Mana: ${jogadorAtivo.mostrarMana}`);
        this.consoleIO.escrever();
        this.consoleIO.escrever(jogadorDefensor.nome);
        this.consoleIO.escrever(`Vida: ${jogadorDefensor.vidaAtual}`);
        this.consoleIO.escrever();
        this.consoleIO.escrever(`--- TABULEIRO DE ${jogadorAtivo.nome} ---`);
        this.mostrarTabuleiro(jogadorAtivo);
        this.consoleIO.escrever();
        this.consoleIO.escrever(`--- TABULEIRO DE ${jogadorDefensor.nome} ---`);
        this.mostrarTabuleiro(jogadorDefensor);
        this.consoleIO.escrever();
        this.consoleIO.escrever(`--- MÃO DE ${jogadorAtivo.nome} ---`);
        this.mostrarMao(jogadorAtivo);
    }

    private mostrarMao(jogador: Jogador): void {
        if (jogador.mao.length === 0) {
            this.consoleIO.escrever("(mão vazia)");
            return;
        }
        jogador.mao.forEach((carta, indice) => {
            this.consoleIO.escrever(`${indice + 1}\n${this.formatarCarta(carta)}`);
        });
    }

    private mostrarTabuleiro(jogador: Jogador): void {
        this.consoleIO.escrever(`Frente: ${this.formatarLinhaTabuleiro(jogador, "frente")}`);
        this.consoleIO.escrever(`Fundo : ${this.formatarLinhaTabuleiro(jogador, "fundo")}`);
    }

    private formatarLinhaTabuleiro(jogador: Jogador, linha: Linha): string {
        const esquerda = jogador.tabuleiro.obterCriatura(linha, Coluna.Esquerda);
        const meio = jogador.tabuleiro.obterCriatura(linha, Coluna.Meio);
        const direita = jogador.tabuleiro.obterCriatura(linha, Coluna.Direita);
        return (
            `${this.formatarCriaturaTabuleiro(esquerda)} ` +
            `${this.formatarCriaturaTabuleiro(meio)} ` +
            `${this.formatarCriaturaTabuleiro(direita)}`
        );
    }

    private formatarCriaturaTabuleiro(criatura: { nome: string; ataque: number; vida: number } | null): string {
        if (criatura === null) {
            return "[ vazio ]";
        }
        return `[ ${criatura.nome} ${criatura.ataque}/${criatura.vida} ]`;
    }

    private formatarCarta(carta: Carta): string {
        if (carta instanceof CartaCriatura) {
            return `${carta.nome} | ${carta.custoMana} mana | ${carta.ataque}/${carta.vida} | ${carta.tipoAtaque}`;
        }
        return `${carta.nome} | ${carta.custoMana} mana | ${carta.tipoCarta}`;
    }

    // ============================================================
    // RESULTADOS E EVENTOS
    // ============================================================

    private mostrarResultadoJogada(resultado: ResultadoTentarJogarCarta): void {
        this.consoleIO.escrever();
        switch (resultado) {
            case "Sucesso":
                this.consoleIO.escrever("Carta jogada com sucesso.");
                break;
            case "ManaInsuficiente":
                this.consoleIO.escrever("Mana insuficiente.");
                break;
            case "CartaNaoEstaNaMao":
                this.consoleIO.escrever("A carta não está na mão do jogador ativo.");
                break;
            case "PosicaoOcupada":
                this.consoleIO.escrever("Essa posição do tabuleiro já está ocupada.");
                break;
            case "ForaDaFasePrincipal":
                this.consoleIO.escrever("Essa ação só pode ser realizada durante a Fase Principal.");
                break;
        }
    }

    private mostrarResultadoSacrificio(
        resultado: ResultadoTentarSacrificio,
        mensagemSucesso: string
    ): void {
        this.consoleIO.escrever();
        switch (resultado) {
            case "Sucesso":
                this.consoleIO.escrever(mensagemSucesso);
                break;
            case "ForaDaFasePrincipal":
                this.consoleIO.escrever(
                    "O sacrifício só pode ser realizado durante a Fase Principal."
                );
                break;
            case "SacrificioJaRealizado":
                this.consoleIO.escrever(
                    "Você já realizou o sacrifício permitido neste turno."
                );
                break;
            case "CartaNaoEstaNaMao":
                this.consoleIO.escrever(
                    "A carta escolhida não está na mão do jogador ativo."
                );
                break;
            case "CriaturaNaoEncontrada":
                this.consoleIO.escrever(
                    "Não existe uma criatura nessa posição para sacrificar."
                );
                break;
        }
    }

    private mostrarEventos(eventos: TiposEventos[]): void {
        for (const evento of eventos) {
            switch (evento.tipo) {
                case "AtaqueCriatura":
                    this.consoleIO.escrever(
                        `${evento.nomeAtacante} atacou ` +
                        `${evento.nomeDefensor}, causando ` +
                        `${evento.danoCausado} de dano. ` +
                        `Vida restante: ${evento.vidaAposDano}.`
                    );
                    break;
                case "CriaturaDestruida":
                    this.consoleIO.escrever(`${evento.nomeCriatura} foi destruída!`);
                    break;
                case "AtaqueDireto":
                    this.consoleIO.escrever(
                        `${evento.nomeAtacante} atacou ` +
                        `${evento.nomeDefensor} diretamente, ` +
                        `causando ${evento.danoCausado} de dano. ` +
                        `Vida: ${evento.vidaAposDano}.`
                    );
                    break;
                case "AtaqueImpedido":
                    if (evento.motivo === "LinhaInvalida") {
                        this.consoleIO.escrever(`${evento.nomeCriatura} não pode atacar a partir dessa linha.`);
                    }
                    if (evento.motivo === "InvalidoTurno1") {
                        this.consoleIO.escrever(`${evento.nomeCriatura} não pode atacar diretamente no turno 1.`);
                    }
                    break;
                case "PartidaEncerrada":
                    this.consoleIO.escrever();
                    this.consoleIO.escrever("========================================");
                    this.consoleIO.escrever("            PARTIDA ENCERRADA");
                    this.consoleIO.escrever("========================================");
                    this.consoleIO.escrever(`Vencedor: ${evento.vencedorNome}`);
                    this.consoleIO.escrever(`Derrotado: ${evento.derrotadoNome}`);
                    break;
            }
        }
    }

    // ============================================================
    // UTILITÁRIOS DA INTERFACE
    // ============================================================

    private async pausar(): Promise<void> {
        await this.consoleIO.perguntar("\nPressione ENTER para continuar...");
    }

    private converterParaInteiro(valor: string): number | null {
        const numero = Number(valor.trim());
        if (!Number.isInteger(numero)) {
            return null;
        }
        return numero;
    }
}