import { Criatura } from "./Criatura";
import { Jogador } from "./Jogador";
import { Partida } from "./Partida";

// Criaturas do Jogador 1:
const criatura1J1 = new Criatura("Goblin Guerreiro", 3, 5);
const criatura2J1 = new Criatura("Goblin", 2, 4);
const criatura3J1 = new Criatura("Orc Problematico", 4,4);
// Criaturas do Jogador 2:
const criatura1J2 = new Criatura("Urso Grande", 4,10);
const criatura2J2 = new Criatura("Urso", 4,6);
const criatura3J2 = new Criatura("Urso Imenso", 4,8);

const jogador1 = new Jogador("Jogador 1", [criatura1J1, criatura2J1, criatura3J1]);
const jogador2 = new Jogador("Jogador 2", [criatura1J2, criatura2J2, criatura3J2]);

jogador1.tabuleiro.conjurarCriatura(jogador1.deck[0], "frente", 0);
jogador1.tabuleiro.conjurarCriatura(jogador1.deck[1], "frente", 1);
jogador1.tabuleiro.conjurarCriatura(jogador1.deck[2], "frente", 2);

jogador2.tabuleiro.conjurarCriatura(jogador2.deck[0], "frente", 0);
jogador2.tabuleiro.conjurarCriatura(jogador2.deck[1], "frente", 1);
jogador2.tabuleiro.conjurarCriatura(jogador2.deck[2], "frente", 2);

const partida = new Partida(jogador1, jogador2);

const vencedor = partida.executarPartida();

console.log("Vencedor:", vencedor?.nome ?? "Empate");