import { TipoAtaque } from "../game/Criatura";

/**
 * Primeiro para criação do bot eu preciso "tirar uma foto" do campo para ele fazer
 * as simulações e decidir qual a melhor opção. Logo inicialmente o calculoTatico será a 
 * camera.
 */

/**
 * Crio o molde de como deve ser a foto da criatura:
 */
export type FotoCriatura = {
    /** Os dados são apenas de leitura pois nao quero alterar sem querer futuramente */
    readonly nome: string,
    readonly ataque: number,
    readonly vidaAtual: number, // Quero apenas os pontos de vida atual da criatura.
}