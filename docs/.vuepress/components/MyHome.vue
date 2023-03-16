<script setup lang="ts">
import HomeContent from '@theme/HomeContent.vue'
import HomeFeatures from '@theme/HomeFeatures.vue'
import HomeFooter from '@theme/HomeFooter.vue'
import HomeHero from '@theme/HomeHero.vue'
</script>

<template>
  <main class="home my-home">
    <HomeHero />
    <div class="home-main">
      <HomeFeatures />
      <HomeContent />
      <HomeFooter />
    </div>
  </main>
</template>
