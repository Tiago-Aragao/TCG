import { Criatura } from "./Criatura";
import { Jogador } from "./Jogador";
import { Partida } from "./Partida";
import { Coluna } from "./Tabuleiro"; // Não esqueça de importar o Enum!

const criatura1jogador1 = new Criatura("Guerreiro Dir (J1)", 3, 10);
const jogador1 = new Jogador("Mauricio Matar", [criatura1jogador1]);

const criatura1jogador2 = new Criatura("Guerreiro Esq (J2)", 1, 6);
const criatura2jogador2 = new Criatura("Guerreiro Dir (J2)", 3, 6);
const jogador2 = new Jogador("Mauricio Morrer", [criatura1jogador2, criatura2jogador2]);

jogador1.tabuleiro.conjurarCriatura(jogador1.deck[0], 'frente', Coluna.Direita);

jogador2.tabuleiro.conjurarCriatura(jogador2.deck[0], 'frente', Coluna.Esquerda);
jogador2.tabuleiro.conjurarCriatura(jogador2.deck[1], 'frente', Coluna.Direita);

const partida = new Partida(jogador1, jogador2);
const vencedor = partida.executarPartida();

console.log("===============================");
console.log(`VENCEDOR DA PARTIDA: ${vencedor?.nome ?? "Empate"}`);
console.log("===============================");