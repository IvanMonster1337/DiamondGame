<script setup lang="ts">
import Grid from './components/Grid.vue'
import StartGame from './components/StartGame.vue'
import { store } from './socket/socket'
</script>

<template>
  <header>
    <div class="wrapper">
      <StartGame
        join-text="Use code to join the game..."
        create-game-text="...or create your own!"
      />

      <h2 v-if="store.clientId">ClientId={{ store.clientId }}</h2>
    </div>
  </header>

  <main>
    <div v-if="store.gameId && store.gameState">
      <Grid />
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
