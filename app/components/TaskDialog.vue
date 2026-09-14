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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Column, Priority, Task } from '~/types'

const props = defineProps<{
  open: boolean
  task?: Task | null
  columns: Column[]
  defaultStatus?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: {
    title: string
    description: string
    priority: Priority
    deadline: string
    assignee: string
    status: string
  }]
}>()

const title = ref('')
const description = ref('')
const priority = ref<Priority>('medium')
const deadline = ref('')
const assignee = ref('')
const status = ref('')

const errors = ref({ title: '', status: '', deadline: '', description: '', assignee: '' })

const isEdit = computed(() => Boolean(props.task))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    title.value = props.task?.title ?? ''
    description.value = props.task?.description ?? ''
    priority.value = props.task?.priority ?? 'medium'
    deadline.value = props.task?.deadline ?? ''
    assignee.value = props.task?.assignee ?? ''
    status.value = props.task?.status ?? props.defaultStatus ?? props.columns[0]?.id ?? ''
    errors.value = { title: '', status: '', deadline: '', description: '', assignee: '' }
  }
)

function validate() {
  errors.value = { title: '', status: '', deadline: '', description: '', assignee: '' }
  let valid = true

  if (!title.value.trim()) {
    errors.value.title = 'Название задачи обязательно'
    valid = false
  } else if (title.value.trim().length > 100) {
    errors.value.title = 'Название не должно превышать 100 символов'
    valid = false
  }

  if (!status.value) {
    errors.value.status = 'Выберите статус задачи'
    valid = false
  }

  if (description.value.length > 1000) {
    errors.value.description = 'Описание не должно превышать 1000 символов'
    valid = false
  }

  if (assignee.value.trim().length > 60) {
    errors.value.assignee = 'Имя исполнителя не должно превышать 60 символов'
    valid = false
  }

  if (deadline.value && Number.isNaN(new Date(deadline.value).getTime())) {
    errors.value.deadline = 'Некорректная дата'
    valid = false
  }

  return valid
}

function submit() {
  if (!validate()) return

  emit('submit', {
    title: title.value,
    description: description.value,
    priority: priority.value,
    deadline: deadline.value,
    assignee: assignee.value,
    status: status.value
  })
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Редактирование задачи' : 'Новая задача' }}</DialogTitle>
        <DialogDescription>Заполните поля задачи. Обязательные поля отмечены звёздочкой.</DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="task-title">Название <span class="text-destructive">*</span></Label>
          <Input id="task-title" v-model="title" placeholder="Что нужно сделать" />
          <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="task-description">Описание</Label>
          <Textarea id="task-description" v-model="description" rows="3" placeholder="Подробности задачи" />
          <p v-if="errors.description" class="text-sm text-destructive">{{ errors.description }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="task-priority">Приоритет</Label>
            <Select v-model="priority">
              <SelectTrigger id="task-priority" class="w-full">
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label for="task-status">Статус <span class="text-destructive">*</span></Label>
            <Select v-model="status">
              <SelectTrigger id="task-status" class="w-full">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="column in columns" :key="column.id" :value="column.id">
                  {{ column.title }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
          </div>

          <div class="grid gap-2">
            <Label for="task-deadline">Срок выполнения</Label>
            <Input id="task-deadline" v-model="deadline" type="date" />
            <p v-if="errors.deadline" class="text-sm text-destructive">{{ errors.deadline }}</p>
          </div>

          <div class="grid gap-2">
            <Label for="task-assignee">Исполнитель</Label>
            <Input id="task-assignee" v-model="assignee" placeholder="Имя исполнителя" />
            <p v-if="errors.assignee" class="text-sm text-destructive">{{ errors.assignee }}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Отмена</Button>
          <Button type="submit">{{ isEdit ? 'Сохранить' : 'Создать задачу' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
