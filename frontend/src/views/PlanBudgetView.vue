<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NResult } from 'naive-ui'
import { useTripStore } from '../stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => tripStore.plan)

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

function goBack() {
  router.push(`/plan/${planId.value}`)
}
</script>

<template>
  <div class="budget-view">
    <header class="budget-header">
      <n-button @click="goBack">← 返回行程</n-button>
      <h1>💰 预算详情</h1>
    </header>

    <div v-if="!plan" class="empty-state">
      <n-result status="404" title="未找到行程数据">
        <template #footer>
          <n-button type="primary" @click="goBack">返回行程</n-button>
        </template>
      </n-result>
    </div>

    <div v-else class="budget-content">
      <!-- 总预算概览 -->
      <n-card class="total-budget-card">
        <div class="total-budget">
          <span class="budget-label">总预算</span>
          <span class="budget-amount">{{ formatPrice(plan.budget.total) }}</span>
          <span class="budget-per-person">
            人均 {{ formatPrice(plan.budget.perPerson) }}
          </span>
        </div>
      </n-card>

      <!-- 预算明细 -->
      <div class="budget-breakdown">
        <n-card title="预算明细">
          <div class="breakdown-list">
            <div
              v-for="item in plan.budget.breakdown"
              :key="item.category"
              class="breakdown-item"
            >
              <div class="item-left">
                <span class="item-category">{{ item.category }}</span>
                <span class="item-desc">{{ item.description }}</span>
              </div>
              <span class="item-amount">{{ formatPrice(item.amount) }}</span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 预算图表占位 -->
      <div class="chart-placeholder">
        <n-card title="预算分布">
          <div class="chart-area">
            <span class="chart-icon">📊</span>
            <p>图表加载中...</p>
            <p class="chart-hint">这里将展示预算分布饼图</p>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.budget-header {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto 20px;
}

.budget-header h1 {
  font-size: 24px;
  color: #333;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.budget-content {
  max-width: 800px;
  margin: 0 auto;
}

.total-budget-card {
  margin-bottom: 20px;
}

.total-budget {
  text-align: center;
  padding: 20px 0;
}

.budget-label {
  display: block;
  font-size: 16px;
  color: #999;
  margin-bottom: 8px;
}

.budget-amount {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.budget-per-person {
  font-size: 16px;
  color: #666;
}

.budget-breakdown {
  margin-bottom: 20px;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-category {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.item-desc {
  font-size: 14px;
  color: #999;
}

.item-amount {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.chart-placeholder {
  margin-bottom: 20px;
}

.chart-area {
  text-align: center;
  padding: 40px 0;
}

.chart-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.chart-area p {
  color: #666;
  margin-bottom: 4px;
}

.chart-hint {
  font-size: 14px;
  color: #999;
}
</style>
