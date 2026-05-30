import { ofetch } from 'ofetch'
import type { TripInput, TripPlan, SSEEvent } from '../types/trip'

const api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

/**
 * 创建行程
 */
export async function createTrip(input: TripInput): Promise<{ id: string }> {
  return api('/trips', {
    method: 'POST',
    body: input,
  })
}

/**
 * 获取行程详情
 */
export async function getTrip(id: string): Promise<TripPlan> {
  return api(`/trips/${id}`)
}

/**
 * 获取历史行程列表
 */
export async function getTripList(): Promise<TripPlan[]> {
  return api('/trips')
}

/**
 * 删除行程
 */
export async function deleteTrip(id: string): Promise<void> {
  return api(`/trips/${id}`, { method: 'DELETE' })
}

/**
 * 启动 Agent 规划（SSE 流式返回）
 */
export function generatePlan(
  tripId: string,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`/api/trips/${tripId}/generate/stream`)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as SSEEvent
      onEvent(data)
    } catch (e) {
      console.error('Failed to parse SSE event:', e)
    }
  }

  eventSource.onerror = (event) => {
    console.error('SSE error:', event)
    onError?.(new Error('SSE connection failed'))
    eventSource.close()
  }

  // 返回关闭函数
  return () => eventSource.close()
}

/**
 * 目的地模糊搜索
 */
export async function searchDestination(query: string): Promise<string[]> {
  return api('/search/destination', {
    params: { q: query },
  })
}

/**
 * 景点搜索
 */
export async function searchAttractions(
  destination: string,
  preference?: string
) {
  return api('/search/attractions', {
    params: { destination, preference },
  })
}
