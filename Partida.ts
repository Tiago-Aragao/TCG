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
            this.executarTurno();
        }
        if (!this.jogador1.estaVivo()) {
            return this.jogador2;
        }
        if (!this.jogador2.estaVivo()) {
            return this.jogador1;
        }
        return null;
        
    }

    private executarTurno(): void {
        console.log(`Turno: ${this.turnoAtual}`);

        // Declaração das criaturas atacantes e defensoras:
        const atacante = (this.turnoAtual % 2 !== 0) ? this.jogador1 : this.jogador2;
        const defensor = (this.turnoAtual % 2 !== 0) ? this.jogador2 : this.jogador1;

        // Inicio do loop para procurar as criaturas atacantes:
        for (const linha of ORDEM_DAS_LINHAS) {
            for (const coluna of ORDEM_DAS_COLUNAS) {
                // Ao encontrar uma criatura atacante guardo ela:
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                // Checagem de segurança:
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    // Verifico se ela pode atacar da posição que esta alocada:
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        // Agora eu pego o alvo que ela irá atacar:
                        const alvoEncontrado = this.encontrarAlvo(coluna, defensor);
                        // Verificação de segurança:
                        if (alvoEncontrado != null) {
                            this.resolverCombate(
                                criaturaAtacante,
                                alvoEncontrado.criatura,
                                alvoEncontrado.posicao,
                                defensor
                            );
                        } else if (!defensor.tabuleiro.possuiCriaturasNoTabuleiro()) {
                            console.log(`${criaturaAtacante.nome} atacou o ${defensor.nome} com ${criaturaAtacante.ataque} de ataque!`);
                            defensor.receberDano(criaturaAtacante.ataque);
                            console.log(`${defensor.nome} | ${defensor.vidaAtual}/${defensor.vidaMaxima}`);
                        }
                    // Caso ela esteja na posição incorreta:
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