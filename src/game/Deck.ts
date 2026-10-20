import { Carta } from "./Carta";

export class Deck {
    nome: string //Usuario vai criar um deck ele põe um nome nele.
    private readonly tamanhoPermitido: number = 30;
    private cartasDeck: Carta[] = [];

    constructor(nome: string = '') {
        this.nome = nome;
    }

    public adicionarCarta(carta: Carta): void {
        // Deixo ele adicionar quantas cartas quiser, depois valido o tamanho do deck.
        // OBS: Não sei se dessa forma quando criar uma copia do deck as cartas que adicionam cartas no deck do jogador dentro de jogo mudam o deck normal.
        this.cartasDeck.push(carta);
    }

    public compraCarta(): Carta | null {
        return this.cartasDeck.pop() ?? null;
    }

    public tamanhoDeck(): number {
        return this.cartasDeck.length;
    }

    public validarDeck(): boolean {
        /**
         * Deve ser sempre chamado na hora de validar o deck para validar como um check
         * list antes do jogo se ele será apto a jogar ou nao.
         */
        if(this.cartasDeck.length === this.tamanhoPermitido) {
            return true;
        }
        return false;
    }

    public embaralhar(): void {
        /**
         * Pesquisei na net esse é o Fisher-Yates Shuffle o algoritmo mais eficiente do mundo quando o assunto é
         * embaralhar decks! uhuuu
         */
        const deck = this.cartasDeck;
        for (let i = deck.length - 1; i > 0; i--) {
            // Gero um índice aleatório de 0 até i
            const j = Math.floor(Math.random() * (i + 1));
            // Trocando os elementos de lugar:
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    public clonarParaPartida(): Deck {
        const deckCopiado = new Deck(this.nome);
        deckCopiado.cartasDeck = [...this.cartasDeck];
        return deckCopiado;
    }
}
