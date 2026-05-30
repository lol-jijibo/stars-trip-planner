import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '智能旅行助手' },
  },
  {
    path: '/plan/:id',
    name: 'plan',
    component: () => import('../views/PlanView.vue'),
    meta: { title: '行程计划' },
  },
  {
    path: '/plan/:id/map',
    name: 'plan-map',
    component: () => import('../views/PlanMapView.vue'),
    meta: { title: '地图视图' },
  },
  {
    path: '/plan/:id/budget',
    name: 'plan-budget',
    component: () => import('../views/PlanBudgetView.vue'),
    meta: { title: '预算详情' },
  },
  {
    path: '/plan/:id/compare',
    name: 'plan-compare',
    component: () => import('../views/PlanCompareView.vue'),
    meta: { title: '方案对比' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { title: '历史计划' },
  },
  {
    path: '/share/:shareId',
    name: 'share',
    component: () => import('../views/ShareView.vue'),
    meta: { title: '分享' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：更新页面标题
router.beforeEach((to) => {
  document.title = (to.meta.title as string) || '智能旅行助手'
})

export default router
