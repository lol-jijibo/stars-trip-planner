<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

const route = useRoute()
const router = useRouter()

const shareId = computed(() => route.params.shareId as string)

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="share-view">
    <header class="share-header">
      <h1>✈️ 智能旅行助手</h1>
    </header>

    <div class="share-content">
      <n-result
        status="info"
        title="分享页面"
        :description="`分享ID: ${shareId} - 这里将展示分享的旅行计划`"
      >
        <template #footer>
          <n-button type="primary" @click="goHome">创建我的计划</n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<style scoped>
.share-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.share-header {
  text-align: center;
  padding: 40px 0;
}

.share-header h1 {
  font-size: 28px;
  color: #333;
}

.share-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}
</style>
