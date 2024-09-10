<script setup lang="ts">
import { GameState } from '@/common/types/game'
import type { Grid } from '@/common/types/grid'
import { Side } from '@/common/types/game'
import { store } from '@/socket/socket'
import Cell from './Cell.vue'
</script>

<template>
  <div v-if="store.gameState === GameState.WAITING_FOR_OPPONENT">
    <h1>Join code:</h1>
    <h1 class="green">{{ store.gameId }}</h1>
    <h3>{{ store.gameState }}</h3>
  </div>
  <div v-if="store.gameState !== GameState.WAITING_FOR_OPPONENT && store.grid">
    <div
      style="
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
      "
    >
      <h1>
        Your score:
        {{ store.side === Side.HOST ? store.hostScore : store.guestScore }}
      </h1>
      <h1>
        Diamonds left: {{ store.diamondsLeft }}
      </h1>
      <h1>
        Opponent score:
        {{ store.side === Side.HOST ? store.guestScore : store.hostScore }}
      </h1>
    </div>
    <div v-if="store.gameState === GameState.IN_PROGRESS">
      <h1 class="green" style="text-align: center">
        {{ store.side === store.currentPlayer ? 'Your turn' : 'Opponent turn' }}
      </h1>
    </div>
    <div
      v-if="store.gameState === GameState.FINISHED"
      style="text-align: center"
    >
      <h1 class="green">
        {{
          store.winner === store.side
            ? 'Congratulations! You won!'
            : 'You lost! Better luck next time!'
        }}
      </h1>
    </div>
    <div
      v-for="(row, y) in store.grid"
      style="
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: stretch;
      "
    >
      <Cell
        v-for="(cell, x) in row"
        :value="cell.value"
        :exposed="cell.exposed"
        :x="x"
        :y="y"
      />
    </div>
    <Vueform
      v-if="store.gameState === GameState.FINISHED"
      style="text-align: center; padding-top: 5%"
    >
      <ButtonElement name="exit" @click="() => store.clearGame()"
        >Exit</ButtonElement
      >
    </Vueform>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}
</style>
