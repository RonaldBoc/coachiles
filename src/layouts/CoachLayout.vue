<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Coach Header -->
    <CoachHeader />

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import CoachHeader from '@/components/CoachHeader.vue'
</script>
