<script setup lang="ts">
import ErrorPopup from "./components/ErrorPopup.vue";
import NetworkBanner from "./components/NetworkBanner.vue";
</script>

<template>
  <NetworkBanner />
  <router-view />
  <ErrorPopup />
</template>
