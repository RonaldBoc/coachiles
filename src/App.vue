<template>
  <router-view />
  <AppToasts />
</template>

<script setup lang="ts">
// No need for global layout imports - each page handles its own layout
import AppToasts from './components/AppToasts.vue'
</script>

<style scoped></style>
