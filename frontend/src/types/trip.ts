/**
 * 智能旅行助手 - TypeScript 类型定义
 * 镜像后端 schemas/plan.py 中的数据模型
 */

// 偏好类型
export type Preference =
  | 'history'      // 历史文化
  | 'nature'       // 自然风光
  | 'food'         // 美食购物
  | 'shopping'     // 购物
  | 'family'       // 亲子休闲
  | 'photography'  // 摄影打卡

// 预算档位
export type BudgetLevel = 'economy' | 'comfort' | 'luxury'

// 旅行输入
export interface TripInput {
  destination: string
  startDate: string  // ISO date string
  endDate: string
  preferences: Preference[]
  budgetLevel: BudgetLevel
  travelers: number
  notes: string
}

// 景点
export interface Attraction {
  id: string
  name: string
  description: string
  imageUrl?: string
  rating: number        // 0-5
  price: number         // 门票价格
  durationMinutes: number
  openTime: string      // "09:00"
  closeTime: string     // "17:00"
  lat: number
  lng: number
  tags: string[]
  sourceUrls: string[]
}

// 餐厅
export interface Restaurant {
  id: string
  name: string
  cuisineType: string
  pricePerPerson: number
  rating: number
  lat: number
  lng: number
  distanceFromRoute: number  // 偏离路线距离(m)
}

// 酒店
export interface Hotel {
  id: string
  name: string
  pricePerNight: number
  rating: number
  lat: number
  lng: number
  distanceToCenter: number
  amenities: string[]
}

// 每日路线
export interface DailyRoute {
  day: number
  date: string
  attractions: Attraction[]
  lunch?: Restaurant
  dinner?: Restaurant
  hotel?: Hotel
  transportNotes: string
}

// 天气报告
export interface WeatherReport {
  daily: Array<{
    date: string
    condition: string
    tempHigh: number
    tempLow: number
    rainProb: number
  }>
  overallRisk: 'low' | 'medium' | 'high'
}

// 预算报告
export interface BudgetReport {
  attractionsTotal: number
  hotelsTotal: number
  mealsTotal: number
  transportTotal: number
  total: number
  perPerson: number
  breakdown: Array<{
    category: string
    amount: number
    description: string
  }>
}

// 旅行计划
export interface TripPlan {
  id: string
  input: TripInput
  attractionsPool: Attraction[]
  dailyRoutes: DailyRoute[]
  weather: WeatherReport
  budget: BudgetReport
  tips: string[]
  createdAt: string
}

// Agent 进度状态
export interface AgentProgress {
  phase: string
  agentName: string
  status: 'running' | 'done' | 'error'
  message: string
}

// SSE 事件类型
export type SSEEvent =
  | { type: 'phase_start'; phase: string; agent: string }
  | { type: 'agent_progress'; agent: string; message: string; percent: number }
  | { type: 'partial_result'; agent: string; data: unknown }
  | { type: 'phase_done'; phase: string }
  | { type: 'plan_ready'; plan: TripPlan }
  | { type: 'error'; agent: string; message: string }
