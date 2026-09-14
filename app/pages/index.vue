<script setup lang="ts">
import { Archive, ArchiveRestore, ListTodo, MoreVertical, Pencil, Plus, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Project } from '~/types'

const tracker = useTracker()

const archivedCount = computed(
  () => tracker.projects.value.length - Number(tracker.activeProjects.value.at(-1)?.name)
)

const dialogOpen = ref(false)
const editing = ref<Project | null>(null)
const confirmOpen = ref(false)
const deletingId = ref('')

function openCreate() {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(project: Project) {
  editing.value = project
  dialogOpen.value = true
}

function handleSubmit(payload: { name: string; description: string }) {
  if (editing.value) {
    tracker.updateProject(editing.value.id, payload.name, payload.description)
    toast.success('Проект обновлён')
  } else {
    tracker.createProject(payload.name, payload.description)
    toast.success('Проект создан')
  }
}

function askDelete(id: string) {
  deletingId.value = id
  confirmOpen.value = true
}

function confirmDelete() {
  tracker.deleteProject(deletingId.value)
  confirmOpen.value = false
  toast.success('Проект удалён')
}

function toggleArchive(project: Project) {
  tracker.setProjectArchived(project.id, !project.archived)
  toast.success(project.archived ? 'Проект восстановлен из архива' : 'Проект архивирован')
}
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Проекты</h1>
        <p class="text-sm text-muted-foreground">Выберите проект или создайте новый</p>
      </div>
      <Button data-testid="add-project" @click="openCreate">
        <Plus class="size-4" />
        Добавить проект
      </Button>
    </div>

    <Tabs default-value="active">
      <TabsList>
        <TabsTrigger value="active">
          Активные ({{ tracker.activeProjects.value.length }})
        </TabsTrigger>
        <TabsTrigger value="archived">
          Архив ({{ archivedCount }})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" class="mt-6">
        <div v-if="!tracker.activeProjects.value.length" class="rounded-lg border border-dashed p-12 text-center">
          <p class="font-medium">Пока нет проектов</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Нажмите «Добавить проект», чтобы начать работу
          </p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="project in tracker.activeProjects.value" :key="project.id" class="flex flex-col">
            <CardHeader class="flex flex-row items-start justify-between gap-2">
              <div class="grid gap-1.5">
                <CardTitle>{{ project.name }}</CardTitle>
                <CardDescription>
                  {{ project.description || 'Без описания' }}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" aria-label="Действия с проектом">
                    <MoreVertical class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEdit(project)">
                    <Pencil class="size-4" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="toggleArchive(project)">
                    <Archive class="size-4" />
                    Архивировать
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" @click="askDelete(project.id)">
                    <Trash2 class="size-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent class="mt-auto">
              <Badge variant="secondary">
                <ListTodo class="size-3.5" />
                Задач: {{ tracker.countTasks(project.id) }}
              </Badge>
            </CardContent>

            <CardFooter>
              <Button as-child variant="outline" class="w-full">
                <NuxtLink :to="`/projects/${project.id}`">Открыть доску</NuxtLink>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="archived" class="mt-6">
        <div v-if="!tracker.archivedProjects.value.length" class="rounded-lg border border-dashed p-12 text-center">
          <p class="font-medium">Архив пуст</p>
          <p class="mt-1 text-sm text-muted-foreground">Архивированные проекты появятся здесь</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="project in tracker.archivedProjects.value" :key="project.id" class="flex flex-col">
            <CardHeader class="grid gap-1.5">
              <CardTitle>{{ project.name }}</CardTitle>
              <CardDescription>{{ project.description || 'Без описания' }}</CardDescription>
            </CardHeader>
            <CardContent class="mt-auto">
              <Badge variant="secondary">Задач: {{ tracker.countTasks(project.id) }}</Badge>
            </CardContent>
            <CardFooter class="gap-2">
              <Button variant="outline" class="flex-1" @click="toggleArchive(project)">
                <ArchiveRestore class="size-4" />
                Восстановить
              </Button>
              <Button variant="outline" size="icon" aria-label="Удалить проект" @click="askDelete(project.id)">
                <Trash2 class="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <ProjectDialog v-model:open="dialogOpen" :project="editing" @submit="handleSubmit" />

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Удалить проект?"
      description="Проект и все его задачи будут удалены безвозвратно."
      @confirm="confirmDelete"
    />
  </div>
</template>
