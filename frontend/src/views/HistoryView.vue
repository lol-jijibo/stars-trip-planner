<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="history-view">
    <header class="history-header">
      <n-button @click="goHome">← 返回首页</n-button>
      <h1>📋 历史计划</h1>
    </header>

    <div class="history-content">
      <n-result
        status="info"
        title="历史计划"
        description="这里将展示您之前创建的所有旅行计划"
      >
        <template #footer>
          <n-button type="primary" @click="goHome">创建新计划</n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto 20px;
}

.history-header h1 {
  font-size: 24px;
  color: #333;
}

.history-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
