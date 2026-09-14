<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Project } from '~/types'

const props = defineProps<{
  open: boolean
  project?: Project | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: { name: string; description: string }]
}>()

const name = ref('')
const description = ref('')
const nameError = ref('')

const isEdit = computed(() => Boolean(props.project))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.project?.name ?? ''
    description.value = props.project?.description ?? ''
    nameError.value = ''
  }
)

function submit() {
  nameError.value = ''

  if (!name.value.trim()) {
    nameError.value = 'Укажите название проекта'
    return
  }

  if (name.value.trim().length > 100) {
    nameError.value = 'Название не должно превышать 100 символов'
    return
  }

  if (description.value.length > 500) {
    nameError.value = 'Описание не должно превышать 500 символов'
    return
  }

  emit('submit', { name: name.value, description: description.value })
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Редактирование проекта' : 'Новый проект' }}</DialogTitle>
        <DialogDescription>
          Укажите название и краткое описание проекта.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="project-name">Название <span class="text-destructive">*</span></Label>
          <Input id="project-name" v-model="name" placeholder="Например, Учебный проект" />
          <p v-if="nameError" class="text-sm text-destructive">{{ nameError }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="project-description">Описание</Label>
          <Textarea
            id="project-description"
            v-model="description"
            rows="4"
            placeholder="Краткое описание проекта"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Отмена</Button>
          <Button type="submit">{{ isEdit ? 'Сохранить' : 'Создать проект' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
