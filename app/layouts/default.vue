<script setup lang="ts">
import { LayoutDashboard, Moon, Sun, Minus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
          <LayoutDashboard class="size-5" />
          <span>Zedra</span>
          <span class="font-light text-primary/65">|</span>
          <span class="font-medium">Трекер проектов</span>
        </NuxtLink>
        <Button
          variant="outline"
          size="icon"
          :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">
      <slot />
    </main>

    <Toaster position="bottom-right" />
  </div>
</template>
