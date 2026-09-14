import type { Priority } from '~/types'

export const priorityLabels: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
}

export const priorityColors: Record<Priority, string> = {
  low: 'bg-sky-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500'
}

export const priorityWeight: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3
}

export function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function isOverdue(deadline: string) {
  if (!deadline) return false
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}
