import { Criatura } from "./Criatura";
import { Tabuleiro } from "./Tabuleiro";

export class Jogador {
    public readonly nome: string;
    vidaAtual: number;
    vidaMaxima: number;
    tabuleiro: Tabuleiro;
    deck: Criatura[];
    hand: Criatura[];
    
    constructor(nome: string, deck: Criatura[]) {
        this.nome = nome;
        this.vidaAtual = 20;
        this.vidaMaxima = 20;
        this.deck = deck;
        this.hand = [];
        this.tabuleiro = new Tabuleiro();
    }

    public receberDano(dano:number): void {
        this.vidaAtual -= dano;
    }

    public comprarCarta(): void {
        const card = this.deck.pop();
        if (card) {
            this.hand.push(card);
        }
    }

    public estaVivo(): boolean {
        return this.vidaAtual > 0;
    }
    

}