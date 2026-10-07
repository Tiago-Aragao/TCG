import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { CartaCriatura } from "./CartaCriatura";
import { TiposEventos } from "./tiposEventos";
import { Linha, Coluna, Posicao } from "./Tabuleiro";
import { ResultadoTentarJogarCarta } from "./tiposResultados";

const ORDEM_DAS_LINHAS: Linha[] = ["frente", "fundo"] as const;
const ORDEM_DAS_COLUNAS: Coluna[] = [Coluna.Esquerda, Coluna.Meio, Coluna.Direita] as const;

// Famosos Types:
export type Alvo = {
    criatura: Criatura,
    posicao: Posicao
}
export type EstadoDaPartida =
    | "NaoIniciada"
    | "Abertura"
    | "FasePrincipal"
    | "AguardandoTurno"
    | "Encerrada";

// Classe Partida:
export class Partida {
    
    public readonly jogador1: Jogador;
    public readonly jogador2: Jogador;
    private __turnoAtual: number;
    
    private estadoPartida: EstadoDaPartida = "NaoIniciada";
    private mulligansRealizados: Set<Jogador> = new Set();
    
    // Construtor da Classe:
    constructor(jogador1: Jogador, jogador2: Jogador) {
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.__turnoAtual = 1;
    }

    // Meu getters e leitores de estado:
    public get estado(): EstadoDaPartida {
        return this.estadoPartida;
    }

    public get turnoAtual(): number {
        return this.__turnoAtual;
    }

    public obterJogadorAtivo(): Jogador {
        return (this.__turnoAtual % 2 !== 0) ? this.jogador1 : this.jogador2;
    }

    public obterJogadorDefensor(): Jogador {
        return (this.__turnoAtual % 2 !== 0) ? this.jogador2 : this.jogador1;
    }

    // Metodos publicos que serão chamados pela API:
    public iniciarPartida(): void {
        // Travo varias chamadas:
        if (this.estadoPartida !== 'NaoIniciada') {
            return;
        }
        this.jogador1.comprarMaoInicial();
        this.jogador2.comprarMaoInicial();
        this.estadoPartida = 'Abertura';
    }

    public solicitarMulligan(jogador: Jogador): boolean {
        // Valido se o jogador está na partida (apenas segurança para evitar bugs):
        const participaDaPartida = jogador === this.jogador1 || jogador === this.jogador2;

        if (!participaDaPartida || this.estadoPartida !== "Abertura" || this.mulligansRealizados.has(jogador)) {
            return false;
        }

        jogador.fazerMulliganEuropeu();

        this.mulligansRealizados.add(jogador);
        return true;
    }

    public iniciarTurno(): void {
        // Agora uso o meu state para regular o que antes era um bool:
        if (this.estadoPartida === 'NaoIniciada') {
            this.iniciarPartida();
        }

        // Verifico aqui em vez dentro do if deixando mais legivel:
        const podeIniciarTurno = (this.estadoPartida === "Abertura" || this.estadoPartida === "AguardandoTurno");
        if (!podeIniciarTurno) {
            return;
        }
        // Se não eu pego o jgoador ativo:
        const jogadorAtivo = this.obterJogadorAtivo();
        // Gero mana:
        this.executarFasePreparacao(jogadorAtivo); // chama o jogador.gerarManaTurno
        this.executarFaseCompra(jogadorAtivo);
        // Iniciando a fase principal:
        this.estadoPartida = "FasePrincipal";
    }

    public tentarJogarCarta(cartaEscolhida: CartaCriatura, posicao: Posicao): ResultadoTentarJogarCarta {
        /**
         * Só pode ocorrer na fasePrincipal.
         * Deve permitir diversas chamadas para o Jogador jogar quantas cartas quiser e tiver mana para jogar.
         * Por enquanto retorna um bool mas posteriormente vai retornar um type criado por mim exclusivo para o tratamento de erro
        adequado.
         */
        // Verifico que só pode funcionar na FasePrincipal:
        if (this.estadoPartida !== "FasePrincipal") {
            /**
             * Só pode ocorrer durante a FasePrincipal.
             * Pode ser chamado diversas vezes durante o mesmo turno,
             * enquanto o jogador possuir cartas e recursos para jogar.
             *
             * Retorna um resultado de domínio indicando sucesso
             * ou o motivo pelo qual a jogada foi recusada.
             */
            // Mudança feita com sucesso:
            return 'ForaDaFasePrincipal';
        }
        const jogadorAtivo = this.obterJogadorAtivo();
        return jogadorAtivo.jogarCartaMao(cartaEscolhida, posicao);
    }

    public passarTurno(): TiposEventos[] {

        if (this.estadoPartida !== 'FasePrincipal') {
            // Faço nada impedindo de usar passar turno mais de uma vez e retornando um array vazio (nenhum evento):
            return [];
        }
        // Caso seja aqui eu executo as etapas normalmente:
        // Selecionando atacante e defensor:
        const jogadorAtacante = this.obterJogadorAtivo();
        const jogadorDefensor = this.obterJogadorDefensor();
        // Combate e guardando eventos:
        const eventos = this.executarFaseCombate(jogadorAtacante, jogadorDefensor);
        // Agora verifico logo após a fase de combate se o jogador defensor merreu:
        if (!jogadorDefensor.estaVivo()) {
            /**
             * Morrendo atualizo o estado da partida e encerro a função
             * que irá encerrar o loop, como o estado da partida foi atualizado.
             */
            eventos.push({
                tipo: "PartidaEncerrada",
                vencedorNome: jogadorAtacante.nome,
                derrotadoNome: jogadorDefensor.nome
            });
            // Mudo o estado da partida:
            this.estadoPartida = 'Encerrada';
            return eventos; // retorno encerrando a função.
        }
        /**
         * Caso contrario continuamos a partida normalmente aumentando o turno etc e tals.
         * Tudo nos conformes.
         */
        // Mudança de turno:
        this.executarFaseFinal(); // Aqui faz o this.__turnoAtual++;
        // Mudança de estado:
        this.estadoPartida = 'AguardandoTurno';
        //
        return eventos;
    }

    // Meus loops automaticos:
    public executarPartida(): Jogador | null {
        /*
         * Não permito que o modo automático assuma uma
         * partida no meio de uma FasePrincipal interativa.
         */
        if (this.estadoPartida === "FasePrincipal") {
            return null;
        }

        // Caso passe continuo:
        while (this.estadoPartida !== "Encerrada" && this.__turnoAtual <= 100) {
            this.executarProximoTurno();
        }
        if (!this.jogador1.estaVivo()) return this.jogador2;
        if (!this.jogador2.estaVivo()) return this.jogador1;
        return null;
    }

    // Este metodo eu usarei para o fluxo automatico:
    public executarProximoTurno(): TiposEventos[] {
        const podeComecar =
            this.estadoPartida === 'NaoIniciada' ||
            this.estadoPartida === 'Abertura' ||
            this.estadoPartida === 'AguardandoTurno';
        // Protegido contra ser chamado em uma fase principal já aberta:
        
        if (!podeComecar) {
            // retorno um array vazio:
            return [];
        }

        // Preparação + Compra:
        this.iniciarTurno();

        /**
        * Removi a capacidade de o modo automatico tomar decisões durante a partida.
        * Futuramente a IA vai usar esse metodo para fazer as jogadas que quiser.
        */
        return this.passarTurno();
    }

    // Motores internos e completamente privados:
    private executarFasePreparacao(jogador: Jogador): void {
        jogador.gerarManaTurno(this.__turnoAtual);
    }

    private executarFaseCompra(jogador: Jogador): void {
        if (this.__turnoAtual > 1) {
            jogador.comprarCarta();
        }
    }

    private executarFaseCombate(atacante: Jogador, defensor: Jogador): TiposEventos[] {
        // Crio aonde os eventos serão armazenados:
        const eventos: TiposEventos[] = [];
        // Inicio do loop:
        for (const linha of ORDEM_DAS_LINHAS) { // Inicio do primeiro for.
            for (const coluna of ORDEM_DAS_COLUNAS) { // Inicio do for concatenado.
                // Pego quem será a criatura atacante:
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                // Se criatura está no espaço e está viva:
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        // Reconhe o primeiro alvo:
                        const alvoEncontrado = this.encontrarAlvo(coluna, defensor);
                        // Valida o alvo:
                        if (alvoEncontrado != null) {
                            // Caso alvo seja valido guardo o resultado de resolver combate dentro de eventos:
                            eventos.push(...this.resolverCombate(criaturaAtacante, alvoEncontrado.criatura, alvoEncontrado.posicao, defensor));
                        }
                        else if (!defensor.tabuleiro.possuiCriaturasNoTabuleiro()) {
                            // Caso não haja mais criaturas no tabuleiro verifico se o jogador pode receber o ataque:
                            if (this.podeAtacarJogador()) {
                                defensor.receberDano(criaturaAtacante.ataque);
                                eventos.push({
                                    tipo: "AtaqueDireto",
                                    nomeAtacante: criaturaAtacante.nome,
                                    nomeDefensor: defensor.nome,
                                    danoCausado: criaturaAtacante.ataque,
                                    vidaAposDano: defensor.vidaAtual
                                });
                            } else {
                                // Guardo o evento do impedimento:
                                eventos.push({
                                    tipo: "AtaqueImpedido",
                                    nomeCriatura: criaturaAtacante.nome,
                                    motivo: "InvalidoTurno1"
                                });
                            }
                        }
                    } else {
                        // Guardo o evento do impedimento:
                        eventos.push({
                            tipo: "AtaqueImpedido",
                            nomeCriatura: criaturaAtacante.nome,
                            motivo: "LinhaInvalida"
                        });
                    }
                }
            }
        }
        return eventos;
    }

    private executarFaseFinal(): void {
        this.__turnoAtual++;
    }

    // Auxiliares para o combate:
    private resolverCombate(atacante: Criatura, alvo: Criatura, posicaoAlvo: Posicao, defensor: Jogador): TiposEventos[] {
        
        // Crio uma lista de eventos:
        const eventos: TiposEventos[] = [];
        alvo.receberDano(atacante.ataque);
        // Após ataque bem sucedido dou uma guardada em eventos:
        eventos.push({
            tipo: "AtaqueCriatura",
            nomeAtacante: atacante.nome,
            nomeDefensor: alvo.nome,
            danoCausado: atacante.ataque,
            vidaAposDano: alvo.vida
        });

        // Caso alvo morra:
        if (!alvo.estaVivo()) {
            defensor.tabuleiro.removerCriatura(posicaoAlvo.linha, posicaoAlvo.coluna); // Removo a criatura do tabuleiro.
            // Guardo o evento da criatura destruida em eventos:
            eventos.push ({
                tipo: "CriaturaDestruida",
                nomeCriatura: alvo.nome
            });
        }
        // Retorno os evento/eventos para serem consumidos pela UI:
        return eventos;
    }

    private podeAtacarJogador(): boolean {
        return this.__turnoAtual > 1;
    }

    private encontrarAlvo(colunaOrigem: Coluna, defensor: Jogador): Alvo | null {
        for (const linha of ORDEM_DAS_LINHAS) {
            let alvoMaisProximo: Criatura | null = null;
            let colunaDoAlvo: Coluna | null = null;
            let menorDistancia = Infinity;

            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaDefensora = defensor.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaDefensora != null && criaturaDefensora.estaVivo()) {
                    const distancia = Math.abs(colunaOrigem - coluna);
                    if (distancia < menorDistancia) {
                        alvoMaisProximo = criaturaDefensora;
                        colunaDoAlvo = coluna;
                        menorDistancia = distancia;
                    }
                }
            }

            if (alvoMaisProximo != null && colunaDoAlvo != null) {
                return { criatura: alvoMaisProximo, posicao: { linha, coluna: colunaDoAlvo } };
            }
        }
        return null;
    }

    private podeAtacar(possivelAtacante: Criatura, linha: Linha): boolean {
        switch(possivelAtacante.tipoAtaque) {
            case 'corpo-a-corpo': return linha === 'frente';
            case "distancia": return linha === 'fundo';
            case "magico": return true;
            default: return false;
        }
    }
}