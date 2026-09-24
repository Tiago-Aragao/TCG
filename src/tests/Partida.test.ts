import { describe, expect, test } from "vitest";
import { Criatura } from "../Criatura";
import { Jogador } from "../Jogador";
import { Coluna } from "../Tabuleiro";
import { Partida } from "../Partida";
import { Deck } from "../Deck";
import { CartaCriatura } from "../CartaCriatura";


/**
 * Saber se sempre que é criada a partida deve retornar não iniciada:
 */

describe("Estado da partida", () => {

    test("uma nova partida deve começar como NaoIniciada", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        expect(partida.estado).toBe("NaoIniciada");
    });

    test("deve entrar em Abertura quando a partida for iniciada", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.iniciarPartida();

        expect(partida.estado).toBe("Abertura");
    });

    test("deve entrar em FasePrincipal quando o turno for iniciado", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.iniciarPartida();

        expect(partida.estado).toBe("Abertura");

        partida.iniciarTurno();

        expect(partida.estado).toBe("FasePrincipal");
    });

    test("deve entrar em AguardandoTurno depois que o jogador passar o turno", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.iniciarPartida();
        partida.iniciarTurno();

        expect(partida.estado).toBe("FasePrincipal");

        partida.passarTurno();

        expect(partida.estado).toBe("AguardandoTurno");
    });

    test("não deve passar o turno novamente enquanto estiver AguardandoTurno", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.iniciarPartida();
        partida.iniciarTurno();

        expect(partida.turnoAtual).toBe(1);
        expect(partida.estado).toBe("FasePrincipal");

        partida.passarTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.estado).toBe("AguardandoTurno");

        partida.passarTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.estado).toBe("AguardandoTurno");
    });

    test("não deve iniciar novamente um turno que já está na FasePrincipal", () => {
        const deck1 = criarDeckComCartas(10, 1);
        const deck2 = criarDeckComCartas(10, 100);

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        // Turno 1
        partida.iniciarPartida();
        partida.iniciarTurno();
        partida.passarTurno();

        // Turno 2 — Jogador 2
        partida.iniciarTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.estado).toBe("FasePrincipal");

        const tamanhoMaoAntes = jogador2.mao.length;
        const tamanhoDeckAntes = jogador2.deck.tamanhoDeck();
        const manaAntes = jogador2.mostrarMana;

        // Tentativa indevida de iniciar novamente o mesmo turno
        partida.iniciarTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.estado).toBe("FasePrincipal");

        expect(jogador2.mao).toHaveLength(tamanhoMaoAntes);
        expect(jogador2.deck.tamanhoDeck()).toBe(tamanhoDeckAntes);
        expect(jogador2.mostrarMana).toBe(manaAntes);
    });

    test("executarProximoTurno não deve encerrar um turno interativo já aberto", () => {
        const deck1 = criarDeckComCartas(10, 1);
        const deck2 = criarDeckComCartas(10, 100);

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.iniciarPartida();
        partida.iniciarTurno();

        expect(partida.turnoAtual).toBe(1);
        expect(partida.estado).toBe("FasePrincipal");

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(1);
        expect(partida.estado).toBe("FasePrincipal");
    });

});

/*
 * Cria um jogador com um deck vazio.
 *
 * Utilizado nos testes de combate, onde as cartas ainda
 * não fazem parte do comportamento sendo testado.
 */
function criarJogadorSemCartas(nome: string): Jogador {
    const deck = new Deck(`Deck ${nome}`);
    return new Jogador(nome, deck);
}


/*
 * Cria um Deck contendo a quantidade solicitada de cartas.
 *
 * Utilizado nos testes de abertura, compra e Mulligan.
 */
function criarDeckComCartas(
    quantidade: number,
    idInicial: number = 1
): Deck {

    const deck = new Deck("Deck Teste");

    for (let i = 0; i < quantidade; i++) {
        const carta = new CartaCriatura(
            idInicial + i,
            `Criatura ${idInicial + i}`,
            1,
            1,
            1
        );

        deck.adicionarCarta(carta);
    }

    return deck;
}


describe("Partida", () => {

    describe("Abertura da partida", () => {

        test("deve distribuir 5 cartas para cada jogador ao iniciar a partida", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            expect(jogador1.mao).toHaveLength(5);
            expect(jogador2.mao).toHaveLength(5);

            expect(jogador1.deck.tamanhoDeck()).toBe(5);
            expect(jogador2.deck.tamanhoDeck()).toBe(5);
        });


        test("não deve distribuir a mão inicial novamente se a partida já foi iniciada", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();
            partida.iniciarPartida();

            expect(jogador1.mao).toHaveLength(5);
            expect(jogador2.mao).toHaveLength(5);

            expect(jogador1.deck.tamanhoDeck()).toBe(5);
            expect(jogador2.deck.tamanhoDeck()).toBe(5);
        });


        test("executarProximoTurno deve iniciar a partida automaticamente se necessário", () => {
            const deck1 = criarDeckComCartas(5, 1);
            const deck2 = criarDeckComCartas(5, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(jogador1.mao).toHaveLength(5);
            expect(jogador2.mao).toHaveLength(5);
            expect(partida.turnoAtual).toBe(2);
        });

    });


    describe("Mulligan", () => {

        test("não deve permitir Mulligan antes da partida ser iniciada", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            const resultado = partida.solicitarMulligan(jogador1);

            expect(resultado).toBe(false);
            expect(jogador1.mao).toHaveLength(0);
            expect(jogador1.deck.tamanhoDeck()).toBe(10);
        });


        test("deve permitir que o jogador faça Mulligan durante a abertura", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            const resultado = partida.solicitarMulligan(jogador1);

            expect(resultado).toBe(true);
            expect(jogador1.mao).toHaveLength(5);
            expect(jogador1.deck.tamanhoDeck()).toBe(5);
        });


        test("cada jogador pode fazer apenas um Mulligan", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            const primeiroMulligan = partida.solicitarMulligan(jogador1);
            const segundoMulligan = partida.solicitarMulligan(jogador1);

            expect(primeiroMulligan).toBe(true);
            expect(segundoMulligan).toBe(false);

            expect(jogador1.mao).toHaveLength(5);
            expect(jogador1.deck.tamanhoDeck()).toBe(5);
        });


        test("o Mulligan de um jogador não deve impedir o Mulligan do outro", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("João", deck1);
            const jogador2 = new Jogador("João", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            const mulliganJ1 = partida.solicitarMulligan(jogador1);
            const mulliganJ2 = partida.solicitarMulligan(jogador2);

            expect(mulliganJ1).toBe(true);
            expect(mulliganJ2).toBe(true);
        });


        test("não deve permitir Mulligan para um jogador que não participa da partida", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);
            const deckIntruso = criarDeckComCartas(10, 200);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);
            const intruso = new Jogador("Intruso", deckIntruso);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            const resultado = partida.solicitarMulligan(intruso);

            expect(resultado).toBe(false);
            expect(intruso.mao).toHaveLength(0);
            expect(intruso.deck.tamanhoDeck()).toBe(10);
        });


        test("não deve permitir Mulligan depois que o primeiro turno começar", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();
            partida.executarProximoTurno();

            const resultado = partida.solicitarMulligan(jogador1);

            expect(resultado).toBe(false);
            expect(jogador1.mao).toHaveLength(5);
        });

    });


    describe("Jogar carta pela Partida", () => {

        test("deve retornar ForaDaFasePrincipal ao tentar jogar uma carta durante a abertura", () => {
            const deck1 = new Deck("Deck 1");
            const deck2 = new Deck("Deck 2");

            const carta = new CartaCriatura(
                1,
                "Criatura Teste",
                1,
                1,
                1
            );

            deck1.adicionarCarta(carta);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            const resultado = partida.tentarJogarCarta(
                carta,
                { linha: "frente", coluna: Coluna.Meio }
            );

            expect(partida.estado).toBe("Abertura");
            expect(resultado).toBe("ForaDaFasePrincipal");
            expect(jogador1.mao).toContain(carta);
            expect(
                jogador1.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Meio
                )
            ).toBeNull();
        });


        test("deve permitir que o jogador ativo jogue uma carta durante a FasePrincipal", () => {
            const deck1 = new Deck("Deck 1");
            const deck2 = new Deck("Deck 2");

            const carta = new CartaCriatura(
                1,
                "Criatura Teste",
                1,
                1,
                1
            );

            deck1.adicionarCarta(carta);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();
            partida.iniciarTurno();

            const resultado = partida.tentarJogarCarta(
                carta,
                { linha: "frente", coluna: Coluna.Meio }
            );

            expect(resultado).toBe("Sucesso");
            expect(jogador1.mao).not.toContain(carta);
            expect(
                jogador1.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Meio
                )
            ).not.toBeNull();
            expect(jogador1.mostrarMana).toBe(0);
        });


        test("deve propagar ManaInsuficiente retornado pelo jogador ativo", () => {
            const deck1 = new Deck("Deck 1");
            const deck2 = new Deck("Deck 2");

            const carta = new CartaCriatura(
                1,
                "Criatura Cara",
                2,
                1,
                1
            );

            deck1.adicionarCarta(carta);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();
            partida.iniciarTurno();

            const resultado = partida.tentarJogarCarta(
                carta,
                { linha: "frente", coluna: Coluna.Meio }
            );

            expect(resultado).toBe("ManaInsuficiente");
            expect(jogador1.mao).toContain(carta);
            expect(jogador1.mostrarMana).toBe(1);
            expect(
                jogador1.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Meio
                )
            ).toBeNull();
        });


        test("deve usar a mão do jogador ativo ao tentar jogar uma carta", () => {
            const deck1 = new Deck("Deck 1");
            const deck2 = new Deck("Deck 2");

            const cartaJogador2 = new CartaCriatura(
                1,
                "Criatura do Jogador 2",
                1,
                1,
                1
            );

            deck2.adicionarCarta(cartaJogador2);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();
            partida.iniciarTurno();

            const resultado = partida.tentarJogarCarta(
                cartaJogador2,
                { linha: "frente", coluna: Coluna.Meio }
            );

            expect(partida.obterJogadorAtivo()).toBe(jogador1);
            expect(resultado).toBe("CartaNaoEstaNaMao");
            expect(jogador2.mao).toContain(cartaJogador2);
            expect(
                jogador1.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Meio
                )
            ).toBeNull();
        });

    });


    describe("Draw Phase", () => {

        test("Jogador 1 não deve comprar carta no turno 1", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            expect(jogador1.mao).toHaveLength(5);

            partida.executarProximoTurno();

            expect(jogador1.mao).toHaveLength(5);
        });


        test("Jogador 2 deve comprar carta no início do seu primeiro turno", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            expect(jogador2.mao).toHaveLength(5);

            /*
             * Turno 1 = Jogador 1.
             */
            partida.executarProximoTurno();

            expect(jogador2.mao).toHaveLength(5);

            /*
             * Turno 2 = Jogador 2.
             */
            partida.executarProximoTurno();

            expect(jogador2.mao).toHaveLength(6);
        });


        test("Jogador 1 deve comprar normalmente a partir do turno 3", () => {
            const deck1 = criarDeckComCartas(10, 1);
            const deck2 = criarDeckComCartas(10, 100);

            const jogador1 = new Jogador("Jogador 1", deck1);
            const jogador2 = new Jogador("Jogador 2", deck2);

            const partida = new Partida(jogador1, jogador2);

            partida.iniciarPartida();

            expect(jogador1.mao).toHaveLength(5);

            /*
             * Turno 1 = Jogador 1.
             */
            partida.executarProximoTurno();

            expect(jogador1.mao).toHaveLength(5);

            /*
             * Turno 2 = Jogador 2.
             */
            partida.executarProximoTurno();

            expect(jogador1.mao).toHaveLength(5);

            /*
             * Turno 3 = Jogador 1.
             */
            partida.executarProximoTurno();

            expect(jogador1.mao).toHaveLength(6);
        });

    });


    describe("Ordem dos turnos", () => {

        test("Jogador 1 deve começar a partida", () => {
            const criaturaJ1 = new Criatura("Goblin J1", 10, 5);
            const criaturaJ2 = new Criatura("Goblin J2", 10, 5);

            const jogador1 = criarJogadorSemCartas("Jogador 1");
            const jogador2 = criarJogadorSemCartas("Jogador 2");

            jogador1.tabuleiro.conjurarCriatura(
                criaturaJ1,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                criaturaJ2,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(
                jogador2.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBeNull();

            expect(
                jogador1.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBe(criaturaJ1);
        });


        test("executarProximoTurno deve executar somente um turno", () => {
            const criaturaJ1 = new Criatura("Goblin J1", 3, 10);
            const alvoJ2 = new Criatura("Alvo J2", 1, 100);

            const jogador1 = criarJogadorSemCartas("Jogador 1");
            const jogador2 = criarJogadorSemCartas("Jogador 2");

            jogador1.tabuleiro.conjurarCriatura(
                criaturaJ1,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoJ2,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            expect(partida.turnoAtual).toBe(1);

            partida.executarProximoTurno();

            expect(partida.turnoAtual).toBe(2);

            expect(alvoJ2.vida).toBe(97);
            expect(criaturaJ1.vida).toBe(10);
        });

    });


    describe("Alcance dos ataques", () => {

        test("criatura corpo-a-corpo deve atacar pela frente", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10,
                "corpo-a-corpo"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(atacante.vida).toBe(10);
            expect(alvo.vida).toBe(97);
        });


        test("criatura corpo-a-corpo não deve atacar pelo fundo", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10,
                "corpo-a-corpo"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "fundo",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(atacante.vida).toBe(10);
            expect(alvo.vida).toBe(100);
        });


        test("criatura à distância deve atacar pelo fundo", () => {
            const atacante = new Criatura(
                "Arqueiro",
                3,
                10,
                "distancia"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "fundo",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(alvo.vida).toBe(97);
        });


        test("criatura à distância não deve atacar pela frente", () => {
            const atacante = new Criatura(
                "Arqueiro",
                3,
                10,
                "distancia"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(atacante.vida).toBe(10);
            expect(alvo.vida).toBe(100);
        });


        test("criatura mágica deve poder atacar da frente", () => {
            const atacante = new Criatura(
                "Mago",
                3,
                10,
                "magico"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(alvo.vida).toBe(97);
        });


        test("criatura mágica deve poder atacar do fundo", () => {
            const atacante = new Criatura(
                "Mago",
                3,
                10,
                "magico"
            );

            const alvo = new Criatura(
                "Alvo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "fundo",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvo,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(alvo.vida).toBe(97);
        });

    });


    describe("Seleção de alvo", () => {

        test("deve escolher o alvo mais próximo da coluna atacante", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10
            );

            const alvoMeio = new Criatura(
                "Alvo Meio",
                1,
                100
            );

            const alvoDireita = new Criatura(
                "Alvo Direito",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoMeio,
                "frente",
                Coluna.Meio
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoDireita,
                "frente",
                Coluna.Direita
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            /*
             * O atacante está na esquerda.
             *
             * Distância até o meio = 1
             * Distância até a direita = 2
             */
            expect(alvoMeio.vida).toBe(97);
            expect(alvoDireita.vida).toBe(100);
        });


        test("em caso de empate de distância, deve priorizar a coluna esquerda", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10
            );

            const alvoEsquerda = new Criatura(
                "Alvo Esquerdo",
                1,
                100
            );

            const alvoDireita = new Criatura(
                "Alvo Direito",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Meio
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoEsquerda,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoDireita,
                "frente",
                Coluna.Direita
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(alvoEsquerda.vida).toBe(97);
            expect(alvoDireita.vida).toBe(100);
        });


        test("a frente deve ter prioridade sobre o fundo", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10
            );

            const alvoFrente = new Criatura(
                "Alvo Frente",
                1,
                100
            );

            const alvoFundo = new Criatura(
                "Alvo Fundo",
                1,
                100
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoFrente,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                alvoFundo,
                "fundo",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(alvoFrente.vida).toBe(97);
            expect(alvoFundo.vida).toBe(100);
        });

    });


    describe("Morte e remoção", () => {

        test("criatura morta deve ser removida do tabuleiro", () => {
            const atacante = new Criatura(
                "Guerreiro",
                10,
                10
            );

            const defensor = new Criatura(
                "Alvo",
                1,
                5
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            jogador2.tabuleiro.conjurarCriatura(
                defensor,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(
                jogador2.tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBeNull();
        });

    });


    describe("Ataque direto ao jogador", () => {

        test("não deve causar dano ao jogador no turno 1", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            const vidaInicial = jogador2.vidaAtual;

            const partida = new Partida(jogador1, jogador2);

            partida.executarProximoTurno();

            expect(jogador2.vidaAtual).toBe(vidaInicial);
        });


        test("deve causar dano ao jogador quando seu campo está vazio a partir do turno 2", () => {
            const atacante = new Criatura(
                "Guerreiro",
                3,
                10
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            const vidaInicial = jogador2.vidaAtual;

            const partida = new Partida(jogador1, jogador2);

            /*
             * Turno 1:
             * J1 não pode atacar diretamente.
             */
            partida.executarProximoTurno();

            expect(jogador2.vidaAtual).toBe(vidaInicial);

            /*
             * Turno 2:
             * J2 joga, mas não possui criaturas.
             */
            partida.executarProximoTurno();

            /*
             * Turno 3:
             * J1 pode atacar diretamente.
             */
            partida.executarProximoTurno();

            expect(jogador2.vidaAtual).toBeLessThan(vidaInicial);
        });


        test("deve derrotar o jogador quando sua vida chega a 0", () => {
            const atacante = new Criatura(
                "Guerreiro",
                20,
                10
            );

            const jogador1 = criarJogadorSemCartas("J1");
            const jogador2 = criarJogadorSemCartas("J2");

            jogador1.tabuleiro.conjurarCriatura(
                atacante,
                "frente",
                Coluna.Esquerda
            );

            const partida = new Partida(jogador1, jogador2);

            /*
             * Turno 1: ataque direto proibido.
             */
            partida.executarProximoTurno();

            /*
             * Turno 2: turno do Jogador 2.
             */
            partida.executarProximoTurno();

            /*
             * Turno 3: Jogador 1 pode atacar diretamente.
             */
            partida.executarProximoTurno();

            expect(jogador2.estaVivo()).toBe(false);
        });

    });

});
describe("Jogador ativo e defensor", () => {

    test("no turno 1, o jogador 1 é o ativo e o jogador 2 é o defensor", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        expect(partida.obterJogadorAtivo()).toBe(jogador1);
        expect(partida.obterJogadorDefensor()).toBe(jogador2);
    });


    test("no turno 2, o jogador 2 é o ativo e o jogador 1 é o defensor", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.obterJogadorAtivo()).toBe(jogador2);
        expect(partida.obterJogadorDefensor()).toBe(jogador1);
    });


    test("a alternância continua nos turnos seguintes", () => {
        const deck1 = new Deck("Deck 1");
        const deck2 = new Deck("Deck 2");

        const jogador1 = new Jogador("Jogador 1", deck1);
        const jogador2 = new Jogador("Jogador 2", deck2);

        const partida = new Partida(jogador1, jogador2);

        expect(partida.turnoAtual).toBe(1);
        expect(partida.obterJogadorAtivo()).toBe(jogador1);
        expect(partida.obterJogadorDefensor()).toBe(jogador2);

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(2);
        expect(partida.obterJogadorAtivo()).toBe(jogador2);
        expect(partida.obterJogadorDefensor()).toBe(jogador1);

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(3);
        expect(partida.obterJogadorAtivo()).toBe(jogador1);
        expect(partida.obterJogadorDefensor()).toBe(jogador2);

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(4);
        expect(partida.obterJogadorAtivo()).toBe(jogador2);
        expect(partida.obterJogadorDefensor()).toBe(jogador1);
    });

});

describe("Encerramento da partida", () => {

    test("deve encerrar a partida quando o defensor morrer após o combate", () => {
        const jogador1 = criarJogadorSemCartas("Jogador 1");
        const jogador2 = criarJogadorSemCartas("Jogador 2");

        const atacante = new Criatura(
            "Finalizador",
            20,
            10
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante,
            "frente",
            Coluna.Esquerda
        );

        const partida = new Partida(jogador1, jogador2);

        // Turno 1 - dano direto proibido
        partida.executarProximoTurno();

        // Turno 2 - jogador 2
        partida.executarProximoTurno();

        // Turno 3 - jogador 1 pode causar dano direto
        partida.executarProximoTurno();

        expect(jogador2.estaVivo()).toBe(false);
        expect(partida.estado).toBe("Encerrada");
    });


    test("não deve avançar o número do turno quando a partida termina", () => {
        const jogador1 = criarJogadorSemCartas("Jogador 1");
        const jogador2 = criarJogadorSemCartas("Jogador 2");

        const atacante = new Criatura(
            "Finalizador",
            20,
            10
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante,
            "frente",
            Coluna.Esquerda
        );

        const partida = new Partida(jogador1, jogador2);

        partida.executarProximoTurno(); // turno 1
        partida.executarProximoTurno(); // turno 2

        expect(partida.turnoAtual).toBe(3);

        partida.executarProximoTurno(); // combate letal do turno 3

        expect(partida.estado).toBe("Encerrada");
        expect(partida.turnoAtual).toBe(3);
    });


    test("deve resolver todo o combate permitindo overkill antes de encerrar a partida", () => {
        const jogador1 = criarJogadorSemCartas("Jogador 1");
        const jogador2 = criarJogadorSemCartas("Jogador 2");

        const atacante1 = new Criatura(
            "Atacante 1",
            50,
            10
        );

        const atacante2 = new Criatura(
            "Atacante 2",
            50,
            10
        );

        const atacante3 = new Criatura(
            "Atacante 3",
            48,
            10
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante1,
            "frente",
            Coluna.Esquerda
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante2,
            "frente",
            Coluna.Meio
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante3,
            "frente",
            Coluna.Direita
        );

        const partida = new Partida(jogador1, jogador2);

        partida.executarProximoTurno(); // turno 1
        partida.executarProximoTurno(); // turno 2
        partida.executarProximoTurno(); // turno 3

        /*
         * Vida inicial = 20
         *
         * 20 - 50 - 50 - 48 = -128
         *
         * Portanto todos os atacantes devem resolver,
         * mesmo que o jogador já tenha passado de 0.
         */
        expect(jogador2.vidaAtual).toBe(-128);
        expect(partida.estado).toBe("Encerrada");
    });


    test("não deve executar novos turnos depois que a partida estiver Encerrada", () => {
        const jogador1 = criarJogadorSemCartas("Jogador 1");
        const jogador2 = criarJogadorSemCartas("Jogador 2");

        const atacante = new Criatura(
            "Finalizador",
            20,
            10
        );

        jogador1.tabuleiro.conjurarCriatura(
            atacante,
            "frente",
            Coluna.Esquerda
        );

        const partida = new Partida(jogador1, jogador2);

        partida.executarProximoTurno();
        partida.executarProximoTurno();
        partida.executarProximoTurno();

        expect(partida.estado).toBe("Encerrada");

        const turnoAoEncerrar = partida.turnoAtual;
        const vidaAoEncerrar = jogador2.vidaAtual;

        partida.executarProximoTurno();

        expect(partida.turnoAtual).toBe(turnoAoEncerrar);
        expect(jogador2.vidaAtual).toBe(vidaAoEncerrar);
        expect(partida.estado).toBe("Encerrada");
    });

});
