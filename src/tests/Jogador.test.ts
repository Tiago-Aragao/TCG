import { describe, expect, test } from "vitest";
import { CartaCriatura } from "../CartaCriatura";
import { Deck } from "../Deck";
import { Jogador } from "../Jogador";
import { Coluna } from "../Tabuleiro";

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
         * Esvazio o deck para recuperar as cartas restantes.
         * Assim consigo verificar que nenhuma carta somiu.
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

describe("Mana", () => {

    test("deve gerar 1 de mana nos turnos 1 e 2", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(1);

        expect(jogador.mostrarMana).toBe(1);

        jogador.gerarManaTurno(2);

        expect(jogador.mostrarMana).toBe(1);
    });

    test("deve gerar 2 de mana nos turnos 3 e 4", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(3);

        expect(jogador.mostrarMana).toBe(2);

        jogador.gerarManaTurno(4);

        expect(jogador.mostrarMana).toBe(2);
    });

    test("deve aumentar a geração de mana a cada dois turnos", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(5);
        expect(jogador.mostrarMana).toBe(3);

        jogador.gerarManaTurno(7);
        expect(jogador.mostrarMana).toBe(4);

        jogador.gerarManaTurno(9);
        expect(jogador.mostrarMana).toBe(5);
    });

    test("deve gerar no máximo 6 de mana automaticamente", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(11);

        expect(jogador.mostrarMana).toBe(6);

        jogador.gerarManaTurno(20);

        expect(jogador.mostrarMana).toBe(6);
    });

    test("deve substituir o mana do turno anterior pela nova geração automática", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(11);

        expect(jogador.mostrarMana).toBe(6);

        jogador.gerarManaTurno(15);

        expect(jogador.mostrarMana).toBe(6);
    });

    test("deve reduzir o mana ao gastar", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(11);
        jogador.gastarMana(3);

        expect(jogador.mostrarMana).toBe(3);
    });

    test("não deve gastar mana quando o valor informado for negativo", () => {
        const deck = new Deck("Deck Teste");
        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(11);
        jogador.gastarMana(-2);

        expect(jogador.mostrarMana).toBe(6);
    });

});

describe("Jogar carta da mão", () => {

    test("deve retornar Sucesso ao jogar uma carta com mana suficiente e posição livre", () => {
        const deck = new Deck("Deck Teste");
        const carta = criarCarta(1);

        deck.adicionarCarta(carta);

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarCarta();
        jogador.gerarManaTurno(1);

        const resultado = jogador.jogarCartaMao(
            carta,
            { linha: "frente", coluna: Coluna.Meio }
        );

        expect(resultado).toBe("Sucesso");

        expect(jogador.mao).not.toContain(carta);

        expect(
            jogador.tabuleiro.obterCriatura(
                "frente",
                Coluna.Meio
            )
        ).not.toBeNull();

        expect(jogador.mostrarMana).toBe(0);
    });

    test("deve retornar ManaInsuficiente quando não possui mana suficiente", () => {
        const deck = new Deck("Deck Teste");

        const carta = new CartaCriatura(
            1,
            "Criatura Cara",
            2,
            1,
            1
        );

        deck.adicionarCarta(carta);

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarCarta();
        jogador.gerarManaTurno(1);

        const resultado = jogador.jogarCartaMao(
            carta,
            { linha: "frente", coluna: Coluna.Meio }
        );

        expect(resultado).toBe("ManaInsuficiente");

        expect(jogador.mao).toContain(carta);

        expect(
            jogador.tabuleiro.obterCriatura(
                "frente",
                Coluna.Meio
            )
        ).toBeNull();

        expect(jogador.mostrarMana).toBe(1);
    });

    test("deve retornar PosicaoOcupada quando a posição já possui uma criatura", () => {
        const deck = new Deck("Deck Teste");

        const carta1 = criarCarta(1);
        const carta2 = criarCarta(2);

        deck.adicionarCarta(carta1);
        deck.adicionarCarta(carta2);

        const jogador = new Jogador("Jogador 1", deck);

        jogador.comprarCarta();
        jogador.comprarCarta();

        jogador.gerarManaTurno(3);

        const primeiraJogada = jogador.jogarCartaMao(
            carta1,
            { linha: "frente", coluna: Coluna.Meio }
        );

        expect(primeiraJogada).toBe("Sucesso");

        const manaAntesDaSegundaJogada = jogador.mostrarMana;

        const resultado = jogador.jogarCartaMao(
            carta2,
            { linha: "frente", coluna: Coluna.Meio }
        );

        expect(resultado).toBe("PosicaoOcupada");

        expect(jogador.mao).toContain(carta2);

        expect(
            jogador.tabuleiro.obterCriatura(
                "frente",
                Coluna.Meio
            )
        ).not.toBeNull();

        expect(jogador.mostrarMana).toBe(
            manaAntesDaSegundaJogada
        );
    });

    test("deve retornar CartaNaoEstaNaMao quando a carta não pertence à mão", () => {
        const deck = new Deck("Deck Teste");
        const carta = criarCarta(1);

        const jogador = new Jogador("Jogador 1", deck);

        jogador.gerarManaTurno(1);

        const resultado = jogador.jogarCartaMao(
            carta,
            { linha: "frente", coluna: Coluna.Meio }
        );

        expect(resultado).toBe("CartaNaoEstaNaMao");

        expect(jogador.mostrarMana).toBe(1);

        expect(
            jogador.tabuleiro.obterCriatura(
                "frente",
                Coluna.Meio
            )
        ).toBeNull();
    });

});