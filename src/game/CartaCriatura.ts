import { Carta } from "./Carta";
import { Criatura, TipoAtaque } from "./Criatura";

export class CartaCriatura extends Carta {
    /*
        * Será template + factory da Criatura:
    */
    readonly ataque: number;
    readonly vida: number;
    readonly tipoAtaque: TipoAtaque;

    constructor(id: number, nome: string, custoMana: number, ataque: number, vida: number, tipoAtaque: TipoAtaque = 'corpo-a-corpo') {
        // Construtor da classe pai:
        super(id, nome, custoMana, 'Criatura');
        // Inicializando normalmente o tipo da carta:
        this.ataque = ataque;
        this.vida = vida;
        this.tipoAtaque = tipoAtaque;
    }

    public criarCriatura (): Criatura {
        return new Criatura(this.nome, this.ataque, this.vida, this.tipoAtaque);
    }

}