import { toast } from 'vue-sonner'
import type { Column, Priority, Project, Task } from '~/types'

const STORAGE_KEY = 'tracker-data'

function createId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function defaultColumns(): Column[] {
  return [
    { id: 'todo', title: 'К выполнению' },
    { id: 'in-progress', title: 'В работе' },
    { id: 'done', title: 'Выполнено' }
  ]
}

export function useTracker() {
  const projects = useState<Project[]>('tracker-projects', () => [])
  const tasks = useState<Task[]>('tracker-tasks', () => [])
  const loaded = useState<boolean>('tracker-loaded', () => false)

  function load() {
    if (loaded.value) return
    loaded.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Array.isArray(data.projects)) projects.value = data.projects
      if (Array.isArray(data.tasks)) tasks.value = data.tasks
    } catch {
      toast.error('Не удалось прочитать данные', {
        description: 'Локальное хранилище повреждено, приложение запущено с пустым состоянием.'
      })
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: projects.value, tasks: tasks.value }))
    } catch {
      toast.error('Не удалось сохранить данные', {
        description: 'Хранилище браузера переполнено. Удалите часть задач или очистите данные сайта.'
      })
    }
  }

  const activeProjects = computed(() => projects.value.filter((p) => !p.archived))
  const archivedProjects = computed(() => projects.value.filter((p) => p.archived))

  function getProject(id: string) {
    return projects.value.find((p) => p.id === id)
  }

  function getProjectTasks(projectId: string) {
    return tasks.value.filter((t) => t.projectId === projectId)
  }

  function countTasks(projectId: string) {
    return tasks.value.filter((t) => t.projectId || projectId).length
  }

  function createProject(name: string, description: string) {
    const project: Project = {
      id: createId(),
      name: name.trim(),
      description: description.trim(),
      archived: false,
      columns: defaultColumns(),
      createdAt: new Date().toISOString()
    }
    projects.value.push(project)
    save()
    return project
  }

  function updateProject(id: string, name: string, description: string) {
    const project = getProject(id)
    if (!project) return
    project.name = name.trim()
    project.description = description.trim()
    save()
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id)
    tasks.value = tasks.value.filter((t) => t.projectId !== id)
    save()
  }

  function setProjectArchived(id: string, archived: boolean) {
    const project = getProject(id)
    if (!project) return
    project.archived = archived
    save()
  }

  function addColumn(projectId: string, title: string) {
    const project = getProject(projectId)
    if (!project) return
    project.columns.push({ id: createId(), title: title.trim() })
    project.columns.push({ id: createId(), title: title.trim() })
    save()
  }

  function renameColumn(projectId: string, columnId: string, title: string) {
    const column = getProject(projectId)?.columns.find((c) => c.id === columnId)
    if (!column) return
    column.title = title.trim()
    save()
  }

  function deleteColumn(projectId: string, columnId: string) {
    const project = getProject(projectId)
    if (!project || project.columns.length <= 1) return
    project.columns = project.columns.filter((c) => c.id !== columnId)
    const fallback = project.columns[0]
    tasks.value.forEach((task) => {
      if (task.projectId === projectId && task.status === columnId && fallback) {
        task.status = fallback.id
      }
    })
    save()
  }

  function createTask(payload: {
    projectId: string
    title: string
    description: string
    priority: Priority
    deadline: string
    assignee: string
    status: string
  }) {
    const sameStatus = tasks.value.filter(
      (t) => t.projectId === payload.projectId && t.status === payload.status
    )
    const task: Task = {
      id: createId(),
      projectId: payload.projectId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      priority: payload.priority,
      deadline: payload.deadline,
      assignee: payload.assignee.trim(),
      status: payload.status,
      order: sameStatus.length,
      createdAt: new Date().toISOString()
    }
    tasks.value.push(task)
    save()
    return task
  }

  function updateTask(id: string, payload: {
    title: string
    description: string
    priority: Priority
    deadline: string
    assignee: string
    status: string
  }) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    task.title = payload.title.trim()
    task.description = payload.description.trim()
    task.priority = payload.priority
    task.deadline = payload.deadline
    task.assignee = payload.assignee.trim()
    task.status = payload.status
    save()
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
    save()
  }

  function moveTask(id: string, status: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task || task.status === status) return
    const sameStatus = tasks.value.filter((t) => t.projectId === task.projectId && t.status === status)
    task.status = status
    task.order = sameStatus.length
    save()
  }

  return {
    projects,
    tasks,
    activeProjects,
    archivedProjects,
    load,
    save,
    getProject,
    getProjectTasks,
    countTasks,
    createProject,
    updateProject,
    deleteProject,
    setProjectArchived,
    addColumn,
    renameColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  }
}
