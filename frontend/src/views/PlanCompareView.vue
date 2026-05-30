<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'
import { useTripStore } from '../stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const planId = computed(() => route.params.id as string)

function goBack() {
  router.push(`/plan/${planId.value}`)
}
</script>

<template>
  <div class="compare-view">
    <header class="compare-header">
      <n-button @click="goBack">← 返回行程</n-button>
      <h1>📊 方案对比</h1>
    </header>

    <div class="compare-content">
      <n-result
        status="info"
        title="方案对比功能"
        description="这里将展示多个备选方案的对比，包括行程差异、预算差异等"
      >
        <template #footer>
          <n-button type="primary" @click="goBack">返回行程</n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<style scoped>
.compare-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.compare-header {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto 20px;
}

.compare-header h1 {
  font-size: 24px;
  color: #333;
}

.compare-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
