import { Carta } from "../Carta";
import { CartaCriatura } from "../CartaCriatura";
import { Jogador } from "../Jogador";
import { Partida } from "../Partida";
import { Coluna, Posicao } from "../Tabuleiro";
import { TiposEventos } from "../tiposEventos";

/**
 * Bot propositalmente simples para playtests iniciais.
 *
 * Ele não tenta "jogar bem". A função dele é apenas permitir que uma pessoa
 * jogue contra o motor sem precisar de um segundo jogador humano.
 */
export type ResultadoTurnoBot = {
    readonly eventos: TiposEventos[];
    readonly acoes: string[];
};

export class BotSimples {
    constructor(private readonly jogador: Jogador) {}

    public executarAcoes(partida: Partida): string[] {
        let sacrificouNesteTurno = false;
        const acoes: string[] = [];

        while (partida.estado === "FasePrincipal" && partida.obterJogadorAtivo() === this.jogador) {
            const jogada = this.encontrarMelhorJogadaDisponivel();

            if (jogada !== null) {
                const resultado = partida.tentarJogarCarta(jogada.carta, jogada.posicao);

                if (resultado === "Sucesso") {
                    acoes.push(`${this.jogador.nome} jogou ${jogada.carta.nome} em ${jogada.posicao.linha}/${this.nomeColuna(jogada.posicao.coluna)}.`);
                    continue;
                }

                // Se uma jogada calculada falhar por alguma mudança inesperada
                // de estado, não insistimos em loop infinito.
                break;
            }

            if (!sacrificouNesteTurno) {
                const indiceParaSacrificar = this.escolherIndiceCartaParaSacrificar();
                const cartaParaSacrificar = indiceParaSacrificar === null ? null : this.jogador.mao[indiceParaSacrificar];
                const existeCartaLiberadaComMaisDois = this.existeJogadaPossivelComMana(this.jogador.mostrarMana + 2, indiceParaSacrificar);

                if (cartaParaSacrificar !== null && existeCartaLiberadaComMaisDois) {
                    const resultado = partida.tentarSacrificarCartaMao(cartaParaSacrificar);

                    if (resultado === "Sucesso") {
                        acoes.push(`${this.jogador.nome} sacrificou ${cartaParaSacrificar.nome} da mão para gerar mana.`);
                        sacrificouNesteTurno = true;
                        continue;
                    }
                }
            }

            break;
        }

        return acoes;
    }

    /**
     * Mantido para compatibilidade com o protótipo anterior.
     * A interface web usa executarAcoes() para conseguir mostrar o campo
     * antes de pedir que a Partida resolva o combate.
     */
    public executarTurno(partida: Partida): ResultadoTurnoBot {
        const acoes = this.executarAcoes(partida);
        return {
            eventos: partida.passarTurno(),
            acoes
        };
    }

    private nomeColuna(coluna: Coluna): string {
        switch (coluna) {
            case Coluna.Esquerda: return "esquerda";
            case Coluna.Meio: return "meio";
            case Coluna.Direita: return "direita";
        }
    }

    private encontrarMelhorJogadaDisponivel(): { carta: CartaCriatura; posicao: Posicao } | null {
        const criaturasJogaveis = this.jogador.mao
            .filter((carta): carta is CartaCriatura => carta instanceof CartaCriatura)
            .filter(carta => this.jogador.possuiManaSuficiente(carta.custoMana))
            .map(carta => ({ carta, posicao: this.encontrarPosicaoPreferida(carta) }))
            .filter((jogada): jogada is { carta: CartaCriatura; posicao: Posicao } => jogada.posicao !== null)
            .sort((a, b) => {
                if (b.carta.custoMana !== a.carta.custoMana) {
                    return b.carta.custoMana - a.carta.custoMana;
                }

                if (b.carta.ataque !== a.carta.ataque) {
                    return b.carta.ataque - a.carta.ataque;
                }

                return b.carta.vida - a.carta.vida;
            });

        return criaturasJogaveis[0] ?? null;
    }

    private existeJogadaPossivelComMana(manaDisponivel: number, indiceIgnorado: number | null): boolean {
        return this.jogador.mao.some((carta, indice) => {
            if (!(carta instanceof CartaCriatura)) {
                return false;
            }

            if (indice === indiceIgnorado || carta.custoMana > manaDisponivel) {
                return false;
            }

            return this.encontrarPosicaoPreferida(carta) !== null;
        });
    }

    private escolherIndiceCartaParaSacrificar(): number | null {
        if (this.jogador.mao.length < 2) {
            return null;
        }

        let melhorIndice = 0;
        let menorValor = this.valorCarta(this.jogador.mao[0]);

        for (let indice = 1; indice < this.jogador.mao.length; indice++) {
            const valor = this.valorCarta(this.jogador.mao[indice]);
            if (valor < menorValor) {
                melhorIndice = indice;
                menorValor = valor;
            }
        }

        return melhorIndice;
    }

    private valorCarta(carta: Carta): number {
        if (carta instanceof CartaCriatura) {
            return carta.ataque + carta.vida + carta.custoMana;
        }

        return carta.custoMana;
    }

    private encontrarPosicaoPreferida(carta: CartaCriatura): Posicao | null {
        const ordemColunas = [Coluna.Meio, Coluna.Esquerda, Coluna.Direita] as const;

        const linhas = carta.tipoAtaque === "corpo-a-corpo"
            ? (["frente"] as const)
            : carta.tipoAtaque === "distancia"
                ? (["fundo"] as const)
                : (["frente", "fundo"] as const);

        for (const linha of linhas) {
            for (const coluna of ordemColunas) {
                if (this.jogador.tabuleiro.podeConjurarCriatura(linha, coluna)) {
                    return { linha, coluna };
                }
            }
        }

        return null;
    }
}
