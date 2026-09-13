import { Criatura } from "./Criatura";

export type Linha = "frente" | "fundo";
export enum Coluna {
    Esquerda = 0,
    Meio = 1,
    Direita = 2
}

export class Tabuleiro {
    public frente: [Criatura | null, Criatura | null, Criatura | null];
    public fundo: [Criatura | null, Criatura | null, Criatura | null];

    constructor () {
        this.frente = [null, null, null];
        this.fundo = [null, null, null];
    }

    public conjurarCriatura (criatura: Criatura, linha: Linha, coluna: Coluna): boolean {
        const qualFileira = linha === 'frente' ? this.frente: this.fundo;

        if(qualFileira[coluna] != null) {
            // Espaço já ocupado:
            return false;
        }
        // Espaço estava vazio, logo:
        qualFileira[coluna] = criatura;
        return true;
    }

    public removerCriatura(local: Linha, posicao: Coluna): void {
        if (local === "frente") {
            this.frente[posicao] = null;
        } else {
            this.fundo[posicao] = null;
        }
    }

    public obterCriatura(linha: Linha, coluna: Coluna): Criatura | null {
        if (linha === "frente") {
            return this.frente[coluna]; // retorna o que está na posição e nao a posição em si.
        } else {
            return this.fundo[coluna]; // O mesmo vale para aka.
        }
    }
}