import { CartaCriatura } from "./CartaCriatura";
import { Deck } from "./Deck";
import { Jogador } from "./Jogador";
import { Partida } from "./Partida";
import { TelaConsole } from "./TelaConsole";


function criarDeckTeste(nome: string, idInicial: number): Deck {
    const deck = new Deck(nome);
    for (let i = 0; i < 29; i++) {

        const criatura = new CartaCriatura(
            idInicial + i,
            "Guerreiro de Teste",
            1,                  // custo de mana
            2,                  // ataque
            2,                  // vida
            "corpo-a-corpo"     // tipo de ataque
        );

        deck.adicionarCarta(criatura);
    }
    const arqueiro = new CartaCriatura(30, "Arqueiro Teste", 4, 4, 2, "distancia");
    deck.adicionarCarta(arqueiro);
    return deck;
}

const deckJogador1 = criarDeckTeste("Deck Jogador 1",1);

const deckJogador2 = criarDeckTeste("Deck Jogador 2",100);


// ==============================
// CRIAÇÃO DOS JOGADORES
// ==============================

const jogador1 = new Jogador(
    "Jogador 1",
    deckJogador1
);

const jogador2 = new Jogador(
    "Jogador 2",
    deckJogador2
);


// ==============================
// CRIAÇÃO DA PARTIDA
// ==============================

const partida = new Partida(
    jogador1,
    jogador2
);


// ==============================
// INTERFACE
// ==============================

const tela = new TelaConsole(partida);

await tela.executar();