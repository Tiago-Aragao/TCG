export type TipoAtaque = "corpo-a-corpo" | "distancia" | "magico"; // Futuramente "Random Randint" Tipo de dano X-Y com alvos completamente aleatorios.

export class Criatura {
    nome: string;
    ataque: number;
    vida: number;
    tipoAtaque: TipoAtaque;
    // palavrasEfeito: PalavrasEfeitos[]; Será um array que ira guardar objetos de palavras de efeito.

    constructor(nome: string, ataque: number, vida: number, tipoAtaque: TipoAtaque = "corpo-a-corpo") {
        this.nome = nome;
        this.ataque = ataque;
        // Será refatorado e separado em vidaMaxima e vidaAtual para futuramente ter cura etc.
        this.vida = vida;
        /**
         * Quero modificar e criar uma classe inteiramente nova TipoAtaque onde uma criatura podera 
         * ter mais de um tipo, também facilitando a implementação de novos tipos de dano etc.
         * */
        this.tipoAtaque = tipoAtaque;
    }

    public receberDano(dano: number): void {
        this.vida -= dano;
        if (this.vida < 0) {
            this.vida = 0;
        }
    }

    public estaVivo(): boolean {
        return this.vida > 0;
    }
}