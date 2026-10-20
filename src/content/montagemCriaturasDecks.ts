import { CartaCriatura } from "../game/CartaCriatura";
import { Deck } from "../game/Deck";

/**
 * Criação de 4 decks para eu testar em partidas, talvez faça mais algum outro deck caso sinta necessidade.
 */

export const criaturasParaDecks = {

    // Custo 0:
    aranhaFilhote: new CartaCriatura(1, 'Aranha Filhote', 0, 1, 1),
    servo: new CartaCriatura(2, 'Servo', 0, 0, 1, 'magico'),
    barreiraMagica: new CartaCriatura(3, 'Barreira Mágica', 0, 0, 3),
    // Custo  1:
    guerreiro: new CartaCriatura(4, 'Guerreiro', 1, 2, 4),
    golemMenor: new CartaCriatura(5, 'Golem Menor', 1, 0, 6),
    goblin: new CartaCriatura(6, 'Goblin', 1, 1, 3),
    arqueiro: new CartaCriatura(7, 'Arqueiro', 1, 2, 3, 'distancia'),
    besteiro: new CartaCriatura(8, 'Besteiro', 1, 3, 1, 'distancia'),
    magoAprendiz: new CartaCriatura(9, 'Mago Aprendiz', 1, 2,3, 'magico'),
    lichEnfraquecido: new CartaCriatura(10, 'Lich Enfraquecido', 1, 3, 1, 'magico'),
    // Custo 2:
    guerreiroArmadurado: new CartaCriatura(11, 'Guerreiro Armadurado', 2, 3, 6),
    golemMedio: new CartaCriatura(12, 'Golem Médio', 2, 1, 8),
    goblinGuerreiro: new CartaCriatura(13, 'Goblin Guerreiro', 2, 3, 3),
    arqueiroTreinado: new CartaCriatura(14, 'Arqueiro Treinado', 2, 4, 2, 'distancia'),
    besteiroPesado: new CartaCriatura(15, 'Besteiro Pesado', 2, 5, 3, 'distancia'),
    Monge: new CartaCriatura(16, 'Monge', 2, 3, 3, 'magico'),
    feiticeiro: new CartaCriatura(17, 'Feiticeiro', 2, 5, 1, 'magico'),
    // Custo 3:
    aranhaAlien: new CartaCriatura(18, 'Aranha Alien', 3, 6, 3),
    urso: new CartaCriatura(19, 'Urso', 3, 4, 8),
    muralhaViva: new CartaCriatura(20, 'Muralha Viva', 3, 0, 11),
    barbaroPedra: new CartaCriatura(21, 'Barbaro da Pedra', 3, 3, 7),
    tripod: new CartaCriatura(22, 'Tripod', 3, 5, 5, 'distancia'),
    dragaoZumbi: new CartaCriatura(23, 'Dragão Zumbi', 3, 6, 3, 'distancia'),
    mumia: new CartaCriatura(24, 'Muminho', 3, 7, 1, 'magico'),
    // Custo 4:
    cacadorAlien: new CartaCriatura(25, 'Caçador Alien', 4, 5, 8),
    tigre: new CartaCriatura(26, 'Tigre', 4, 7, 4),
    colosso: new CartaCriatura(27, 'Colosso', 4, 1, 12),
    canhaoCerrado: new CartaCriatura(28, 'Canhão Cerrado', 4, 10, 1),
    tubaraoVoador: new CartaCriatura(29, 'Tubarão Voador', 4, 6, 6),
    dragao: new CartaCriatura(30, 'Dragão', 4, 7, 6, 'distancia'),
    alienTecnomante: new CartaCriatura(31, 'Alien Tecnomante', 4, 5, 7, 'magico'),
    // Custo 5:
    slimeGigante: new CartaCriatura(32, 'Slime Gigante', 5, 3, 12),
    fantasma: new CartaCriatura(33, 'Fantasma', 5, 3, 10, 'magico'),
    // Custo 6:
    golemConcreto: new CartaCriatura(34, 'Golem de Concreto', 6, 0, 15),
    cospeAcido: new CartaCriatura(35, 'Cospe Ácido', 6, 8, 3, 'distancia'),
    magoSupremo: new CartaCriatura(36, 'Mago Supremo', 6, 6, 8, 'magico'),
    // Custo 8:
    aranhaPrimordial: new CartaCriatura(37, 'Aranha Primordial', 8, 12, 6, 'distancia'),
    primeiroMago: new CartaCriatura(38, 'Primeiro Mago', 8, 10, 6, 'magico'),
    guerreiroLendario: new CartaCriatura(39, 'Guerreiro Lendario', 8, 8, 12),
    montanhaViva: new CartaCriatura(40, 'Montanha Viva', 8, 4, 15),

}

// Deck de Fortaleza:
export const fortaleza = new Deck('Fortaleza');
// adicionando criaturas de custo 0:
fortaleza.adicionarCarta(criaturasParaDecks.barreiraMagica);
fortaleza.adicionarCarta(criaturasParaDecks.barreiraMagica);
fortaleza.adicionarCarta(criaturasParaDecks.barreiraMagica);
// Custo 1:
fortaleza.adicionarCarta(criaturasParaDecks.golemMenor);
fortaleza.adicionarCarta(criaturasParaDecks.golemMenor);
fortaleza.adicionarCarta(criaturasParaDecks.golemMenor);
// Custo 2:
fortaleza.adicionarCarta(criaturasParaDecks.guerreiroArmadurado);
fortaleza.adicionarCarta(criaturasParaDecks.guerreiroArmadurado);
fortaleza.adicionarCarta(criaturasParaDecks.guerreiroArmadurado);
fortaleza.adicionarCarta(criaturasParaDecks.golemMedio);
fortaleza.adicionarCarta(criaturasParaDecks.golemMedio);
fortaleza.adicionarCarta(criaturasParaDecks.golemMedio);
// Custo 3:
fortaleza.adicionarCarta(criaturasParaDecks.urso);
fortaleza.adicionarCarta(criaturasParaDecks.urso);
fortaleza.adicionarCarta(criaturasParaDecks.urso);
fortaleza.adicionarCarta(criaturasParaDecks.tripod);
fortaleza.adicionarCarta(criaturasParaDecks.tripod);
fortaleza.adicionarCarta(criaturasParaDecks.tripod);
// Custo 4:
fortaleza.adicionarCarta(criaturasParaDecks.colosso);
fortaleza.adicionarCarta(criaturasParaDecks.colosso);
fortaleza.adicionarCarta(criaturasParaDecks.colosso);
fortaleza.adicionarCarta(criaturasParaDecks.dragao);
fortaleza.adicionarCarta(criaturasParaDecks.dragao);
fortaleza.adicionarCarta(criaturasParaDecks.dragao);
// Custo 5:
fortaleza.adicionarCarta(criaturasParaDecks.fantasma);
fortaleza.adicionarCarta(criaturasParaDecks.fantasma);
fortaleza.adicionarCarta(criaturasParaDecks.fantasma);
// Custo 8:
fortaleza.adicionarCarta(criaturasParaDecks.montanhaViva);
fortaleza.adicionarCarta(criaturasParaDecks.montanhaViva);
fortaleza.adicionarCarta(criaturasParaDecks.montanhaViva);

// Deck Agressivo:
export const agressivo = new Deck('Agressivo');
// Custo 0:
agressivo.adicionarCarta(criaturasParaDecks.aranhaFilhote);
agressivo.adicionarCarta(criaturasParaDecks.aranhaFilhote);
agressivo.adicionarCarta(criaturasParaDecks.aranhaFilhote);
// Custo 1:
agressivo.adicionarCarta(criaturasParaDecks.guerreiro);
agressivo.adicionarCarta(criaturasParaDecks.guerreiro);
agressivo.adicionarCarta(criaturasParaDecks.guerreiro);
agressivo.adicionarCarta(criaturasParaDecks.besteiro);
agressivo.adicionarCarta(criaturasParaDecks.besteiro);
agressivo.adicionarCarta(criaturasParaDecks.besteiro);
// Custo 2:
agressivo.adicionarCarta(criaturasParaDecks.goblinGuerreiro);
agressivo.adicionarCarta(criaturasParaDecks.goblinGuerreiro);
agressivo.adicionarCarta(criaturasParaDecks.goblinGuerreiro);
agressivo.adicionarCarta(criaturasParaDecks.besteiroPesado);
agressivo.adicionarCarta(criaturasParaDecks.besteiroPesado);
agressivo.adicionarCarta(criaturasParaDecks.besteiroPesado);
// Custo 3:
agressivo.adicionarCarta(criaturasParaDecks.aranhaAlien);
agressivo.adicionarCarta(criaturasParaDecks.aranhaAlien);
agressivo.adicionarCarta(criaturasParaDecks.aranhaAlien);
agressivo.adicionarCarta(criaturasParaDecks.dragaoZumbi);
agressivo.adicionarCarta(criaturasParaDecks.dragaoZumbi);
agressivo.adicionarCarta(criaturasParaDecks.dragaoZumbi);
// Custo 4:
agressivo.adicionarCarta(criaturasParaDecks.tigre);
agressivo.adicionarCarta(criaturasParaDecks.tigre);
agressivo.adicionarCarta(criaturasParaDecks.tigre);
agressivo.adicionarCarta(criaturasParaDecks.canhaoCerrado);
agressivo.adicionarCarta(criaturasParaDecks.canhaoCerrado);
agressivo.adicionarCarta(criaturasParaDecks.canhaoCerrado);
// Custo 8:
agressivo.adicionarCarta(criaturasParaDecks.guerreiroLendario);
agressivo.adicionarCarta(criaturasParaDecks.guerreiroLendario);
agressivo.adicionarCarta(criaturasParaDecks.guerreiroLendario);

// Deck Distancia:
export const distancia = new Deck("Distância");
// Custo 1:
distancia.adicionarCarta(criaturasParaDecks.goblin);
distancia.adicionarCarta(criaturasParaDecks.goblin);
distancia.adicionarCarta(criaturasParaDecks.goblin);
distancia.adicionarCarta(criaturasParaDecks.arqueiro);
distancia.adicionarCarta(criaturasParaDecks.arqueiro);
distancia.adicionarCarta(criaturasParaDecks.arqueiro);
// CUsto 2:
distancia.adicionarCarta(criaturasParaDecks.arqueiroTreinado);
distancia.adicionarCarta(criaturasParaDecks.arqueiroTreinado);
distancia.adicionarCarta(criaturasParaDecks.arqueiroTreinado);
// Custo 3:
distancia.adicionarCarta(criaturasParaDecks.barbaroPedra);
distancia.adicionarCarta(criaturasParaDecks.barbaroPedra);
distancia.adicionarCarta(criaturasParaDecks.barbaroPedra);
distancia.adicionarCarta(criaturasParaDecks.tripod);
distancia.adicionarCarta(criaturasParaDecks.tripod);
distancia.adicionarCarta(criaturasParaDecks.tripod);
//Custo 4:
distancia.adicionarCarta(criaturasParaDecks.cacadorAlien);
distancia.adicionarCarta(criaturasParaDecks.cacadorAlien);
distancia.adicionarCarta(criaturasParaDecks.cacadorAlien);
distancia.adicionarCarta(criaturasParaDecks.tubaraoVoador);
distancia.adicionarCarta(criaturasParaDecks.tubaraoVoador);
distancia.adicionarCarta(criaturasParaDecks.tubaraoVoador);
distancia.adicionarCarta(criaturasParaDecks.alienTecnomante);
distancia.adicionarCarta(criaturasParaDecks.alienTecnomante);
distancia.adicionarCarta(criaturasParaDecks.alienTecnomante);
// Custo 6:
distancia.adicionarCarta(criaturasParaDecks.cospeAcido);
distancia.adicionarCarta(criaturasParaDecks.cospeAcido);
distancia.adicionarCarta(criaturasParaDecks.cospeAcido);
// Custo 8:
distancia.adicionarCarta(criaturasParaDecks.aranhaPrimordial);
distancia.adicionarCarta(criaturasParaDecks.aranhaPrimordial);
distancia.adicionarCarta(criaturasParaDecks.aranhaPrimordial);

// Magico:
export const magico = new Deck('Mágico');
// Custo 0:
magico.adicionarCarta(criaturasParaDecks.servo);
magico.adicionarCarta(criaturasParaDecks.servo);
magico.adicionarCarta(criaturasParaDecks.servo);
// Custo 1:
magico.adicionarCarta(criaturasParaDecks.magoAprendiz);
magico.adicionarCarta(criaturasParaDecks.magoAprendiz);
magico.adicionarCarta(criaturasParaDecks.magoAprendiz);
magico.adicionarCarta(criaturasParaDecks.lichEnfraquecido);
magico.adicionarCarta(criaturasParaDecks.lichEnfraquecido);
magico.adicionarCarta(criaturasParaDecks.lichEnfraquecido);
// Custo 2:
magico.adicionarCarta(criaturasParaDecks.Monge);
magico.adicionarCarta(criaturasParaDecks.Monge);
magico.adicionarCarta(criaturasParaDecks.Monge);
magico.adicionarCarta(criaturasParaDecks.feiticeiro);
magico.adicionarCarta(criaturasParaDecks.feiticeiro);
magico.adicionarCarta(criaturasParaDecks.feiticeiro);
// Custo 3:
magico.adicionarCarta(criaturasParaDecks.mumia);
magico.adicionarCarta(criaturasParaDecks.mumia);
magico.adicionarCarta(criaturasParaDecks.mumia);
// Custo 4:
magico.adicionarCarta(criaturasParaDecks.alienTecnomante);
magico.adicionarCarta(criaturasParaDecks.alienTecnomante);
magico.adicionarCarta(criaturasParaDecks.alienTecnomante);
// Custo 5:
magico.adicionarCarta(criaturasParaDecks.fantasma);
magico.adicionarCarta(criaturasParaDecks.fantasma);
magico.adicionarCarta(criaturasParaDecks.fantasma);
// Custo 6:
magico.adicionarCarta(criaturasParaDecks.magoSupremo);
magico.adicionarCarta(criaturasParaDecks.magoSupremo);
magico.adicionarCarta(criaturasParaDecks.magoSupremo);
// Custo 8:
magico.adicionarCarta(criaturasParaDecks.primeiroMago);
magico.adicionarCarta(criaturasParaDecks.primeiroMago);
magico.adicionarCarta(criaturasParaDecks.primeiroMago);

export const decksParaTeste = {
    fortaleza,
    agressivo,
    distancia,
    magico
} as const;
