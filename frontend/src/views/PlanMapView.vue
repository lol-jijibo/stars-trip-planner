<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'
import { useTripStore } from '../stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => tripStore.plan)

function goBack() {
  router.push(`/plan/${planId.value}`)
}
</script>

<template>
  <div class="map-view">
    <header class="map-header">
      <n-button @click="goBack">← 返回行程</n-button>
      <h1>🗺️ 地图视图</h1>
    </header>

    <div v-if="!plan" class="empty-state">
      <n-result status="404" title="未找到行程数据">
        <template #footer>
          <n-button type="primary" @click="goBack">返回行程</n-button>
        </template>
      </n-result>
    </div>

    <div v-else class="map-container">
      <div class="map-placeholder">
        <div class="placeholder-content">
          <span class="placeholder-icon">🗺️</span>
          <h2>地图加载中...</h2>
          <p>这里将展示每日行程路线和景点标注</p>
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: #667eea;"></span>
              <span>景点</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #52c41a;"></span>
              <span>餐厅</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #faad14;"></span>
              <span>酒店</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图控制面板 -->
      <div class="map-controls">
        <div class="day-selector">
          <n-button
            v-for="dayRoute in plan.dailyRoutes"
            :key="dayRoute.day"
            :type="tripStore.activeDayIndex === dayRoute.day - 1 ? 'primary' : 'default'"
            @click="tripStore.setActiveDay(dayRoute.day - 1)"
          >
            第 {{ dayRoute.day }} 天
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.map-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.map-header h1 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-container {
  flex: 1;
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.placeholder-content h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.placeholder-content p {
  color: #666;
  margin-bottom: 24px;
}

.map-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.day-selector {
  display: flex;
  gap: 8px;
}
</style>
