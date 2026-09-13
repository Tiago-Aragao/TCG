import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { Linha, Coluna } from "./Tabuleiro";

// Constantes para acabar com redundancias:
const ORDEM_DAS_LINHAS: Linha[] = ["frente", "fundo"];
const ORDEM_DAS_COLUNAS: Coluna[] = [0, 1, 2];

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
                // Peço ao Tabuleiro o que tem nessa coordenada exata:
                const criaturaAtacante = atacante.tabuleiro.obterCriatura(linha, coluna);
                // Checagem de segurança: Criatura morta ou inxistente nao ataca:
                if (criaturaAtacante != null && criaturaAtacante.estaVivo()) {
                    // Verifico se a criatura pode ou nao atacar a depender do alcance e posição:
                    if (this.podeAtacar(criaturaAtacante, linha)) {
                        // Poharadaria comendo solta:
                        this.resolverCombate(criaturaAtacante, defensor);
                    }
                    else {
                        console.log(`${criaturaAtacante.nome} não pode atacar na linha: ${linha}`);
                    }
                }
            }
        }
        this.avancarTurno();
    }

    private resolverCombate(criaturaAtacante: Criatura, defensor: Jogador): void {
    for (const linha of ORDEM_DAS_LINHAS) {
        for (const coluna of ORDEM_DAS_COLUNAS) {
            
            // Usamos o método do domínio, sem encostar nas arrays do tabuleiro
            const criaturaDefensora = defensor.tabuleiro.obterCriatura(linha, coluna);
            
            if (criaturaDefensora != null) {
                console.log(`${criaturaAtacante.nome} ataca ${criaturaDefensora.nome} com ${criaturaAtacante.ataque} de ataque!`);
                criaturaDefensora.receberDano(criaturaAtacante.ataque);
                console.log(`${criaturaDefensora.nome} está com ${criaturaDefensora.vida} de vida!`);
                
                if (!criaturaDefensora.estaVivo()) {
                    console.log(`${criaturaDefensora.nome} foi destruida!`);
                    // Passamos a coordenada exata de onde ela estava para remover
                    defensor.tabuleiro.removerCriatura(linha, coluna);
                }
                
                // Encerra o combate imediatamente após bater no primeiro alvo válido
                return;
            }
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