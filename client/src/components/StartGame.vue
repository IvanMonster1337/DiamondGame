<script setup lang="ts">
import type { AxiosError } from 'axios'
import { ref } from 'vue'
import { socket, store } from '@/socket/socket'
import { Side } from '@/common/types/game'

defineProps<{
  joinText: string
  createGameText: string
}>()

const joinSchema = ref({
  code: { type: 'text', label: 'Code' },
  submit: { type: 'button', buttonLabel: 'Join', submits: true }
})
const createGameSchema = ref({
  dimension: {
    type: 'text',
    label: 'Dimension',
    rules: 'required|integer|min:1|max:6'
  },
  diamondCount: {
    type: 'text',
    label: 'Diamonds Count',
    rules: 'required|integer|min:1|is_odd'
  },
  submit: { type: 'button', buttonLabel: 'Create game', submits: true }
})
</script>

<template>
  <div class="greetings">
    <h2 class="green">{{ joinText }}</h2>
    <Vueform
      :schema="joinSchema"
      :endpoint="false"
      @submit="
        (form$: any) => {
          const { code } = form$.data
          store.clearGame()
          store.side = Side.GUEST
          socket.emit('joinGame', { gameId: code, clientId: store.clientId })
        }
      "
    >
    </Vueform>
    <h3 v-if="store.joinError" class="red">{{ store.joinError }}</h3>
    <h2 class="green">{{ createGameText }}</h2>
    <Vueform
      :schema="createGameSchema"
      :endpoint="false"
      @submit="
        async (form$: any) => {
          form$.messageBag.clear()
          const { dimension, diamondCount } = form$.data

          form$.submitting = true

          const response = await form$.$vueform.services.axios
            .post('/games', {
              dimension: parseInt(dimension, 10),
              diamondCount: parseInt(diamondCount, 10),
              clientId: store.clientId
            })
            .catch((e: AxiosError<{ message: string }>) => {
              if (e.response) {
                const { data } = e.response
                form$.messageBag.append(data?.message)
              }
            })

          form$.submitting = false

          if (!response) {
            return
          }

          store.clearGame()

          const { gameId, state } = response.data
          store.setGameId(gameId)
          store.gameState = state
          store.side = Side.HOST
        }
      "
    ></Vueform>
  </div>
</template>

<style scoped>
h2 {
  font-weight: 500;
  font-size: 2rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h2,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h2,
  .greetings h3 {
    text-align: left;
  }
}
</style>
