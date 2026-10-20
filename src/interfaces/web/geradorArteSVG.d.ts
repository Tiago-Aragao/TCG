/** Interface publica do gerador procedural, independente do motor de partidas. */
export interface OpcoesArteSVG {
    seed?: string;
    fundo?: boolean;
    subtipo?: string;
    genero?: "M" | "F";
}

export declare function gerarSVG(tipo: string, opcoes?: OpcoesArteSVG): string;
export declare function gerarCriatura(tipo: string, opcoes?: OpcoesArteSVG): HTMLImageElement;
export declare const TIPOS: string[];
export declare const SUBTIPOS: Record<number, string[]>;
export declare const NOMES_SUBTIPOS: Record<string, string>;
