import { describe, expect, test } from "vitest";
import { Criatura } from "../Criatura";
import {
    Coluna,
    Tabuleiro
} from "../Tabuleiro";

describe("Tabuleiro", () => {

    describe("Conjurar criatura", () => {

        test("deve colocar uma criatura em uma posição vazia", () => {
            const tabuleiro = new Tabuleiro();
            const criatura = new Criatura("Goblin", 3, 5);

            const resultado = tabuleiro.conjurarCriatura(
                criatura,
                "frente",
                Coluna.Esquerda
            );

            expect(resultado).toBe(true);

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBe(criatura);
        });

        test("deve colocar corretamente uma criatura no fundo", () => {
            const tabuleiro = new Tabuleiro();
            const criatura = new Criatura("Arqueiro", 3, 4, "distancia");

            const resultado = tabuleiro.conjurarCriatura(
                criatura,
                "fundo",
                Coluna.Meio
            );

            expect(resultado).toBe(true);

            expect(
                tabuleiro.obterCriatura(
                    "fundo",
                    Coluna.Meio
                )
            ).toBe(criatura);
        });

        test("não deve permitir duas criaturas na mesma posição", () => {
            const tabuleiro = new Tabuleiro();

            const criatura1 = new Criatura("Goblin", 3, 5);
            const criatura2 = new Criatura("Orc", 4, 6);

            const primeiraTentativa = tabuleiro.conjurarCriatura(
                criatura1,
                "frente",
                Coluna.Esquerda
            );

            const segundaTentativa = tabuleiro.conjurarCriatura(
                criatura2,
                "frente",
                Coluna.Esquerda
            );

            expect(primeiraTentativa).toBe(true);
            expect(segundaTentativa).toBe(false);

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBe(criatura1);
        });

    });


    describe("Obter criatura", () => {

        test("deve retornar null quando a posição estiver vazia", () => {
            const tabuleiro = new Tabuleiro();

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Meio
                )
            ).toBeNull();
        });

        test("deve retornar a criatura correta de cada posição", () => {
            const tabuleiro = new Tabuleiro();

            const guerreiro = new Criatura("Guerreiro", 3, 10);
            const arqueiro = new Criatura("Arqueiro", 3, 4, "distancia");

            tabuleiro.conjurarCriatura(
                guerreiro,
                "frente",
                Coluna.Direita
            );

            tabuleiro.conjurarCriatura(
                arqueiro,
                "fundo",
                Coluna.Meio
            );

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Direita
                )
            ).toBe(guerreiro);

            expect(
                tabuleiro.obterCriatura(
                    "fundo",
                    Coluna.Meio
                )
            ).toBe(arqueiro);

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBeNull();
        });

    });


    describe("Remover criatura", () => {

        test("deve remover uma criatura do tabuleiro", () => {
            const tabuleiro = new Tabuleiro();
            const criatura = new Criatura("Goblin", 3, 5);

            tabuleiro.conjurarCriatura(
                criatura,
                "frente",
                Coluna.Esquerda
            );

            tabuleiro.removerCriatura(
                "frente",
                Coluna.Esquerda
            );

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBeNull();
        });

        test("deve permitir colocar outra criatura depois que o espaço for liberado", () => {
            const tabuleiro = new Tabuleiro();

            const criatura1 = new Criatura("Goblin", 3, 5);
            const criatura2 = new Criatura("Orc", 4, 6);

            tabuleiro.conjurarCriatura(
                criatura1,
                "frente",
                Coluna.Esquerda
            );

            tabuleiro.removerCriatura(
                "frente",
                Coluna.Esquerda
            );

            const resultado = tabuleiro.conjurarCriatura(
                criatura2,
                "frente",
                Coluna.Esquerda
            );

            expect(resultado).toBe(true);

            expect(
                tabuleiro.obterCriatura(
                    "frente",
                    Coluna.Esquerda
                )
            ).toBe(criatura2);
        });

    });


    describe("Estado do tabuleiro", () => {

        test("deve informar que possui criaturas quando existe pelo menos uma", () => {
            const tabuleiro = new Tabuleiro();
            const criatura = new Criatura("Goblin", 3, 5);

            expect(
                tabuleiro.possuiCriaturasNoTabuleiro()
            ).toBe(false);

            tabuleiro.conjurarCriatura(
                criatura,
                "fundo",
                Coluna.Direita
            );

            expect(
                tabuleiro.possuiCriaturasNoTabuleiro()
            ).toBe(true);
        });

        test("deve informar que está vazio depois que todas as criaturas forem removidas", () => {
            const tabuleiro = new Tabuleiro();
            const criatura = new Criatura("Goblin", 3, 5);

            tabuleiro.conjurarCriatura(
                criatura,
                "frente",
                Coluna.Esquerda
            );

            expect(
                tabuleiro.possuiCriaturasNoTabuleiro()
            ).toBe(true);

            tabuleiro.removerCriatura(
                "frente",
                Coluna.Esquerda
            );

            expect(
                tabuleiro.possuiCriaturasNoTabuleiro()
            ).toBe(false);
        });

    });

});