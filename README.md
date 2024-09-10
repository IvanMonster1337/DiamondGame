# DiamondGame
## TODO
- [ ] Move common types, event names and contracts to additional library
- [ ] Move hardcoded hostnames to `.env` or config
- [ ] Use Redis as cache manager or storage
- [ ] Disassemble `Grid.vue` for smaller components
## Running
### Client
In order to run the client, use the following commands:
```bash
npm i
npm run build
npx vite preview
```
### Server
For running server, please use:
```bash
npm i
npm run build
npm run start
```
## Game Start
The game requires two clients: host and guest. Please open an additional private tab in your browser if you want to be both player and opponent.
### Host
Host creates the game by entering grid dimension(e.g. 5 - 5x5 grid) and the amount of diamonds to be located in the grid. Upon creating a game, host should pass the code to the guest.
### Guest
Guest uses the code provided by host to join the game.
## Game rules and win condition
Player clicks on the cell on his turn. If cell is a diamond, player gets his score increased and an additional turn, otherwise it shows how many diamonds are located around the cell and turn passes to another player. Player who located more diamonds wins, game ends when all of the diamonds are found.
