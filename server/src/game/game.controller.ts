import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { GridService } from './grid.service';
import { GameService } from './game.service';
import { Game, GameState, Side } from '../common/types/game';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(
    private readonly gridService: GridService,
    private readonly gameService: GameService,
  ) {}

  @Post()
  async createField(@Body() createFieldDto: CreateGameDto) {
    const { dimension, diamondCount, clientId } = createFieldDto;
    if (diamondCount > dimension * dimension) {
      throw new BadRequestException('Diamond count is bigger than field size');
    }

    const socketId = await this.gameService.getClient(clientId);
    if (!socketId) {
      throw new BadRequestException('Client not found');
    }

    const grid = this.gridService.createGrid(dimension, diamondCount);
    const game: Game = {
      id: crypto.randomUUID(),
      state: GameState.WAITING_FOR_OPPONENT,
      host: {
        clientId,
        score: 0,
      },
      grid,
      currentPlayer: Side.HOST,
      diamondsLeft: diamondCount,
    };

    await this.gameService.setGame(game.id, game);
    return {
      gameId: game.id,
      state: game.state,
    };
  }
}
