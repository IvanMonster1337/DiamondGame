import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    GameModule,
    CacheModule.register({
      ttl: 0, //no ttl
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
