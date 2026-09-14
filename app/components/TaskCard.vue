<script setup lang="ts">
import { CalendarDays, MoveRight, Pencil, Trash2, User } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Column, Task } from '~/types'

const props = defineProps<{
  task: Task
  columns: Column[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  remove: [task: Task]
  move: [taskId: string, status: string]
  dragstart: [taskId: string]
  dragend: []
}>()

const overdue = computed(() => isOverdue(props.task.deadline))

const otherColumns = computed(() => props.columns.filter((c) => c.id !== props.task.status))

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', props.task.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  emit('dragstart', props.task.id)
}
</script>

<template>
  <Card
    draggable="true"
    data-testid="task-card"
    class="cursor-grab gap-0 py-3 transition-shadow hover:shadow-md active:cursor-grabbing"
    :class="overdue ? 'border-2 border-destructive' : ''"
    @dragstart="onDragStart"
    @dragend="emit('dragend')"
  >
    <CardContent class="grid gap-2.5 px-3">
      <div class="flex items-start gap-2">
        <span class="mt-1.5 size-2.5 shrink-0 rounded-full" :class="priorityColors[task.priority]" />
        <p class="flex-1 text-sm font-medium break-words">{{ task.title }}</p>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="size-7" aria-label="Действия с задачей">
              <MoveRight class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Переместить в</DropdownMenuLabel>
            <DropdownMenuItem
              v-for="column in otherColumns"
              :key="column.id"
              @click="emit('move', task.id, column.id)"
            >
              {{ column.title }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="emit('edit', task)">
              <Pencil class="size-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" @click="emit('remove', task)">
              <Trash2 class="size-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p v-if="task.description" class="text-xs text-muted-foreground line-clamp-2 break-words">
        {{ task.description }}
      </p>

      <div class="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{{ priorityLabels[task.priority] }}</Badge>
        <Badge v-if="task.deadline" :variant="overdue ? 'destructive' : 'secondary'">
          <CalendarDays class="size-3" />
          {{ formatDate(task.deadline) }}
        </Badge>
        <Badge v-if="task.assignee" variant="secondary">
          <User class="size-3" />
          {{ task.assignee }}
        </Badge>
      </div>

      <p v-if="overdue" class="text-xs font-medium text-destructive">Задача просрочена</p>
    </CardContent>
  </Card>
</template>
