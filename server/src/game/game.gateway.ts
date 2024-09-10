import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Game, GameState, Side } from 'src/common/types/game';
import { GridService } from './grid.service';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private gridService: GridService,
  ) {}

  async handleConnection(socket: Socket) {
    const { clientId, gameId } = socket.handshake.query as {
      clientId: string;
      gameId: string;
    };
    const socketId = socket.id;
    if (!clientId) {
      const clientId = await this.gameService.createClient(socketId);
      socket.emit('connected', { clientId });
      return;
    }

    await this.gameService.updateClient(clientId, socketId);
    socket.emit('connected', { clientId });

    if (gameId) {
      const game: Game = await this.gameService.getGame(gameId);
      if (!game) {
        socket.emit('joinError', 'Game not found');
        return;
      }

      if (game.state === GameState.FINISHED) {
        socket.emit('gameOutdated');
        return;
      }

      if (game.state === GameState.WAITING_FOR_OPPONENT) {
        socket.emit('gameRejoin', { state: game.state });
        return;
      }

      if (game.state === GameState.IN_PROGRESS) {
        socket.join(gameId);
        socket.emit('gameRejoin', {
          state: game.state,
          grid: this.gridService.getHiddenGrid(game.grid),
          side: game.host.clientId === clientId ? Side.HOST : Side.GUEST,
          currentPlayer: game.currentPlayer,
          hostScore: game.host.score,
          guestScore: game.guest.score,
        });
        return;
      }
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      clientId: string;
      gameId: string;
    },
  ) {
    const { clientId, gameId } = data;
    const game: Game = await this.gameService.getGame(gameId);
    if (!game) {
      socket.emit('joinError', 'Game not found');
      return;
    }

    if (game.state === GameState.FINISHED) {
      socket.emit('joinError', 'Game is already finished');
      return;
    }

    if (!game.guest) {
      game.guest = {
        clientId,
        score: 0,
      };
      game.state = GameState.IN_PROGRESS;
      await this.gameService.setGame(gameId, game);

      const hostId = game.host.clientId;
      const hostSocketId = await this.gameService.getClient(hostId);
      const hostSocket = this.server.sockets.sockets.get(hostSocketId);
      await Promise.all([hostSocket.join(gameId), socket.join(gameId)]);

      this.server.to(gameId).emit('gameStarted', {
        id: game.id,
        grid: this.gridService.getHiddenGrid(game.grid),
        state: game.state,
        hostScore: game.host.score,
        guestScore: game.guest.score,
        diamondsLeft: game.diamondsLeft,
        currentPlayer: game.currentPlayer,
      });
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      clientId: string;
      gameId: string;
      x: number;
      y: number;
    },
  ) {
    const { clientId, gameId, x, y } = data;
    const game: Game = await this.gameService.getGame(gameId);
    if (!game) {
      socket.emit('gameOutdated');
      return;
    }

    if (game.state !== GameState.IN_PROGRESS) {
      socket.emit('gameOutdated');
      return;
    }

    if (clientId !== game.host.clientId && clientId !== game.guest?.clientId) {
      socket.emit('gameOutdated');
      return;
    }

    const side = clientId === game.host.clientId ? Side.HOST : Side.GUEST;

    if (game.currentPlayer !== side) {
      return;
    }

    const updatedGame = await this.gameService.makeMove(
      gameId,
      game,
      side,
      x,
      y,
    );
    if (!updatedGame) {
      return;
    }

    if (updatedGame.state === GameState.FINISHED) {
      this.server.to(gameId).emit('gameFinished', {
        grid: this.gridService.getExposedGrid(updatedGame.grid),
        hostScore: updatedGame.host.score,
        guestScore: updatedGame.guest.score,
        diamondsLeft: game.diamondsLeft,
        winner: updatedGame.winner,
      });
      return;
    }

    this.server.to(gameId).emit('gameUpdated', {
      grid: this.gridService.getHiddenGrid(updatedGame.grid),
      state: updatedGame.state,
      hostScore: updatedGame.host.score,
      guestScore: updatedGame.guest.score,
      diamondsLeft: game.diamondsLeft,
      currentPlayer: updatedGame.currentPlayer,
    });
  }
}
