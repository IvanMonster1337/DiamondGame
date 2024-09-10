import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GridService } from './grid.service';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
@Module({
  controllers: [GameController],
  providers: [GridService, GameService, GameGateway],
})
export class GameModule {}
