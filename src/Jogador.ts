import { Carta } from "./Carta";
import { Tabuleiro } from "./Tabuleiro";
import { Deck } from "./Deck";

export class Jogador {
    /**
     * Está classe seráo Jogador dentro da PARTIDA.
     * O MANAGER será uma classe separada que terá dindin, coleção, varios decks e outra classe MANAGERIA irá herdar ela com atributos excluisvos para IA.
     */
    public readonly nome: string;
    vidaAtual: number;
    vidaMaxima: number;
    tabuleiro: Tabuleiro;
    deck: Deck;
    mao: Carta[];
    
    constructor(nome: string, deckPartida: Deck) {
        this.nome = nome;
        this.vidaAtual = 20;
        this.vidaMaxima = 20;
        this.deck = deckPartida;
        this.mao = [];
        this.tabuleiro = new Tabuleiro();
    }

    public receberDano(dano:number): void {
        this.vidaAtual -= dano;
    }


    // Em partida:
    public comprarCarta(): boolean {
        const card = this.deck.compraCarta();
        if (card != null) {
            this.mao.push(card);
            return true;
        }
        return false;
    }

    public comprarMaoInicial(): void {
        // Compra 5 cartas
        for (let i=0;i<5;i++) {
            this.comprarCarta();
        }
    }

    public fazerMulliganEuropeu(): void {
        for(let i=0;i<this.mao.length;i++) {
            this.deck.adicionarCarta(this.mao[i]);
        }
        this.mao = [];
        this.deck.embaralhar();
        this.comprarMaoInicial();
    }

    public estaVivo(): boolean {
        return this.vidaAtual > 0;
    }
    

}