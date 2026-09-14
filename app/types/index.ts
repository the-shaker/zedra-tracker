export type Priority = 'low' | 'medium' | 'high'

export interface Column {
  id: string
  title: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  priority: Priority
  deadline: string
  assignee: string
  status: string
  order: number
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  archived: boolean
  columns: Column[]
  createdAt: string
}

export interface TrackerState {
  projects: Project[]
  tasks: Task[]
}
