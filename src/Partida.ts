import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { CartaCriatura } from "./CartaCriatura";
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
            console.log(`Mulligan negado para ${jogador.nome}.`);
            return false;
        }

        console.log(`${jogador.nome} realizou o Mulligan.`);
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

    public passarTurno(): void {

        if (this.estadoPartida !== 'FasePrincipal') {
            // Faço nada impedindo de usar passar turno mais de uma vez:
            return;
        }
        // Caso seja aqui eu executo as etapas normalmente:
        // Selecionando atacante e defensor:
        const jogadorAtacante = this.obterJogadorAtivo();
        const jogadorDefensor = this.obterJogadorDefensor();
        // Combate:
        this.executarFaseCombate(jogadorAtacante, jogadorDefensor);
        // Agora verifico logo após a fase de combate se o jogador defensor merreu:
        if (!jogadorDefensor.estaVivo()) {
            /**
             * Morrendo atualizo o estado da partida e encerro a função
             * que irá encerrar o loop, como o estado da partida foi atualizado.
             */
            this.estadoPartida = 'Encerrada';
            return;
        }
        /**
         * Caso contrario continuamos a partida normalmente aumentando o turno etc e tals.
         * Tudo nos conformes.
         */
        // Mudança de turno:
        this.executarFaseFinal(); // Aqui faz o this.__turnoAtual++;
        // Mudança de estado:
        this.estadoPartida = 'AguardandoTurno';
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

    public executarProximoTurno(): void {
        const podeComecar =
            this.estadoPartida === 'NaoIniciada' ||
            this.estadoPartida === 'Abertura' ||
            this.estadoPartida === 'AguardandoTurno';
        // Protegido contra ser chamado em uma fase principal já aberta:
        if (!podeComecar) {
            return;
        }

        console.log(`--- Turno: ${this.__turnoAtual} ---`);
        // Preparação + Compra:
        this.iniciarTurno();

        /**
         * Removi a capacidade de o modo automatico tomar decisões durante a partida.
         * Futuramente a IA vai usar esse metodo para fazer as jogadas que quiser.
         */
        
        this.passarTurno();
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

    // Antigo executarFasePrincipal. Foi descontinuado. Vou segurar ele aqui ainda por uns commits depois apago do codigo:
    // private executarFasePrincipal(jogador: Jogador): void {
        // Será descontinuado pois percebi que a maquina de estados que fiz é melhor do que simplemente usar um
        // metodo para rodar a main phase do TCG.
    //}

    private executarFaseCombate(atacante: Jogador, defensor: Jogador): void {
        for (const linha of ORDEM_DAS_LINHAS) {
            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        const alvoEncontrado = this.encontrarAlvo(coluna, defensor);
                        
                        if (alvoEncontrado != null) {
                            this.resolverCombate(criaturaAtacante, alvoEncontrado.criatura, alvoEncontrado.posicao, defensor);
                        }
                        else if (!defensor.tabuleiro.possuiCriaturasNoTabuleiro()) {
                            if (this.podeAtacarJogador()) {
                                console.log(`${criaturaAtacante.nome} atacou o ${defensor.nome} DIRETAMENTE com ${criaturaAtacante.ataque} de dano!`);
                                defensor.receberDano(criaturaAtacante.ataque);
                            } else {
                                console.log(`${criaturaAtacante.nome} não pode atacar o jogador diretamente no Turno 1.`);
                            }
                        }
                    } else {
                        console.log(`${criaturaAtacante.nome} não pode atacar na linha: ${linha}`);
                    }
                }
            }
        }
    }

    private executarFaseFinal(): void {
        this.__turnoAtual++;
    }

    // Auxiliares para o combate:
    private resolverCombate(atacante: Criatura, alvo: Criatura, posicaoAlvo: Posicao, defensor: Jogador): void {
        console.log(`${atacante.nome} ataca ${alvo.nome} com ${atacante.ataque} de dano!`);
        alvo.receberDano(atacante.ataque);
        
        if (!alvo.estaVivo()) {
            console.log(`${alvo.nome} foi destruída!`);
            defensor.tabuleiro.removerCriatura(posicaoAlvo.linha, posicaoAlvo.coluna);
        }
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