import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { Linha, Coluna, Posicao } from "./Tabuleiro";

// Constantes para acabar com redundancias:
const ORDEM_DAS_LINHAS: Linha[] = ["frente", "fundo"] as const;
const ORDEM_DAS_COLUNAS: Coluna[] = [Coluna.Esquerda, Coluna.Meio, Coluna.Direita] as const;

// Melhorar a legibilidade criando um alvo:
export type Alvo = {
    criatura: Criatura,
    posicao: Posicao
}

export class Partida {
    public readonly jogador1: Jogador;
    public readonly jogador2: Jogador;
    public turnoAtual: number;
    // Atributos para gerenciar Mulligans:
    private mulligansRealizados: Set<Jogador> = new Set();
    private aberturaEncerrada: boolean = false; // prevenir que o mulligan ocorra no turno 1 em vez de antes do primiero turno.
    // Controle de inicio de Partida:
    private partidaIniciada: boolean = false;

    constructor(jogador1: Jogador, jogador2: Jogador) {
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.turnoAtual = 1;
    }
    
    public iniciarPartida(): void {
        if (this.partidaIniciada) {
            return;
        }

        this.jogador1.comprarMaoInicial();
        this.jogador2.comprarMaoInicial();

        this.partidaIniciada = true;
    }

    public executarPartida(): Jogador | null {
        if (!this.partidaIniciada) {
            this.iniciarPartida();
        }
        
        // Aqui futuramente vira o solicitarMulligan(Jogador); caso algum queira mulligar

        while (this.jogador1.estaVivo() && this.jogador2.estaVivo() && this.turnoAtual <= 100) {
            this.executarProximoTurno();
        }
        
        if (!this.jogador1.estaVivo()) return this.jogador2;
        if (!this.jogador2.estaVivo()) return this.jogador1;
        return null;
    }
    
    public executarProximoTurno(): void {
        if (!this.partidaIniciada) {
            this.iniciarPartida();
        }

        console.log(`--- Turno: ${this.turnoAtual} ---`);

        if (!this.aberturaEncerrada) {
            this.aberturaEncerrada = true;
        }

        const atacante = (this.turnoAtual % 2 !== 0)? this.jogador1:this.jogador2;
        const defensor = (this.turnoAtual % 2 !== 0)? this.jogador2:this.jogador1;

        this.executarFasePreparacao(atacante);
        this.executarFaseCompra(atacante);
        this.executarFasePrincipal(atacante);
        this.executarFaseCombate(atacante, defensor);
        this.executarFaseFinal();
    }

    private executarFasePreparacao(jogador: Jogador): void {
        // Futuramente resolver efeitos de fase de preparação.
    }

    private executarFaseCompra(jogador: Jogador): void {
        // Jogador 1 não compra no primeiro turno:
        if (this.turnoAtual > 1) {
            jogador.comprarCarta();
        }
    }

    public solicitarMulligan(jogador: Jogador): boolean {
        if (!this.partidaIniciada || this.aberturaEncerrada || this.mulligansRealizados.has(jogador)) {
            console.log(`Mulligan negado para ${jogador.nome}.`);
            return false;
        }

        console.log(`${jogador.nome} realizou o Mulligan.`);
        jogador.fazerMulliganEuropeu();

        this.mulligansRealizados.add(jogador);
        return true;
    }

    private executarFasePrincipal(jogador: Jogador): void {
        // Futuramenet gastar mana, baixar criaturas, usar magias etc.
    }

    private executarFaseCombate(atacante: Jogador, defensor: Jogador): void {
        for (const linha of ORDEM_DAS_LINHAS) {
            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        const alvoEncontrado = this.encontrarAlvo(coluna, defensor);
                        
                        if (alvoEncontrado != null) {
                            this.resolverCombate(
                                criaturaAtacante,
                                alvoEncontrado.criatura,
                                alvoEncontrado.posicao,
                                defensor
                            );
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
        // Futuramente realizar operações para encerrar ou ativar efeitos que dependem dessa fase.
        this.turnoAtual++;
    }

    
    private podeAtacarJogador(): boolean {
        return this.turnoAtual > 1;
    }

    private resolverCombate(atacante: Criatura, alvo: Criatura, posicaoAlvo: Posicao, defensor: Jogador): void {
        console.log(`${atacante.nome} ataca ${alvo.nome} com ${atacante.ataque} de dano!`);
        alvo.receberDano(atacante.ataque);
        
        if (!alvo.estaVivo()) {
            console.log(`${alvo.nome} foi destruída!`);
            defensor.tabuleiro.removerCriatura(posicaoAlvo.linha, posicaoAlvo.coluna);
        }
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