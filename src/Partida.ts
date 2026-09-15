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

    constructor(jogador1: Jogador, jogador2: Jogador) {
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.turnoAtual = 1;
    }

    public executarPartida(): Jogador | null {
        while (this.jogador1.estaVivo() && this.jogador2.estaVivo() && this.turnoAtual <= 100) {
            this.executarProximoTurno();
        }
        if (!this.jogador1.estaVivo()) {
            return this.jogador2;
        }
        if (!this.jogador2.estaVivo()) {
            return this.jogador1;
        }
        return null;
        
    }

    private podeAtacarJogador(): boolean {
        // Jogador1 não pode mais atacar o Jogador2 no turno 1:
        return this.turnoAtual > 1;
    }
    
    public executarProximoTurno(): void {
        console.log(`Turno: ${this.turnoAtual}`);
        
        const atacante = (this.turnoAtual % 2 !== 0) ? this.jogador1 : this.jogador2;
        const defensor = (this.turnoAtual % 2 !== 0) ? this.jogador2 : this.jogador1;

        for (const linha of ORDEM_DAS_LINHAS) {
            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    
                    // Verifica se a criatura está na linha certa para o seu tipo de ataque
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
                        // CAMPO VAZIO: Tentativa de Ataque Direto
                        else if (!defensor.tabuleiro.possuiCriaturasNoTabuleiro()) {
                            
                            // A única regra que impede o ataque direto de QUALQUER criatura é o Turno 1
                            if (this.podeAtacarJogador()) {
                                console.log(`${criaturaAtacante.nome} atacou o ${defensor.nome} DIRETAMENTE com ${criaturaAtacante.ataque} de dano!`);
                                defensor.receberDano(criaturaAtacante.ataque);
                                console.log(`${defensor.nome} | ${defensor.vidaAtual}/${defensor.vidaMaxima}`);
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
        this.avancarTurno();
    }

    private resolverCombate(atacante: Criatura, alvo: Criatura, posicaoAlvo: Posicao, defensor: Jogador): void {
        console.log(`${atacante.nome} ataca ${alvo.nome} com ${atacante.ataque} de ataque!`);
        alvo.receberDano(atacante.ataque);
        console.log(`${alvo.nome} está com ${alvo.vida} de vida!`);
        
        if (!alvo.estaVivo()) {
            console.log(`${alvo.nome} foi destruída!`);
            defensor.tabuleiro.removerCriatura(posicaoAlvo.linha, posicaoAlvo.coluna);
        }
    }

    private encontrarAlvo(colunaOrigem: Coluna, defensor: Jogador): Alvo | null {
        
        for (const linha of ORDEM_DAS_LINHAS) {
            let alvoMaisProximo: Criatura | null = null;
            let colunaDoAlvo: Coluna | null = null;
            let menorDistancia = Infinity; // Só para primeira comparação ser sempre verdadeira.

            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaDefensora = defensor.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaDefensora != null && criaturaDefensora.estaVivo()) {
                    // Verifico a distancia:
                    const distancia = Math.abs(colunaOrigem - coluna);
                    // Atualizo os dados:
                    if (distancia < menorDistancia) {
                        alvoMaisProximo = criaturaDefensora;
                        colunaDoAlvo = coluna;
                        menorDistancia = distancia;
                    }
                }
            }

            // Se achou alguém nesta linha, retorna imediatamente:
            if (alvoMaisProximo != null && colunaDoAlvo != null) {
                return {
                    criatura: alvoMaisProximo,
                    posicao: { linha, coluna: colunaDoAlvo }
                };
            }
        }
        // Campo vazio:
        return null;
    }

    private podeAtacar(possivelAtacante: Criatura, linha: Linha): boolean {
        switch(possivelAtacante.tipoAtaque) {
            case 'corpo-a-corpo':
                return linha === 'frente';
            case "distancia":
                return linha === 'fundo';
            case "magico":
                return true;
            // Tratamento de erro por qualquer bug a criatura não ataca:
            default:
                return false;
        }
    }
    
    private avancarTurno(): void {
        this.turnoAtual++;
    }

}