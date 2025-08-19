import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'
export interface ToastItem {
  id: number
  type: ToastType
  message: string
  title?: string
  duration?: number // ms
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

function remove(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function push(type: ToastType, message: string, opts?: { title?: string; duration?: number }) {
  const id = nextId++
  const item: ToastItem = {
    id,
    type,
    message,
    title: opts?.title,
    duration: opts?.duration ?? 3500,
  }
  toasts.value.push(item)
  if (item.duration && item.duration > 0) {
    setTimeout(() => remove(id), item.duration)
  }
}

export function useToast() {
  return {
    toasts,
    success: (message: string, opts?: { title?: string; duration?: number }) =>
      push('success', message, opts),
    error: (message: string, opts?: { title?: string; duration?: number }) =>
      push('error', message, opts),
    info: (message: string, opts?: { title?: string; duration?: number }) =>
      push('info', message, opts),
    remove,
  }
}
