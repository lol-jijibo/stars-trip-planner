<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NDatePicker, NButton, NTag, NSpace, NIcon, NSlider, NCard } from 'naive-ui'
import { useTripStore } from '../stores/trip'
import type { Preference, BudgetLevel } from '../types/trip'

const router = useRouter()
const tripStore = useTripStore()

// 偏好选项配置
const preferenceOptions: Array<{ value: Preference; label: string; icon: string }> = [
  { value: 'history', label: '历史文化', icon: '🏛️' },
  { value: 'nature', label: '自然风光', icon: '🌿' },
  { value: 'food', label: '美食购物', icon: '🍜' },
  { value: 'shopping', label: '购物', icon: '🛍️' },
  { value: 'family', label: '亲子休闲', icon: '👨‍👩‍👧‍👦' },
  { value: 'photography', label: '摄影打卡', icon: '📸' },
]

// 预算档位配置
const budgetOptions: Array<{ value: BudgetLevel; label: string; desc: string }> = [
  { value: 'economy', label: '经济型', desc: '精打细算，性价比优先' },
  { value: 'comfort', label: '舒适型', desc: '品质与价格均衡' },
  { value: 'luxury', label: '豪华型', desc: '顶级体验，不计成本' },
]

// 搜索相关
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref<string[]>(['北京', '上海', '成都', '杭州', '西安', '广州'])

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return suggestions.value
  return suggestions.value.filter((s) =>
    s.includes(searchQuery.value)
  )
})

function selectDestination(dest: string) {
  tripStore.updateInput({ destination: dest })
  searchQuery.value = dest
  showSuggestions.value = false
}

function handleSearch() {
  // TODO: 调用后端搜索 API
  showSuggestions.value = true
}

// 日期处理
const dateRange = ref<[number, number] | null>(null)

function handleDateChange(value: [number, number] | null) {
  if (value) {
    const [start, end] = value
    tripStore.updateInput({
      startDate: new Date(start).toISOString().split('T')[0],
      endDate: new Date(end).toISOString().split('T')[0],
    })
  }
}

// 偏好切换
function togglePreference(pref: Preference) {
  tripStore.togglePreference(pref)
}

function isPreferenceSelected(pref: Preference): boolean {
  return tripStore.input.preferences.includes(pref)
}

// 预算选择
function selectBudget(level: BudgetLevel) {
  tripStore.setBudgetLevel(level)
}

// 出行人数
const travelers = ref(1)

function updateTravelers(delta: number) {
  const newVal = travelers.value + delta
  if (newVal >= 1 && newVal <= 20) {
    travelers.value = newVal
    tripStore.updateInput({ travelers: newVal })
  }
}

// 特殊需求
const notes = ref('')

// 生成行程
const isGenerating = computed(() => tripStore.isGenerating)

function handleGenerate() {
  if (!tripStore.input.destination) {
    // TODO: 显示提示
    alert('请输入目的地')
    return
  }

  if (!tripStore.input.startDate || !tripStore.input.endDate) {
    alert('请选择出行日期')
    return
  }

  // 模拟生成过程（实际会调用后端 API）
  tripStore.startGenerating()

  // 模拟延迟跳转
  setTimeout(() => {
    // 生成模拟数据
    const mockPlan: TripPlan = {
      id: 'mock-plan-1',
      input: { ...tripStore.input },
      attractionsPool: [],
      dailyRoutes: [
        {
          day: 1,
          date: tripStore.input.startDate,
          attractions: [
            {
              id: '1',
              name: '故宫博物院',
              description: '明清两代的皇家宫殿，世界上现存规模最大的宫殿型建筑群',
              imageUrl: 'https://picsum.photos/seed/gugong/400/300',
              rating: 4.9,
              price: 60,
              durationMinutes: 240,
              openTime: '08:30',
              closeTime: '17:00',
              lat: 39.9163,
              lng: 116.3972,
              tags: ['世界遗产', '博物馆'],
              sourceUrls: [],
            },
            {
              id: '2',
              name: '天安门广场',
              description: '北京的心脏地带，世界上最大的城市广场之一',
              imageUrl: 'https://picsum.photos/seed/tiananmen/400/300',
              rating: 4.8,
              price: 0,
              durationMinutes: 60,
              openTime: '05:00',
              closeTime: '22:00',
              lat: 39.9054,
              lng: 116.3976,
              tags: ['历史地标'],
              sourceUrls: [],
            },
          ],
          lunch: {
            id: 'r1',
            name: '全聚德烤鸭店',
            cuisineType: '北京菜',
            pricePerPerson: 150,
            rating: 4.5,
            lat: 39.9042,
            lng: 116.4074,
            distanceFromRoute: 500,
          },
          dinner: {
            id: 'r2',
            name: '东来顺饭庄',
            cuisineType: '涮羊肉',
            pricePerPerson: 120,
            rating: 4.6,
            lat: 39.9142,
            lng: 116.4042,
            distanceFromRoute: 300,
          },
          hotel: {
            id: 'h1',
            name: '北京王府井希尔顿酒店',
            pricePerNight: 800,
            rating: 4.7,
            lat: 39.9142,
            lng: 116.4103,
            distanceToCenter: 1500,
            amenities: ['WiFi', '停车场', '健身房', '游泳池'],
          },
          transportNotes: '建议乘坐地铁1号线至天安门东站，步行约10分钟',
        },
        {
          day: 2,
          date: tripStore.input.endDate,
          attractions: [
            {
              id: '3',
              name: '长城（八达岭）',
              description: '万里长城最具代表性的段落，"不到长城非好汉"',
              imageUrl: 'https://picsum.photos/seed/changcheng/400/300',
              rating: 4.8,
              price: 40,
              durationMinutes: 300,
              openTime: '06:30',
              closeTime: '19:00',
              lat: 40.3538,
              lng: 116.0055,
              tags: ['世界遗产', '自然景观'],
              sourceUrls: [],
            },
          ],
          lunch: {
            id: 'r3',
            name: '长城脚下的公社',
            cuisineType: '农家菜',
            pricePerPerson: 80,
            rating: 4.3,
            lat: 40.3548,
            lng: 116.0065,
            distanceFromRoute: 200,
          },
          transportNotes: '建议包车或乘坐旅游专线前往八达岭，车程约1.5小时',
        },
      ],
      weather: {
        daily: [
          { date: tripStore.input.startDate, condition: '晴', tempHigh: 28, tempLow: 18, rainProb: 5 },
          { date: tripStore.input.endDate, condition: '多云', tempHigh: 26, tempLow: 17, rainProb: 15 },
        ],
        overallRisk: 'low',
      },
      budget: {
        attractionsTotal: 100,
        hotelsTotal: 800,
        mealsTotal: 350,
        transportTotal: 200,
        total: 1450,
        perPerson: 1450,
        breakdown: [
          { category: '门票', amount: 100, description: '故宫60元 + 长城40元' },
          { category: '住宿', amount: 800, description: '王府井希尔顿1晚' },
          { category: '餐饮', amount: 350, description: '2天餐饮' },
          { category: '交通', amount: 200, description: '地铁 + 包车' },
        ],
      },
      tips: [
        '故宫需要提前在官网预约门票',
        '八达岭长城建议早出发，避开人流高峰',
        '北京夏季炎热，注意防晒补水',
      ],
      createdAt: new Date().toISOString(),
    }

    tripStore.setPlan(mockPlan)
    tripStore.stopGenerating()
    router.push('/plan/mock-plan-1')
  }, 2000)
}
</script>

<template>
  <div class="home-view">
    <!-- 头部 -->
    <header class="home-header">
      <div class="logo">
        <span class="logo-icon">✈️</span>
        <h1>智能旅行助手</h1>
      </div>
      <p class="subtitle">输入目的地和偏好，3 分钟获得一份完整、可调整、预算透明的旅行计划</p>
    </header>

    <!-- 主要内容 -->
    <main class="home-main">
      <div class="form-container">
        <!-- 目的地搜索 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">📍</span>
            目的地
          </h2>
          <div class="search-wrapper">
            <n-input
              v-model:value="searchQuery"
              placeholder="输入城市或景点名称，如：北京、上海、成都..."
              size="large"
              clearable
              @focus="showSuggestions = true"
              @blur="setTimeout(() => showSuggestions = false, 200)"
              @input="handleSearch"
            />
            <div v-if="showSuggestions && filteredSuggestions.length" class="suggestions-dropdown">
              <div
                v-for="suggestion in filteredSuggestions"
                :key="suggestion"
                class="suggestion-item"
                @mousedown="selectDestination(suggestion)"
              >
                📍 {{ suggestion }}
              </div>
            </div>
          </div>
        </section>

        <!-- 出行日期 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">📅</span>
            出行日期
          </h2>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            :start-placeholder="'出发日期'"
            :end-placeholder="'返回日期'"
            size="large"
            style="width: 100%"
            @update:value="handleDateChange"
          />
          <p v-if="tripStore.tripDays > 0" class="trip-days-hint">
            共 <strong>{{ tripStore.tripDays }}</strong> 天行程
          </p>
        </section>

        <!-- 偏好标签 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">🏷️</span>
            旅行偏好 <span class="optional">(选填)</span>
          </h2>
          <n-space>
            <n-tag
              v-for="pref in preferenceOptions"
              :key="pref.value"
              :type="isPreferenceSelected(pref.value) ? 'success' : 'default'"
              size="large"
              checkable
              :checked="isPreferenceSelected(pref.value)"
              @update:checked="togglePreference(pref.value)"
            >
              {{ pref.icon }} {{ pref.label }}
            </n-tag>
          </n-space>
        </section>

        <!-- 预算档位 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">💰</span>
            预算档位
          </h2>
          <div class="budget-options">
            <div
              v-for="budget in budgetOptions"
              :key="budget.value"
              :class="['budget-card', { active: tripStore.input.budgetLevel === budget.value }]"
              @click="selectBudget(budget.value)"
            >
              <div class="budget-label">{{ budget.label }}</div>
              <div class="budget-desc">{{ budget.desc }}</div>
            </div>
          </div>
        </section>

        <!-- 出行人数 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">👥</span>
            出行人数
          </h2>
          <div class="travelers-control">
            <n-button
              :disabled="travelers <= 1"
              @click="updateTravelers(-1)"
            >
              -
            </n-button>
            <span class="travelers-count">{{ travelers }} 人</span>
            <n-button
              :disabled="travelers >= 20"
              @click="updateTravelers(1)"
            >
              +
            </n-button>
          </div>
        </section>

        <!-- 特殊需求 -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">📝</span>
            特殊需求 <span class="optional">(选填)</span>
          </h2>
          <n-input
            v-model:value="notes"
            type="textarea"
            placeholder="如：带老人、素食、避开拥挤..."
            :rows="3"
            @update:value="(val: string) => tripStore.updateInput({ notes: val })"
          />
        </section>

        <!-- 生成按钮 -->
        <section class="form-section generate-section">
          <n-button
            type="primary"
            size="large"
            block
            :loading="isGenerating"
            :disabled="isGenerating"
            @click="handleGenerate"
          >
            {{ isGenerating ? '正在为您规划行程...' : '🚀 一键生成旅行计划' }}
          </n-button>
        </section>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="home-footer">
      <p>智能旅行助手 · 多智能体协作规划 · 让旅行更简单</p>
    </footer>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.home-header {
  text-align: center;
  padding: 60px 20px 40px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
}

.logo h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.home-main {
  flex: 1;
  padding: 0 20px 40px;
}

.form-container {
  max-width: 680px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.section-icon {
  font-size: 20px;
}

.optional {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.search-wrapper {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.trip-days-hint {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.trip-days-hint strong {
  color: #667eea;
}

.budget-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.budget-card {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.budget-card:hover {
  border-color: #667eea;
}

.budget-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
}

.budget-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.budget-desc {
  font-size: 12px;
  color: #999;
}

.travelers-control {
  display: flex;
  align-items: center;
  gap: 20px;
}

.travelers-count {
  font-size: 20px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.generate-section {
  margin-top: 40px;
  margin-bottom: 0;
}

.home-footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}
</style>
