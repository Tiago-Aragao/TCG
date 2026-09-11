import { Jogador } from "./Jogador";
import { Criatura } from "./Criatura";
import { Linha, Coluna } from "./Tabuleiro";

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

    private executarTurno():void {
        console.log(`Turno: ${this.turnoAtual}`);
        // Definindo quem é o atacante e quem é o defensor baseado no turno:
        const atacante = (this.turnoAtual % 2 !== 0) ? this.jogador1 : this.jogador2;
        const defensor = (this.turnoAtual % 2 !== 0) ? this.jogador2 : this.jogador1;
        // Agora descubro quem é o monstro que vai atacar:
        for(let i=0;i<3;i++) {
            const criaturaAtacante = atacante.tabuleiro.frente[i];
            // Se o atacante existir chamo a fase de combate:
            if (criaturaAtacante != null) {
                this.resolverCombate(criaturaAtacante, defensor);
            }
        }
        this.avancarTurno();
    }

    private resolverCombate(criaturaAtacante: Criatura, defensor: Jogador): void {
        for (let i=0;i<3;i++) {
            const criaturaDefensora = defensor.tabuleiro.frente[i];
            if(criaturaDefensora != null) {
                console.log(`${criaturaAtacante.nome} ataca ${criaturaDefensora.nome} com ${criaturaAtacante.ataque} de ataque!`);
                criaturaDefensora.receberDano(criaturaAtacante.ataque);
                console.log(`${criaturaDefensora.nome} está com ${criaturaDefensora.vida} de vida!`);
                if(!criaturaDefensora.estaVivo()) {
                    console.log(`${criaturaDefensora.nome} foi destruida!`);
                    defensor.tabuleiro.removerCriatura('frente', i as Coluna);
                }
                // Encerra o combate:
                return;
            }
        }
    }

    private podeAtacar(possivelAtacante: Criatura, linha: Linha): boolean {
        switch(possivelAtacante.tipoAtaque) {
            case 'corpo-a-corpo':
                return (linha === 'frente')? true:false;
            case "distancia":
                return (linha === 'fundo')? true:false;
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