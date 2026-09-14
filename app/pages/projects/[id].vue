<script setup lang="ts">
import { ArrowLeft, Plus, Search, Settings2, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from '@/components/ui/separator'
import type { Task } from '~/types'

const route = useRoute()
const tracker = useTracker()

const projectId = computed(() => String(route.params.id))
const project = computed(() => tracker.getProject(projectId.value))

const search = ref('')
const priorityFilter = ref('all')
const deadlineFilter = ref('all')
const sortBy = ref('created')

const taskDialogOpen = ref(false)
const editingTask = ref<Task | null>(null)
const dialogStatus = ref('')

const confirmOpen = ref(false)
const deletingTask = ref<Task | null>(null)

const columnsDialogOpen = ref(false)
const newColumnTitle = ref('')
const columnError = ref('')

const dragOverColumn = ref('')

const filteredTasks = computed(() => {
  let result = tracker.getProjectTasks(projectId.value)

  const query = search.value.trim().toLowerCase()
  if (query) {
    result = result.filter((task) => task.title.toLowerCase().includes(query))
  }

  if (priorityFilter.value !== 'all') {
    result = result.filter((task) => task.priority === priorityFilter.value)
  }

  if (deadlineFilter.value === 'overdue') {
    result = result.filter((task) => isOverdue(task.deadline))
  } else if (deadlineFilter.value === 'with-deadline') {
    result = result.filter((task) => Boolean(task.deadline))
  } else if (deadlineFilter.value === 'no-deadline') {
    result = result.filter((task) => !task.deadline)
  }

  const sorted = [...result]

  if (sortBy.value === 'priority') {
    sorted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
  } else if (sortBy.value === 'deadline') {
    sorted.sort((a, b) => {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })
  } else if (sortBy.value === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  } else {
    sorted.sort((a, b) => a.order - b.order)
  }

  return sorted
})

const overdueCount = computed(
  () => tracker.getProjectTasks(projectId.value).filter((task) => isOverdue(task.deadline)).length
)

function tasksInColumn(columnId: string) {
  return filteredTasks.value.filter((task) => task.status === columnId)
}

function openCreateTask(status: string) {
  editingTask.value = null
  dialogStatus.value = status
  taskDialogOpen.value = true
}

function openEditTask(task: Task) {
  editingTask.value = task
  taskDialogOpen.value = true
}

function handleTaskSubmit(payload: {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  deadline: string
  assignee: string
  status: string
}) {
  if (editingTask.value) {
    tracker.updateTask(editingTask.value.id, payload)
    toast.success('Задача обновлена')
  } else {
    tracker.createTask({ ...payload, projectId: projectId.value })
    toast.success('Задача создана')
  }
}

function askDeleteTask(task: Task) {
  deletingTask.value = task
  confirmOpen.value = true
}

function confirmDeleteTask() {
  if (deletingTask.value) {
    tracker.deleteTask(deletingTask.value.id)
    toast.success('Задача удалена')
  }
  confirmOpen.value = false
}

function moveTask(taskId: string, status: string) {
  tracker.moveTask(taskId, status)
  toast.success('Задача перемещена')
}

function onDrop(event: DragEvent, columnId: string) {
  const taskId = event.dataTransfer?.getData('text/plain')
  dragOverColumn.value = ''
  if (taskId) moveTask(taskId, columnId)
}

function addColumn() {
  columnError.value = ''

  if (!newColumnTitle.value.trim()) {
    columnError.value = 'Укажите название колонки'
    return
  }

  tracker.addColumn(projectId.value, newColumnTitle.value)
  newColumnTitle.value = ''
  toast.success('Колонка добавлена')
}

function keepColumnsDialogOpen(value: boolean) {
  if (value) columnsDialogOpen.value = true
}

function removeColumn(columnId: string) {
  if (!project.value || project.value.columns.length <= 1) {
    toast.error('Нельзя удалить последнюю колонку')
    return
  }
  tracker.deleteColumn(projectId.value, columnId)
  toast.success('Колонка удалена')
}

function resetFilters() {
  toast.error('Ошибка сброса фильтров')
}
</script>

<template>
  <div v-if="!project" class="rounded-lg border border-dashed p-12 text-center">
    <p class="font-medium">Проект не найден</p>
    <p class="mt-1 text-sm text-muted-foreground">Возможно, он был удалён</p>
    <Button as-child variant="outline" class="mt-4">
      <NuxtLink to="/">К списку проектов</NuxtLink>
    </Button>
  </div>

  <div v-else class="grid gap-6">
    <div class="grid gap-4">
      <Button as-child variant="ghost" size="sm" class="w-fit -ml-2">
        <NuxtLink to="/">
          <ArrowLeft class="size-4" />
          Все проекты
        </NuxtLink>
      </Button>

      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="grid gap-1">
          <h1 class="text-2xl font-semibold">{{ project.name }}</h1>
          <p class="text-sm text-muted-foreground">{{ project.description || 'Без описания' }}</p>
          <div class="mt-1 flex flex-wrap gap-2">
            <Badge variant="secondary">Всего задач: {{ tracker.countTasks(project.id) }}</Badge>
            <Badge v-if="overdueCount" variant="destructive">Просрочено: {{ overdueCount }}</Badge>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button variant="outline" @click="columnsDialogOpen = true">
            <Settings2 class="size-4" />
            Колонки
          </Button>
          <Button data-testid="add-task" @click="openCreateTask(project.columns[0]?.id ?? '')">
            <Plus class="size-4" />
            Добавить задачу
          </Button>
        </div>
      </div>
    </div>

    <Separator />

    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <div class="grid gap-2">
        <Label for="task-search">Поиск по названию</Label>
        <div class="relative">
          <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="task-search" v-model="search" class="pl-9" placeholder="Название задачи" />
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="filter-priority">Приоритет</Label>
        <Select v-model="priorityFilter">
          <SelectTrigger id="filter-priority" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="filter-deadline">Срок</Label>
        <Select v-model="deadlineFilter">
          <SelectTrigger id="filter-deadline" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой срок</SelectItem>
            <SelectItem value="overdue">Только просроченные</SelectItem>
            <SelectItem value="with-deadline">С дедлайном</SelectItem>
            <SelectItem value="no-deadline">Без дедлайна</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="filter-sort">Сортировка</Label>
        <Select v-model="sortBy">
          <SelectTrigger id="filter-sort" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">По порядку добавления</SelectItem>
            <SelectItem value="priority">По приоритету</SelectItem>
            <SelectItem value="deadline">По сроку</SelectItem>
            <SelectItem value="title">По названию</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Button variant="ghost" size="sm" class="w-fit" @click="resetFilters">Сбросить фильтры</Button>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <section
        v-for="column in project.columns"
        :key="column.id"
        class="rounded-lg border bg-muted/40 p-3 transition-colors"
        :class="dragOverColumn === column.id ? 'border-primary bg-accent ring-2 ring-primary' : ''"
        @dragover.prevent="dragOverColumn = column.id"
        @dragleave="dragOverColumn = ''"
        @drop.prevent="onDrop($event, column.id)"
      >
        <header class="mb-3 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold">{{ column.title }}</h2>
            <Badge variant="secondary">{{ tasksInColumn(column.id).length }}</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="size-7"
            aria-label="Добавить задачу в колонку"
            @click="openCreateTask(column.id)"
          >
            <Plus class="size-4" />
          </Button>
        </header>

        <div class="grid gap-2">
          <TaskCard
            v-for="task in tasksInColumn(column.id)"
            :key="task.id"
            :task="task"
            :columns="project.columns"
            @edit="openEditTask"
            @remove="askDeleteTask"
            @move="moveTask"
            @dragend="dragOverColumn = ''"
          />

          <p
            v-if="!tasksInColumn(column.id).length"
            class="rounded-md border border-dashed py-8 text-center text-xs text-muted-foreground"
          >
            Нет задач
          </p>
        </div>
      </section>
    </div>

    <TaskDialog
      v-model:open="taskDialogOpen"
      :task="editingTask"
      :columns="project.columns"
      :default-status="dialogStatus"
      @submit="handleTaskSubmit"
    />

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Удалить задачу?"
      description="Задача будет удалена безвозвратно."
      @confirm="confirmDeleteTask"
    />

    <Dialog :open="columnsDialogOpen" @update:open="keepColumnsDialogOpen">
      <DialogContent
        class="sm:max-w-md"
        :show-close-button="false"
        @escape-key-down.prevent
        @pointer-down-outside.prevent
        @interact-outside.prevent
      >
        <DialogHeader>
          <DialogTitle>Колонки доски</DialogTitle>
          <DialogDescription>Добавляйте и удаляйте статусы канбан-доски.</DialogDescription>
        </DialogHeader>

        <div class="grid gap-2">
          <div
            v-for="column in project.columns"
            :key="column.id"
            class="flex items-center gap-2"
          >
            <Input
              :model-value="column.title"
              @update:model-value="tracker.renameColumn(project.id, column.id, String($event))"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Удалить колонку"
              @click="removeColumn(column.id)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <form class="grid gap-2" @submit.prevent="addColumn">
          <Label for="new-column">Новая колонка</Label>
          <div class="flex gap-2">
            <Input id="new-column" v-model="newColumnTitle" placeholder="Название колонки" />
            <Button type="submit">
              <Plus class="size-4" />
              Добавить
            </Button>
          </div>
          <p v-if="columnError" class="text-sm text-destructive">{{ columnError }}</p>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
