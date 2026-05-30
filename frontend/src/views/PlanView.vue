<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTabs, NTabPane, NCard, NButton, NTag, NSpace, NSpin, NResult } from 'naive-ui'
import { useTripStore } from '../stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => tripStore.plan)
const activeDay = computed(() => tripStore.activeDayIndex)
const isGenerating = computed(() => tripStore.isGenerating)

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// 格式化金额
function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

// 切换日期
function handleDayChange(day: number) {
  tripStore.setActiveDay(day - 1)
}

// 返回首页
function goHome() {
  router.push('/')
}

// 查看地图
function viewMap() {
  router.push(`/plan/${planId.value}/map`)
}

// 查看预算
function viewBudget() {
  router.push(`/plan/${planId.value}/budget`)
}
</script>

<template>
  <div class="plan-view">
    <!-- 生成中状态 -->
    <div v-if="isGenerating" class="generating-state">
      <n-spin size="large" />
      <h2>正在为您规划行程...</h2>
      <p>多智能体正在协作，请稍候</p>
      <div class="progress-steps">
        <div
          v-for="(progress, index) in tripStore.agentProgress"
          :key="index"
          :class="['step', progress.status]"
        >
          <span class="step-icon">
            {{ progress.status === 'done' ? '✅' : progress.status === 'error' ? '❌' : '⏳' }}
          </span>
          <span class="step-text">{{ progress.message }}</span>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!plan" class="empty-state">
      <n-result status="404" title="未找到行程计划" description="请先创建一个旅行计划">
        <template #footer>
          <n-button type="primary" @click="goHome">
            创建新计划
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- 行程内容 -->
    <template v-else>
      <!-- 顶部导航 -->
      <header class="plan-header">
        <div class="header-left">
          <n-button quaternary @click="goHome">
            ← 返回
          </n-button>
          <h1>{{ plan.input.destination }}之旅</h1>
        </div>
        <div class="header-right">
          <n-space>
            <n-button @click="viewMap">🗺️ 地图</n-button>
            <n-button @click="viewBudget">💰 预算</n-button>
          </n-space>
        </div>
      </header>

      <!-- 行程概览 -->
      <div class="trip-overview">
        <n-card>
          <div class="overview-grid">
            <div class="overview-item">
              <span class="overview-label">目的地</span>
              <span class="overview-value">{{ plan.input.destination }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">日期</span>
              <span class="overview-value">
                {{ formatDate(plan.input.startDate) }} - {{ formatDate(plan.input.endDate) }}
              </span>
            </div>
            <div class="overview-item">
              <span class="overview-label">总预算</span>
              <span class="overview-value highlight">
                {{ formatPrice(plan.budget.total) }}
              </span>
            </div>
            <div class="overview-item">
              <span class="overview-label">天气</span>
              <span class="overview-value">
                {{ plan.weather.daily[0]?.condition || '未知' }}
                {{ plan.weather.daily[0]?.tempHigh }}°C
              </span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 日期切换 -->
      <div class="day-tabs-wrapper">
        <n-tabs
          type="segment"
          :value="String(activeDay + 1)"
          @update:value="(val: string) => handleDayChange(Number(val))"
        >
          <n-tab-pane
            v-for="(dayRoute, index) in plan.dailyRoutes"
            :key="dayRoute.day"
            :name="String(dayRoute.day)"
            :tab="`第 ${dayRoute.day} 天`"
          >
            <!-- 当天行程内容 -->
            <div class="day-content">
              <div class="day-header">
                <h2>第 {{ dayRoute.day }} 天 · {{ formatDate(dayRoute.date) }}</h2>
                <p class="transport-notes">{{ dayRoute.transportNotes }}</p>
              </div>

              <!-- 景点列表 -->
              <div class="attractions-list">
                <div
                  v-for="(attraction, aIndex) in dayRoute.attractions"
                  :key="attraction.id"
                  class="attraction-card"
                >
                  <div class="attraction-image">
                    <img
                      :src="attraction.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'"
                      :alt="attraction.name"
                    />
                  </div>
                  <div class="attraction-info">
                    <h3>{{ attraction.name }}</h3>
                    <p class="attraction-desc">{{ attraction.description }}</p>
                    <div class="attraction-meta">
                      <span class="rating">⭐ {{ attraction.rating }}</span>
                      <span class="price">{{ formatPrice(attraction.price) }}</span>
                      <span class="duration">🕐 {{ attraction.durationMinutes }}分钟</span>
                    </div>
                    <div class="attraction-tags">
                      <n-tag
                        v-for="tag in attraction.tags"
                        :key="tag"
                        size="small"
                      >
                        {{ tag }}
                      </n-tag>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 餐饮推荐 -->
              <div class="meals-section" v-if="dayRoute.lunch || dayRoute.dinner">
                <h3>🍽️ 餐饮推荐</h3>
                <div class="meals-grid">
                  <div v-if="dayRoute.lunch" class="meal-card">
                    <span class="meal-type">午餐</span>
                    <span class="meal-name">{{ dayRoute.lunch.name }}</span>
                    <span class="meal-price">{{ formatPrice(dayRoute.lunch.pricePerPerson) }}/人</span>
                  </div>
                  <div v-if="dayRoute.dinner" class="meal-card">
                    <span class="meal-type">晚餐</span>
                    <span class="meal-name">{{ dayRoute.dinner.name }}</span>
                    <span class="meal-price">{{ formatPrice(dayRoute.dinner.pricePerPerson) }}/人</span>
                  </div>
                </div>
              </div>

              <!-- 酒店推荐 -->
              <div class="hotel-section" v-if="dayRoute.hotel">
                <h3>🏨 推荐住宿</h3>
                <div class="hotel-card">
                  <span class="hotel-name">{{ dayRoute.hotel.name }}</span>
                  <span class="hotel-price">{{ formatPrice(dayRoute.hotel.pricePerNight) }}/晚</span>
                  <span class="hotel-rating">⭐ {{ dayRoute.hotel.rating }}</span>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- 旅行贴士 -->
      <div class="tips-section" v-if="plan.tips.length > 0">
        <n-card title="💡 旅行贴士">
          <ul class="tips-list">
            <li v-for="(tip, index) in plan.tips" :key="index">
              {{ tip }}
            </li>
          </ul>
        </n-card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.plan-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.generating-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}

.generating-state h2 {
  margin-top: 20px;
  color: #333;
}

.generating-state p {
  color: #666;
  margin-top: 8px;
}

.progress-steps {
  margin-top: 30px;
  text-align: left;
}

.step {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  font-size: 16px;
}

.step-text {
  color: #666;
}

.step.done .step-text {
  color: #52c41a;
}

.step.error .step-text {
  color: #ff4d4f;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  font-size: 24px;
  color: #333;
}

.trip-overview {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.overview-item {
  text-align: center;
}

.overview-label {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.overview-value.highlight {
  color: #667eea;
}

.day-tabs-wrapper {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.day-content {
  padding: 20px 0;
}

.day-header {
  margin-bottom: 20px;
}

.day-header h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.transport-notes {
  color: #666;
  font-size: 14px;
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attraction-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.attraction-image {
  width: 200px;
  flex-shrink: 0;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-info {
  padding: 16px;
  flex: 1;
}

.attraction-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.attraction-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.attraction-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
}

.rating {
  color: #faad14;
}

.price {
  color: #667eea;
  font-weight: 600;
}

.duration {
  color: #999;
}

.attraction-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meals-section,
.hotel-section {
  margin-top: 24px;
}

.meals-section h3,
.hotel-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}

.meals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.meal-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.meal-type {
  font-size: 14px;
  color: #999;
  min-width: 40px;
}

.meal-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.meal-price {
  color: #667eea;
}

.hotel-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.hotel-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.hotel-price {
  color: #667eea;
  font-weight: 600;
}

.hotel-rating {
  color: #faad14;
}

.tips-section {
  max-width: 1200px;
  margin: 20px auto;
}

.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li::before {
  content: '• ';
  color: #667eea;
}
</style>
