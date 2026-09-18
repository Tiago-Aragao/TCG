import { describe, expect, test } from "vitest";
import { Deck } from "../Deck";
import { CartaCriatura } from "../CartaCriatura";

function criarCarta(id: number): CartaCriatura {
    return new CartaCriatura(
        id,
        `Criatura ${id}`,
        1,
        1,
        1
    );
}

describe("Deck", () => {

    test("deve começar vazio", () => {
        const deck = new Deck("Deck Teste");

        expect(deck.tamanhoDeck()).toBe(0);
    });

    test("deve adicionar cartas ao deck", () => {
        const deck = new Deck("Deck Teste");

        const carta = criarCarta(1);

        deck.adicionarCarta(carta);

        expect(deck.tamanhoDeck()).toBe(1);
    });

    test("deve comprar a carta do topo do deck", () => {
        const deck = new Deck("Deck Teste");

        const carta1 = criarCarta(1);
        const carta2 = criarCarta(2);

        deck.adicionarCarta(carta1);
        deck.adicionarCarta(carta2);

        const cartaComprada = deck.compraCarta();

        /*
         * O Deck utiliza pop(), portanto a última carta
         * adicionada é a primeira a ser comprada.
         */
        expect(cartaComprada).toBe(carta2);
        expect(deck.tamanhoDeck()).toBe(1);
    });

    test("deve retornar null ao tentar comprar de um deck vazio", () => {
        const deck = new Deck("Deck Teste");

        const cartaComprada = deck.compraCarta();

        expect(cartaComprada).toBeNull();
    });

    test("deve validar um deck com exatamente 30 cartas", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 30; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        expect(deck.tamanhoDeck()).toBe(30);
        expect(deck.validarDeck()).toBe(true);
    });

    test("não deve validar um deck com menos de 30 cartas", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 29; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        expect(deck.tamanhoDeck()).toBe(29);
        expect(deck.validarDeck()).toBe(false);
    });

    test("não deve validar um deck com mais de 30 cartas", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 31; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        expect(deck.tamanhoDeck()).toBe(31);
        expect(deck.validarDeck()).toBe(false);
    });

    test("embaralhar não deve alterar a quantidade de cartas", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 30; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        const tamanhoAntes = deck.tamanhoDeck();

        deck.embaralhar();

        expect(deck.tamanhoDeck()).toBe(tamanhoAntes);
    });

    test("embaralhar não deve remover cartas do deck", () => {
        const deck = new Deck("Deck Teste");
        const cartas = [];

        for (let i = 1; i <= 30; i++) {
            const carta = criarCarta(i);

            cartas.push(carta);
            deck.adicionarCarta(carta);
        }

        deck.embaralhar();

        const cartasCompradas = [];

        for (let i = 0; i < 30; i++) {
            const carta = deck.compraCarta();

            if (carta !== null) {
                cartasCompradas.push(carta);
            }
        }

        expect(cartasCompradas).toHaveLength(30);

        expect(cartasCompradas).toEqual(
            expect.arrayContaining(cartas)
        );
    });

    test("clonarParaPartida deve criar um deck independente quanto à estrutura", () => {
        const deckOriginal = new Deck("Deck Original");

        deckOriginal.adicionarCarta(criarCarta(1));
        deckOriginal.adicionarCarta(criarCarta(2));
        deckOriginal.adicionarCarta(criarCarta(3));

        const deckPartida = deckOriginal.clonarParaPartida();

        expect(deckPartida.tamanhoDeck()).toBe(3);
        expect(deckOriginal.tamanhoDeck()).toBe(3);

        deckPartida.compraCarta();

        expect(deckPartida.tamanhoDeck()).toBe(2);
        expect(deckOriginal.tamanhoDeck()).toBe(3);
    });

});