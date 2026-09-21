import { Carta } from "./Carta";
import { CartaCriatura} from "./CartaCriatura"
import { Tabuleiro, Posicao } from "./Tabuleiro";
import { Deck } from "./Deck";

export class Jogador {
    /**
     * Está classe seráo Jogador dentro da PARTIDA.
     * O MANAGER será uma classe separada que terá dindin, coleção, varios decks e outra classe MANAGERIA irá herdar ela com atributos excluisvos para IA.
     */
    public readonly nome: string;
    // Pontos de vida:
    vidaInicial: number;
    vidaAtual: number;
    // Mana:
    private mana: number = 0;
    // ----------- 
    tabuleiro: Tabuleiro;
    deck: Deck;
    mao: Carta[];
    
    constructor(nome: string, deckPartida: Deck) {
        this.nome = nome;
        this.vidaInicial = 20;
        this.vidaAtual = this.vidaInicial;
        this.deck = deckPartida;
        this.mao = [];
        this.tabuleiro = new Tabuleiro();
    }

    // Mana e suas regras:
    public get mostrarMana(): number {
        return this.mana;
    }

    public gerarManaTurno(turnoAtual: number): void {
        this.mana = Math.min(6, Math.ceil(turnoAtual/2));
    }

    public gastarMana(custo:number): boolean {
        if (custo > this.mana) return false;
        if (custo < 0) return false;
        this.mana -= custo;
        return true; // consegui gastar a mana amigos.
    }
    // Operação de consulta que será "auxiliar" do jogarCarta:
    public possuiManaSuficiente(custo: number): boolean {
        /**
         * Verifico o custo de mana sem precisar gastar a mana.
         */
        return custo >= 0 && custo <= this.mana;
    }

    // Para fase de preparação:
    public jogarCartaMao(qualCarta: CartaCriatura, posicao: Posicao): boolean {
        // Verifico se a carta existe na mão:
        if (!this.mao.includes(qualCarta)) {
            return false;
        }
        // Verifico se tenho mana suficiente:
        if (!this.possuiManaSuficiente(qualCarta.custoMana)) {
            return false;
        }
        //
        if (!this.tabuleiro.podeConjurarCriatura(posicao.linha, posicao.coluna)) {
            return false;
        }
        const criatura = qualCarta.criarCriatura();
        this.tabuleiro.conjurarCriatura(criatura, posicao.linha, posicao.coluna);
        this.gastarMana(qualCarta.custoMana);
        // Agora removo ele da mão:
        const indiceCarta = this.mao.findIndex(carta => carta === qualCarta);
        this.mao.splice(indiceCarta, 1);
        return true;
    }

    // Compras de Cartas:
    public comprarCarta(): boolean {
        const card = this.deck.compraCarta();
        if (card != null) {
            this.mao.push(card);
            return true;
        }
        return false;
    }

    public comprarMaoInicial(): void {
        // Compra 5 cartas
        for (let i=0;i<5;i++) {
            this.comprarCarta();
        }
    }

    public fazerMulliganEuropeu(): void {
        for(let i=0;i<this.mao.length;i++) {
            this.deck.adicionarCarta(this.mao[i]);
        }
        this.mao = [];
        this.deck.embaralhar();
        this.comprarMaoInicial();
    }

    // Combate:
    public receberDano(dano:number): void {
        this.vidaAtual -= dano;
    }

    public recuperarPontosVida(cura:number):void {
        this.vidaAtual += (cura<0)?0:cura;
    }
    
    // Verificação de estado:
    public estaVivo(): boolean {
        return this.vidaAtual > 0;
    }
    

}