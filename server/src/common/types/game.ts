import { Grid } from './grid';
import { Player } from './player';

export enum Side {
  HOST = 'HOST',
  GUEST = 'GUEST',
}

export enum GameState {
  WAITING_FOR_OPPONENT = 'Waiting for opponent',
  IN_PROGRESS = 'In Progress',
  FINISHED = 'Finished',
}

export type Game = {
  id: string;
  state: GameState;
  grid: Grid;
  host: Player;
  currentPlayer: Side;
  guest?: Player;
  diamondsLeft: number;
  winner?: Side;
};
