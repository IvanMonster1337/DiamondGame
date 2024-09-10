import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Game, GameState, Side } from '../common/types/game';

@Injectable()
export class GameService {
  #clientPrefix = 'client' as const;
  #gamePrefix = 'game' as const;
  FIVE_MINUTES = 5 * 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getClient(clientId: string): Promise<string> {
    const socketId = (await this.cacheManager.get(
      `${this.#clientPrefix}:${clientId}`,
    )) as string;
    return socketId;
  }

  async createClient(socketId: string) {
    const clientId = crypto.randomUUID();
    await this.cacheManager.set(`${this.#clientPrefix}:${clientId}`, socketId);
    return clientId;
  }

  async updateClient(clientId: string, socketId: string) {
    await this.cacheManager.set(`${this.#clientPrefix}:${clientId}`, socketId);
  }

  async setGame(gameId: string, game: Game) {
    await this.cacheManager.set(
      `${this.#gamePrefix}:${gameId}`,
      game,
      this.FIVE_MINUTES,
    );
  }

  async getGame(gameId: string): Promise<Game> {
    const game = (await this.cacheManager.get(
      `${this.#gamePrefix}:${gameId}`,
    )) as Game;
    if (!game) {
      return;
    }

    return game;
  }

  async makeMove(gameId: string, game: Game, side: Side, x: number, y: number) {
    const cell = game.grid[y][x];
    if (cell.exposed) {
      return;
    }

    if (cell.value === 'D') {
      game.diamondsLeft--;

      if (side === Side.HOST) {
        game.host.score++;
      }

      if (side === Side.GUEST) {
        game.guest.score++;
      }

      if (game.diamondsLeft === 0) {
        game.winner =
          game.host.score > game.guest.score ? Side.HOST : Side.GUEST;
        game.state = GameState.FINISHED;
      }
    } else {
      game.currentPlayer = side === Side.HOST ? Side.GUEST : Side.HOST;
    }

    cell.exposed = true;

    await this.setGame(gameId, game);
    return game;
  }
}
