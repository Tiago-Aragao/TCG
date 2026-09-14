import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { Linha, Coluna } from "./Tabuleiro";

// Constantes para acabar com redundancias:
const ORDEM_DAS_LINHAS: Linha[] = ["frente", "fundo"];
const ORDEM_DAS_COLUNAS: Coluna[] = [Coluna.Esquerda, Coluna.Meio, Coluna.Direita];

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
        
        const atacante = (this.turnoAtual % 2 !== 0) ? this.jogador1 : this.jogador2;
        const defensor = (this.turnoAtual % 2 !== 0) ? this.jogador2 : this.jogador1;

        for (const linha of ORDEM_DAS_LINHAS) {
            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        // Passamos a 'coluna' do atacante como referência de origem
                        this.resolverCombate(criaturaAtacante, coluna, defensor);
                    }
                    else {
                        console.log(`${criaturaAtacante.nome} não pode atacar da posição: ${linha}`);
                    }
                }
            }
        }
        this.avancarTurno();
    }

    private resolverCombate(criaturaAtacante: Criatura, colunaOrigem: Coluna, defensor: Jogador): void {
        for (const linha of ORDEM_DAS_LINHAS) {
            
            // Variáveis para guardar o "vencedor" da varredura atual
            let alvoMaisProximo: Criatura | null = null;
            let colunaDoAlvo: Coluna | null = null;
            let menorDistancia: number = Infinity;

            for (const coluna of ORDEM_DAS_COLUNAS) {
                const criaturaDefensora = defensor.tabuleiro.obterCriatura(linha, coluna);
                
                if (criaturaDefensora != null && criaturaDefensora.estaVivo()) {
                    
                    // A matemática pura de proximidade em 1D
                    const distancia = Math.abs(colunaOrigem - coluna);

                    // Se a distância for ESTRITAMENTE menor, atualiza. 
                    if (distancia < menorDistancia) {
                        alvoMaisProximo = criaturaDefensora;
                        colunaDoAlvo = coluna;
                        menorDistancia = distancia;
                    }
                }
            }

            if (alvoMaisProximo != null && colunaDoAlvo != null) {
                console.log(`${criaturaAtacante.nome} (Col ${colunaOrigem}) ataca ${alvoMaisProximo.nome} (Col ${colunaDoAlvo}) com ${criaturaAtacante.ataque} de ataque!`);
                alvoMaisProximo.receberDano(criaturaAtacante.ataque);
                console.log(`${alvoMaisProximo.nome} está com ${alvoMaisProximo.vida} de vida!`);
                
                if (!alvoMaisProximo.estaVivo()) {
                    console.log(`${alvoMaisProximo.nome} foi destruída!`);
                    defensor.tabuleiro.removerCriatura(linha, colunaDoAlvo);
                }
                
                // Combate resolvido, saímos da função para não varrer a linha de trás.
                return;
            }
        }
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