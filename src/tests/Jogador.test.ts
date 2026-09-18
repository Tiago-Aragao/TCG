import { describe, expect, test } from "vitest";
import { CartaCriatura } from "../CartaCriatura";
import { Deck } from "../Deck";
import { Jogador } from "../Jogador";

function criarCarta(id: number): CartaCriatura {
    return new CartaCriatura(
        id,
        `Criatura ${id}`,
        1,
        1,
        1
    );
}

describe("Jogador", () => {

    test("deve começar com a mão vazia", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        expect(jogador.mao).toHaveLength(0);
    });

    test("deve comprar uma carta do deck e colocá-la na mão", () => {
        const deck = new Deck("Deck Teste");
        const carta = criarCarta(1);

        deck.adicionarCarta(carta);

        const jogador = new Jogador("Jogador 1", deck);

        const resultado = jogador.comprarCarta();

        expect(resultado).toBe(true);
        expect(jogador.mao).toHaveLength(1);
        expect(jogador.mao[0]).toBe(carta);
        expect(deck.tamanhoDeck()).toBe(0);
    });

    test("não deve comprar quando o deck está vazio", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        const resultado = jogador.comprarCarta();

        expect(resultado).toBe(false);
        expect(jogador.mao).toHaveLength(0);
    });

    test("deve comprar exatamente 5 cartas na mão inicial", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 10; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarMaoInicial();

        expect(jogador.mao).toHaveLength(5);
        expect(deck.tamanhoDeck()).toBe(5);
    });

    test("mulligan deve devolver a mão ao deck e comprar uma nova mão", () => {
        const deck = new Deck("Deck Teste");

        for (let i = 1; i <= 10; i++) {
            deck.adicionarCarta(criarCarta(i));
        }

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarMaoInicial();

        expect(jogador.mao).toHaveLength(5);
        expect(deck.tamanhoDeck()).toBe(5);

        jogador.fazerMulliganEuropeu();

        expect(jogador.mao).toHaveLength(5);
        expect(deck.tamanhoDeck()).toBe(5);
    });

    test("mulligan deve manter todas as cartas pertencentes ao deck", () => {
        const deck = new Deck("Deck Teste");
        const cartasOriginais: CartaCriatura[] = [];

        for (let i = 1; i <= 10; i++) {
            const carta = criarCarta(i);

            cartasOriginais.push(carta);
            deck.adicionarCarta(carta);
        }

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarMaoInicial();
        jogador.fazerMulliganEuropeu();

        /*
         * Esvaziamos o deck para recuperar as cartas restantes.
         * Assim conseguimos verificar que nenhuma carta desapareceu.
         */
        const cartasRestantesNoDeck: CartaCriatura[] = [];

        while (deck.tamanhoDeck() > 0) {
            const carta = deck.compraCarta();

            if (carta !== null) {
                cartasRestantesNoDeck.push(carta as CartaCriatura);
            }
        }

        const todasAsCartas = [
            ...jogador.mao,
            ...cartasRestantesNoDeck
        ];

        expect(todasAsCartas).toHaveLength(10);
        expect(todasAsCartas).toEqual(
            expect.arrayContaining(cartasOriginais)
        );
    });

});