<script setup lang="ts">
const { load } = useTracker()

onMounted(() => {
  load()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
