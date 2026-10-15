import { Posicao } from "./Tabuleiro";

/**
* Registrador de eventos para serem consumidos pela TelaConsole.
*/

export type EventoAtaqueCriatura = {
    readonly tipo: "AtaqueCriatura";
    readonly nomeAtacante: string;
    readonly posicaoAtacante: Posicao;
    readonly nomeDefensor: string;
    readonly posicaoDefensor: Posicao;
    readonly danoCausado: number;
    readonly vidaAposDano: number;
};

export type EventoCriaturaDestruida = {
    readonly tipo: "CriaturaDestruida";
    readonly nomeCriatura: string;
    readonly posicaoCriatura: Posicao;
};

export type EventoAtaqueDireto = {
    readonly tipo: "AtaqueDireto";
    readonly nomeAtacante: string; // Criatura que está atacando.
    readonly posicaoAtacante: Posicao;
    readonly nomeDefensor: string; // Player que está sofrendo o ataque.
    readonly danoCausado: number;
    readonly vidaAposDano: number;
};

export type EventoAtaqueImpedido = {
    readonly tipo: "AtaqueImpedido";
    readonly nomeCriatura: string;
    readonly posicaoAtacante: Posicao;
    readonly motivo: | "LinhaInvalida" | "InvalidoTurno1";
};

export type EventoPartidaEncerrada = {
    readonly tipo: "PartidaEncerrada";
    readonly vencedorNome: string;
    readonly derrotadoNome: string
};

export type TiposEventos =
    | EventoAtaqueCriatura
    | EventoAtaqueDireto
    | EventoAtaqueImpedido
    | EventoCriaturaDestruida
    | EventoPartidaEncerrada;