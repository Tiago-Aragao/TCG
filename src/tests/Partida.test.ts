import { describe, expect, test } from "vitest";
import { Criatura } from "../Criatura";
import { Jogador } from "../Jogador";
import { Coluna } from "../Tabuleiro";
import { Partida } from "../Partida";


describe("Partida", () => {

    describe("Ordem dos turnos", () => {

        test("Jogador 1 deve começar a partida", () => {
            const criaturaJ1 = new Criatura("Goblin J1", 10, 5);
            const criaturaJ2 = new Criatura("Goblin J2", 10, 5);

            const jogador1 = new Jogador("Jogador 1", [criaturaJ1]);
            const jogador2 = new Jogador("Jogador 2", [criaturaJ2]);

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

            /*
             * Jogador 1 começa.
             * Portanto, sua criatura deve atacar primeiro
             * e destruir a criatura do Jogador 2.
             */
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

            const jogador1 = new Jogador("Jogador 1", [criaturaJ1]);
            const jogador2 = new Jogador("Jogador 2", [alvoJ2]);

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

            /*
             * Um único turno foi executado.
             * Logo o turno atual deve ter avançado de 1 para 2.
             */
            expect(partida.turnoAtual).toBe(2);

            /*
             * O dano aconteceu apenas uma vez.
             */
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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            /*
             * O Guerreiro está no fundo.
             * Corpo-a-corpo só pode atacar pela frente.
             */
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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [alvo]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador(
                "J2",
                [alvoEsquerda, alvoDireita]
            );

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

            /*
             * O atacante está no meio.
             * Esquerda e direita estão à mesma distância.
             *
             * Como a ordem das colunas é:
             * esquerda -> meio -> direita
             *
             * a esquerda deve ser escolhida no desempate.
             */
            expect(alvoEsquerda.vida).toBe(97);
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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador(
                "J2",
                [alvoEsquerda, alvoDireita]
            );

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador(
                "J2",
                [alvoFrente, alvoFundo]
            );

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

            /*
             * A criatura da frente deve receber o ataque primeiro.
             */
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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", [defensor]);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", []);

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

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", []);

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
             * J2 não possui criatura para atacar.
             * Depois disso, o turno 3 será de J1 novamente.
             *
             * Como o objetivo é validar que a regra de ataque direto
             * está liberada após o turno 1, avançamos até o próximo
             * turno de J1.
             */
            partida.executarProximoTurno();
            partida.executarProximoTurno();

            expect(jogador2.vidaAtual).toBeLessThan(vidaInicial);
        });


        test("deve derrotar o jogador quando sua vida chega a 0", () => {
            const atacante = new Criatura(
                "Guerreiro",
                20,
                10
            );

            const jogador1 = new Jogador("J1", [atacante]);
            const jogador2 = new Jogador("J2", []);

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
             * Turno 2: ainda é o turno do Jogador 2.
             * Não há criaturas para atacar.
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