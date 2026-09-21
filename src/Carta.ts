export type TipoCarta = "Criatura" | "Mágica" | "Equipamento";
// export type Tribo = "Humana" | "Animal" | "Monstruosa" | "Mortos-Vivos" | "Robôs || Alien" // Futuramente terá um Random Randint ou algo do genero que será um tipo que terão cartas com danos aleatorios em alvos aleatorios.

export abstract class Carta {
    readonly id: number;
    readonly nome: string;
    readonly custoMana: number;
    readonly tipoCarta: TipoCarta;
    // colecaoLancamento: string
    // tribo: string
    constructor(id: number, nome: string, custoMana: number, tipoCarta: TipoCarta) {
        this.id = id;
        this.nome = nome;
        this.custoMana = custoMana;
        this.tipoCarta = tipoCarta;
    }
}