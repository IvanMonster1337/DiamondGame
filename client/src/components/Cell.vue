<script setup lang="ts">
import { computed } from 'vue'
import { socket, store } from '@/socket/socket'
import { GameState } from '@/common/types/game'
const DIAMOND = 'D'
const props = defineProps<{
  value: 'D' | number | ''
  exposed: boolean
  x: number
  y: number
}>()
const classObject = computed(() => {
  if (props.exposed && props.value === DIAMOND) {
    return 'game-diamond'
  }

  if (props.exposed && typeof props.value === 'number') {
    return 'game-open'
  }

  return ''
})
</script>

<template>
  <div
    class="game-cell"
    :class="classObject"
    @click="
      () => {
        if (store.gameState === GameState.FINISHED) {
          return
        }

        socket.emit('makeMove', {
          x: props.x,
          y: props.y,
          clientId: store.clientId,
          gameId: store.gameId
        })
      }
    "
  >
    {{ props.value }}
  </div>
</template>

<style lang="scss">
.game {
  &-cell {
    align-items: center;
    background: rgba(0, 0, 0, 0.1);
    border: 1px white solid;
    color: #e8f1f9;
    cursor: pointer;
    display: flex;
    font-size: 1.3em;
    justify-content: center;
    min-height: 60px;
    min-width: 60px;
  }

  &-diamond {
    background: #02c0ff;
  }

  &-open {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
