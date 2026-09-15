import { describe, expect, test } from "vitest";
import { Criatura } from "../Criatura";

describe("Criatura", () => {

    describe("Criação", () => {

        // Testando criação
        test("deve criar uma criatura com os atributos informados", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            expect(criatura.nome).toBe("Goblin");
            expect(criatura.ataque).toBe(3);
            expect(criatura.vida).toBe(5);
        });

        // Deve vir como Corpo-a-Corpo
        test("deve ter corpo-a-corpo como tipo de ataque padrão", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            expect(criatura.tipoAtaque).toBe("corpo-a-corpo");
        });

        test("deve respeitar o tipo de ataque informado", () => {
            const criatura = new Criatura(
                "Arqueiro",
                3,
                4,
                "distancia"
            );

            expect(criatura.tipoAtaque).toBe("distancia");
        });

        test("deve aceitar criatura com ataque mágico", () => {
            const criatura = new Criatura(
                "Mago",
                5,
                3,
                "magico"
            );

            expect(criatura.tipoAtaque).toBe("magico");
        });
    });


    describe("Vida", () => {

        test("deve reduzir a vida ao receber dano", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            criatura.receberDano(2);

            expect(criatura.vida).toBe(3);
        });

        test("deve continuar viva enquanto possuir mais de 0 de vida", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            criatura.receberDano(4);

            expect(criatura.vida).toBe(1);
            expect(criatura.estaVivo()).toBe(true);
        });

        test("deve morrer ao chegar a 0 de vida", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            criatura.receberDano(5);

            expect(criatura.vida).toBe(0);
            expect(criatura.estaVivo()).toBe(false);
        });

        test("a vida não deve ficar abaixo de 0", () => {
            const criatura = new Criatura(
                "Goblin",
                3,
                5
            );

            criatura.receberDano(100);

            expect(criatura.vida).toBe(0);
            expect(criatura.estaVivo()).toBe(false);
        });
    });
});