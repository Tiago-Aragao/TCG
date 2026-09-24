/**
 * Zona neutra para centralizar o retorno de resultados:
 */

// Para o Jogador:
export type ResultadoJogarCartaMao =
    | "Sucesso"
    | "ManaInsuficiente"
    | "CartaNaoEstaNaMao"
    | "PosicaoOcupada"
;

// Para partida uso o Union type, pelo que entendi é tipo herança do OO:
export type ResultadoTentarJogarCarta =
    | ResultadoJogarCartaMao // Herdo a resposta do type que usarei em Jogador assim a partida consome corretamente a resposta.
    | "ForaDaFasePrincipal"
;