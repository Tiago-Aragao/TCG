import { describe, expect, test } from "vitest";
import { CartaCriatura } from "../CartaCriatura";

describe("CartaCriatura", () => {

    test("deve armazenar corretamente os dados da carta", () => {
        const carta = new CartaCriatura(
            1,
            "Guerreiro",
            3,
            5,
            10,
            "corpo-a-corpo"
        );

        expect(carta.id).toBe(1);
        expect(carta.nome).toBe("Guerreiro");
        expect(carta.custoMana).toBe(3);
        expect(carta.tipoCarta).toBe("Criatura");
        expect(carta.ataque).toBe(5);
        expect(carta.vida).toBe(10);
        expect(carta.tipoAtaque).toBe("corpo-a-corpo");
    });


    test("deve usar corpo-a-corpo como tipo de ataque padrão", () => {
        const carta = new CartaCriatura(
            1,
            "Guerreiro",
            3,
            5,
            10
        );

        expect(carta.tipoAtaque).toBe("corpo-a-corpo");
    });


    test("deve criar uma Criatura com base nos dados da carta", () => {
        const carta = new CartaCriatura(
            1,
            "Guerreiro",
            3,
            5,
            10,
            "corpo-a-corpo"
        );

        const criatura = carta.criarCriatura();

        expect(criatura.nome).toBe("Guerreiro");
        expect(criatura.ataque).toBe(5);
        expect(criatura.vida).toBe(10);
        expect(criatura.tipoAtaque).toBe("corpo-a-corpo");
    });


    test("cada chamada de criarCriatura deve gerar uma nova instância", () => {
        const carta = new CartaCriatura(
            1,
            "Guerreiro",
            3,
            5,
            10
        );

        const criatura1 = carta.criarCriatura();
        const criatura2 = carta.criarCriatura();

        expect(criatura1).not.toBe(criatura2);
    });


    test("alterações na criatura criada não devem alterar os dados da carta", () => {
        const carta = new CartaCriatura(
            1,
            "Guerreiro",
            3,
            5,
            10
        );

        const criatura = carta.criarCriatura();

        criatura.receberDano(4);

        expect(criatura.vida).toBe(6);
        expect(carta.vida).toBe(10);
    });

});