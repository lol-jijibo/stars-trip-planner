import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TripInput,
  TripPlan,
  AgentProgress,
  Preference,
  BudgetLevel,
} from '../types/trip'

export const useTripStore = defineStore('trip', () => {
  // ============ 用户输入 ============
  const input = ref<TripInput>({
    destination: '',
    startDate: '',
    endDate: '',
    preferences: [],
    budgetLevel: 'comfort',
    travelers: 1,
    notes: '',
  })

  // ============ 规划结果 ============
  const plan = ref<TripPlan | null>(null)
  const alternatives = ref<TripPlan[]>([])

  // ============ Agent 进度 ============
  const agentProgress = ref<AgentProgress[]>([])
  const isGenerating = ref(false)

  // ============ UI 状态 ============
  const activeDayIndex = ref(0)
  const showBudget = ref(false)

  // ============ 计算属性 ============
  const tripDays = computed(() => {
    if (!input.value.startDate || !input.value.endDate) return 0
    const start = new Date(input.value.startDate)
    const end = new Date(input.value.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  })

  const currentDayRoute = computed(() => {
    if (!plan.value) return null
    return plan.value.dailyRoutes[activeDayIndex.value] || null
  })

  const totalBudget = computed(() => {
    return plan.value?.budget.total || 0
  })

  // ============ 操作方法 ============
  function updateInput(updates: Partial<TripInput>) {
    input.value = { ...input.value, ...updates }
  }

  function togglePreference(pref: Preference) {
    const index = input.value.preferences.indexOf(pref)
    if (index === -1) {
      input.value.preferences.push(pref)
    } else {
      input.value.preferences.splice(index, 1)
    }
  }

  function setBudgetLevel(level: BudgetLevel) {
    input.value.budgetLevel = level
  }

  function setPlan(newPlan: TripPlan) {
    plan.value = newPlan
    isGenerating.value = false
  }

  function addAgentProgress(progress: AgentProgress) {
    agentProgress.value.push(progress)
  }

  function clearProgress() {
    agentProgress.value = []
  }

  function startGenerating() {
    isGenerating.value = true
    agentProgress.value = []
  }

  function stopGenerating() {
    isGenerating.value = false
  }

  function setActiveDay(index: number) {
    activeDayIndex.value = index
  }

  function toggleBudget() {
    showBudget.value = !showBudget.value
  }

  return {
    // 状态
    input,
    plan,
    alternatives,
    agentProgress,
    isGenerating,
    activeDayIndex,
    showBudget,
    // 计算属性
    tripDays,
    currentDayRoute,
    totalBudget,
    // 方法
    updateInput,
    togglePreference,
    setBudgetLevel,
    setPlan,
    addAgentProgress,
    clearProgress,
    startGenerating,
    stopGenerating,
    setActiveDay,
    toggleBudget,
  }
})
