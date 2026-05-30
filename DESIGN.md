# 智能旅行助手 — 产品设计与架构文档

## 一、产品愿景

**一句話定位：** 输入目的地和偏好，3 分钟获得一份完整、可调整、预算透明的旅行计划。

传统旅行规划需要花费数小时甚至数天，在多个网站之间反复横跳：查攻略、比酒店、算预算、看天气、排路线。一旦某个环节变动，整个计划可能都要重来。

我们的智能旅行助手利用多智能体（Multi-Agent）协作架构，模拟一个专业旅行规划团队：有人负责搜集景点信息，有人负责筛选酒店，有人负责核算预算，有人负责路线优化——最终给用户交付一份个性化、可视化、可交互的旅行计划。

---

## 二、核心功能矩阵

### 2.1 用户输入层

| 输入项 | 类型 | 说明 |
|--------|------|------|
| 目的地 | 必填 | 城市/国家/区域，支持多目的地 |
| 出行日期 | 必填 | 起止日期，自动计算天数 |
| 偏好标签 | 选填 | 历史文化 / 自然风光 / 美食购物 / 亲子休闲 / 摄影打卡 |
| 预算档位 | 选填 | 经济型 / 舒适型 / 豪华型（对应不同酒店/餐饮标准） |
| 出行人数 | 选填 | 影响酒店房型和预算计算 |
| 特殊需求 | 选填 | 如"带老人"、"素食"、"避开拥挤" |

### 2.2 智能规划层

| 功能 | 描述 |
|------|------|
| 景点智能推荐 | 根据偏好标签 + 季节 + 热度，多源聚合推荐景点 |
| 日程自动编排 | 按地理聚类 + 开放时间 + 游览时长，自动排定每日行程 |
| 餐饮推荐 | 按行程路线顺路推荐餐厅，支持口味/预算筛选 |
| 酒店推荐 | 按交通便利度 + 预算档位 + 评分综合排序 |
| 天气预警 | 拉取出行日期天气预报，雨天自动建议室内备选 |
| 预算自动核算 | 门票 + 住宿 + 餐饮 + 交通逐项核算，支持导出 |

### 2.3 交互调整层

| 功能 | 描述 |
|------|------|
| 拖拽调整顺序 | 行程卡片支持拖拽排序，顺序变化自动重算时间和路线 |
| 景点增删 | 一键删除不感兴趣的景点，或从推荐池中添加新景点 |
| 地图可视化 | 每日路线在地图上标记，点间连线展示通勤时间 |
| 多方案对比 | 同一目的地生成 2-3 套方案（紧凑型/舒适型/深度游） |
| 分享导出 | 导出为 PDF / 图片 / 分享链接 |

---

## 三、技术架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3 + TypeScript)                │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ 偏好输入 │  │ 行程展示  │  │ 地图组件  │  │ 预算仪表盘   │  │
│  │ Wizard  │  │ Timeline │  │ MapView  │  │ BudgetPanel  │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │            │              │               │          │
│       └────────────┴──────────────┴───────────────┘          │
│                          │ Pinia Store                        │
│                          │ SSE / WebSocket                    │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                     API Gateway (FastAPI)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ /api/    │  │ /api/    │  │ /api/    │  │ /api/       │  │
│  │ trip     │  │ map      │  │ hotel    │  │ budget      │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
└───────┼──────────────┼─────────────┼───────────────┼─────────┘
        │              │             │               │
┌───────┼──────────────┼─────────────┼───────────────┼─────────┐
│                      Agent 编排层 (LangGraph)                  │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                   Supervisor Agent                     │   │
│  │          (任务分解、结果汇总、冲突仲裁)                   │   │
│  └───┬──────────┬──────────┬──────────┬──────────────────┘   │
│      │          │          │          │                       │
│  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼───┐                    │
│  │景点  │  │酒店  │  │路线  │  │预算   │   ...              │
│  │Agent │  │Agent │  │Agent │  │Agent  │                    │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬────┘                    │
│     │         │         │         │                           │
│     └─────────┴─────────┴─────────┘                           │
│                      │ Tool Layer                             │
│  ┌────────┐ ┌───────┐ ┌──────┐ ┌───────┐ ┌──────────┐       │
│  │WebSearch│ │WebFetch│ │MapAPI│ │Weather│ │Calculator│       │
│  └────────┘ └───────┘ └──────┘ └───────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
        │              │             │               │
┌───────┼──────────────┼─────────────┼───────────────┼─────────┐
│                      数据与基础设施层                              │
│  ┌────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐     │
│  │Redis   │  │PostgreSQL│  │MinIO/OSS│  │External APIs │     │
│  │Cache   │  │主数据存储 │  │图片存储  │  │高德/OpenWeather│    │
│  └────────┘  └──────────┘  └─────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 四、Agent 体系设计（项目核心）

### 4.1 设计理念

不做一个"一个大模型调用搞定一切"的系统。真正的旅行规划是一个**多维度约束优化问题**——景点选择、时间分配、路线优化、预算控制之间相互耦合。单一 prompt 很难同时考虑周全。

我们采用 **Supervisor + Worker** 模式，模拟一个真实的旅行规划团队：

- **Supervisor（主规划师）**：接收用户需求，拆解为子任务，分派给专业 Agent，汇总结果，做最终决策
- **Worker Agent（专业代理）**：各自聚焦一个领域，拥有该领域的专用工具和知识

### 4.2 Agent 清单

| Agent | 职责 | 依赖工具 | 输出 |
|-------|------|---------|------|
| **Supervisor Agent** | 任务拆解、流程编排、冲突仲裁、结果汇总 | 全部 Agent | 最终 TripPlan |
| **Attraction Agent** | 根据偏好+日期+季节搜索推荐景点，获取评分/票价/开放时间/建议游览时长 | WebSearch, WebFetch | Attraction[] |
| **Route Agent** | 地理聚类景点，优化每日游览顺序，计算通勤时间 | MapAPI (高德/百度) | DailyRoute[] |
| **Hotel Agent** | 按区域+预算+评分推荐酒店，计算住宿成本 | WebSearch, WebFetch | Hotel[] |
| **Cuisine Agent** | 按行程路线顺路推荐餐厅 | WebSearch, WebFetch | Restaurant[] |
| **Weather Agent** | 拉取出行期间天气预报，评估影响 | WeatherAPI | WeatherReport |
| **Budget Agent** | 汇总门票/住宿/餐饮/交通，核算总预算 | Calculator | BudgetReport |
| **Critic Agent** | 审查生成的计划：是否有时间冲突？日均步数是否合理？是否遗漏必去景点？ | 无（纯推理） | ReviewReport |

### 4.3 Agent 协作流程（LangGraph StateGraph）

```
User Input → Supervisor → [并行]
                           ├─ Attraction Agent ──→ Attraction[]
                           ├─ Weather Agent ─────→ WeatherReport
                           └─ Hotel Agent ───────→ Hotel[]

                              ↓ Supervisor 汇总初步结果
                              ↓ 传给 Route Agent 做日程编排
                              ↓
                           Route Agent → DailyRoute[]

                              ↓
                           [并行]
                           ├─ Cuisine Agent ──→ Restaurant[] (根据路线推荐)
                           └─ Budget Agent ───→ BudgetReport

                              ↓ Supervisor 汇总全部结果
                              ↓
                           Critic Agent → ReviewReport

                              ↓ (如需修改，回到 Route Agent 重排)
                              ↓
                           Final TripPlan → SSE 推送前端
```

### 4.4 关键设计决策

**为什么用 LangGraph 而不是纯 Chain？**
- 旅行规划有**条件分支**（如：天气不好→调整户外景点→重排路线）
- 需要**人机交互中断**（用户说"换掉这个酒店"→只重跑 Hotel Agent）
- Supervisor 需要根据中间结果做**动态决策**（"景点太少→让 Attraction Agent 扩大搜索范围"）

**为什么每个 Agent 是独立的？**
- 单一职责，prompt 可以写得非常精准
- 工具权限隔离（Hotel Agent 不需要访问 MapAPI）
- 可以独立迭代优化（重新 prompt-engineer 某个 Agent 不影响其他）
- 支持模型分层（简单计算用 Haiku，复杂规划用 Opus）

---

## 五、前端架构设计（Vue 3 + TypeScript）

### 5.1 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | Vue 3.4+ (Composition API) | 生态成熟，响应式系统优秀 |
| 语言 | TypeScript strict | 类型安全，减少运行时错误 |
| 构建 | Vite 6 | 极速 HMR，ESM 原生 |
| 状态管理 | Pinia | Vue 官方推荐，TypeScript 友好 |
| 路由 | Vue Router 4 | SPA 路由 |
| UI 组件库 | Naive UI / Element Plus | 中文生态好，组件丰富 |
| 地图 | @vuemap/vue-amap (高德) | 国内地图服务，POI 数据丰富 |
| 拖拽 | vuedraggable (SortableJS) | 行程卡片拖拽排序 |
| HTTP | ofetch / axios | 请求封装 |
| 实时通信 | EventSource (SSE) | 接收 Agent 进度推送 |
| 图表 | ECharts 5 | 预算饼图、行程占比图 |

### 5.2 页面路由

```
/                      → 首页（目的地输入 + 偏好设置向导）
/plan/:id              → 行程计划页（核心页面）
/plan/:id/map          → 地图全屏视图
/plan/:id/budget       → 预算详情页
/plan/:id/compare      → 多方案对比页
/history               → 历史计划列表
/share/:shareId        → 分享页（只读）
```

### 5.3 核心组件树

```
App.vue
├── HomeView.vue                      # 首页
│   ├── SearchBox.vue                 # 目的地搜索（支持模糊匹配）
│   ├── DateRangePicker.vue           # 出行日期选择
│   ├── PreferenceTags.vue            # 偏好标签选择（多选）
│   ├── BudgetSlider.vue              # 预算档位滑块
│   └── QuickStart.vue                # 一键生成按钮
│
├── PlanView.vue                      # 行程计划页（核心）
│   ├── PlanHeader.vue                # 顶栏：目的地/日期/天气概览
│   ├── DayTabs.vue                   # 日期 Tab 切换
│   ├── TimelineCard.vue              # 单日时间线（可拖拽）
│   │   ├── AttractionItem.vue        # 景点卡片
│   │   ├── RestaurantItem.vue        # 餐厅卡片
│   │   └── TransportInfo.vue         # 通勤信息
│   ├── MapPanel.vue                  # 侧边地图面板
│   │   ├── RoutePolyline.vue         # 路线连线
│   │   └── MarkerCluster.vue         # 标记聚合
│   ├── BudgetPanel.vue               # 预算面板（可收起）
│   │   ├── BudgetPieChart.vue        # 预算饼图
│   │   └── BudgetLineItem.vue        # 逐项明细
│   ├── HotelCard.vue                 # 推荐酒店卡片
│   ├── AlternativePanel.vue          # 备选方案抽屉
│   └── AgentProgressBar.vue          # Agent 执行进度（SSE）
│
├── CompareView.vue                   # 多方案对比
│   └── PlanDiffTable.vue             # 方案差异表
│
├── HistoryView.vue                   # 历史记录
│   └── PlanCard.vue                  # 计划摘要卡片
│
└── ShareView.vue                     # 分享展示页
```

### 5.4 状态管理（Pinia Store 设计）

```typescript
// stores/trip.ts
interface TripState {
  // 用户输入
  input: {
    destination: string
    dateRange: [Date, Date]
    preferences: Preference[]
    budgetLevel: 'economy' | 'comfort' | 'luxury'
    travelers: number
    notes: string
  }

  // 规划结果
  plan: TripPlan | null
  alternatives: TripPlan[]  // 备选方案

  // Agent 进度（SSE 推送更新）
  agentProgress: {
    phase: string           // 当前阶段
    agentName: string       // 当前执行的 Agent
    status: 'running' | 'done' | 'error'
    message: string
  }[]

  // UI 状态
  activeDayIndex: number
  showBudget: boolean
  editingItem: PlanItem | null
}
```

### 5.5 SSE 进度推送设计

后端 Agent 每完成一个步骤，通过 SSE 推送 JSON 事件：

```typescript
// SSE 事件类型
type SSEEvent =
  | { type: 'phase_start'; phase: string; agent: string }
  | { type: 'agent_progress'; agent: string; message: string; percent: number }
  | { type: 'partial_result'; agent: string; data: object }  // 流式返回中间结果
  | { type: 'phase_done'; phase: string }
  | { type: 'plan_ready'; plan: TripPlan }
  | { type: 'error'; agent: string; message: string }
```

前端在用户提交后建立 SSE 连接，实时展示 Agent 工作进度——"正在为您搜索故宫附近的酒店..."→"正在优化第 2 天行程路线..."——让等待过程变得透明且有参与感。

---

## 六、后端架构设计（Python + FastAPI）

### 6.1 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| Web 框架 | FastAPI | 异步原生，SSE 支持好，自动 OpenAPI 文档 |
| Agent 编排 | LangGraph | 有状态的多步骤 Agent 工作流 |
| LLM 调用 | 多模型路由 (Claude API / OpenAI / 本地) | 灵活切换，成本控制 |
| 任务队列 | Celery / ARQ | 长任务异步执行 |
| 缓存 | Redis | Agent 结果缓存、Session 存储 |
| 数据库 | PostgreSQL + SQLAlchemy 2.0 | 用户数据、行程持久化 |
| 向量检索 | pgvector / Chroma | 景点/酒店语义检索 |
| 搜索引擎 | Tavily / SerpAPI / 自建 | Web 搜索工具 |
| 文件存储 | MinIO / 阿里云 OSS | 行程封面图、导出 PDF |
| 地图服务 | 高德地图 API | 地理编码、路径规划、POI 搜索 |
| 天气服务 | OpenWeatherMap / 和风天气 | 天气预报 |

### 6.2 项目目录结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI 应用入口
│   ├── config.py                  # 配置管理 (pydantic-settings)
│   │
│   ├── api/                       # API 路由层
│   │   ├── __init__.py
│   │   ├── trip.py                # /api/trip/*  行程 CRUD
│   │   ├── plan.py                # /api/plan/*  规划生成（SSE）
│   │   ├── hotel.py               # /api/hotel/* 酒店相关
│   │   └── share.py               # /api/share/* 分享功能
│   │
│   ├── agents/                    # Agent 定义（核心）
│   │   ├── __init__.py
│   │   ├── supervisor.py          # Supervisor Agent
│   │   ├── attraction.py          # 景点推荐 Agent
│   │   ├── route.py               # 路线规划 Agent
│   │   ├── hotel.py               # 酒店推荐 Agent
│   │   ├── cuisine.py             # 餐饮推荐 Agent
│   │   ├── weather.py             # 天气查询 Agent
│   │   ├── budget.py              # 预算核算 Agent
│   │   └── critic.py              # 计划审查 Agent
│   │
│   ├── graph/                     # LangGraph 工作流
│   │   ├── __init__.py
│   │   ├── state.py               # GraphState 定义
│   │   └── workflow.py            # StateGraph 构建
│   │
│   ├── tools/                     # Agent 工具集
│   │   ├── __init__.py
│   │   ├── adapters/              # 外部 API 适配器
│   │   │   ├── __init__.py
│   │   │   ├── base.py            # BaseAdapter 基类
│   │   │   ├── geo.py             # GeoPoint 统一坐标模型
│   │   │   ├── amap_adapter.py    # 高德地图适配器
│   │   │   ├── baidu_adapter.py   # 百度地图适配器
│   │   │   ├── unsplash_adapter.py# Unsplash 适配器
│   │   │   └── weather_adapter.py # 天气多源适配器
│   │   ├── web_search.py          # 网络搜索工具
│   │   ├── web_fetch.py           # 网页内容抓取
│   │   ├── map_api.py             # 地图 API 封装
│   │   ├── weather_api.py         # 天气 API 封装
│   │   ├── merger.py              # 多源数据合并去重
│   │   └── calculator.py          # 预算计算工具
│   │
│   ├── models/                    # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── trip.py
│   │   └── user.py
│   │
│   ├── schemas/                   # Pydantic 验证模型
│   │   ├── __init__.py
│   │   ├── trip.py
│   │   ├── plan.py
│   │   └── agent.py
│   │
│   ├── services/                  # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── trip_service.py
│   │   └── export_service.py      # PDF/图片导出
│   │
│   └── utils/                     # 工具函数
│       ├── __init__.py
│       ├── cache.py
│       └── sse.py                 # SSE 事件发送辅助
│
├── tests/
│   ├── test_agents/
│   ├── test_api/
│   └── conftest.py
│
├── alembic/                       # 数据库迁移
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 6.3 外部数据适配层（Adapter Layer）—— 多源异构数据统一方案

#### 问题本质

我们的 Agent 需要调用多个外部 API，它们返回的坐标字段各不相同：

| 外部 API | 经度字段 | 纬度字段 | 评分字段 | 价格字段 |
|----------|----------|----------|----------|----------|
| 高德地图 | `location` (逗号拼接 `"lng,lat"`) | 同上 | `biz_ext.rating` | `biz_ext.cost` |
| 百度地图 | `location.lng` | `location.lat` | `detail_info.overall_rating` | `detail_info.price` |
| Unsplash | `location.position.longitude` | `location.position.latitude` | — | — |
| OpenWeatherMap | `coord.lon` | `coord.lat` | — | — |
| 和风天气 | `lon` | `lat` | — | — |
| Google Places | `geometry.location.lng()` | `geometry.location.lat()` | `rating` | `price_level` (1-4) |
| 携程/飞猪抓取 | `longitude` | `latitude` | `score` | `price` |

**核心矛盾：** Agent 不应该关心数据来源的格式差异，它只需要一套统一的数据模型。

#### 解决方案：三层归一化架构

```
外部 API 原始响应
      │
      ▼
┌─────────────────────────────┐
│  第 1 层：Provider Adapter  │  ← 每个外部 API 一个 Adapter
│  高德Adapter │ 百度Adapter │    职责：字段映射 + 类型转换
│  UnsplashA  │ WeatherA    │    输出：ProviderNormalized{*}
└─────────────┬───────────────┘
      │
      ▼
┌─────────────────────────────┐
│  第 2 层：Canonical Model   │  ← 领域标准模型（Pydantic）
│  GeoPoint │ AttractionInfo  │    职责：校验 + 去重 + 合并
│  WeatherData │ HotelInfo    │    输出：Canonical{*}
└─────────────┬───────────────┘
      │
      ▼
┌─────────────────────────────┐
│  第 3 层：Multi-Source Merge│  ← 同一景点多源数据合并
│  冲突解决 │ 可信度加权      │    职责：选择最优数据
│  去重策略 │ 版本标记        │    输出：MergedEntity{*}
└─────────────────────────────┘
      │
      ▼
    Agent 消费
```

#### 第 1 层：Provider Adapter 实现

每个外部 API 封装为一个 Adapter 类，职责单一：**把外部格式翻译成我们的中间格式。**

```python
# tools/adapters/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from pydantic import BaseModel

TExternal = TypeVar("TExternal")   # 外部 API 原始响应类型
TNormalized = TypeVar("TNormalized")  # 中间标准化类型


class BaseAdapter(ABC, Generic[TExternal, TNormalized]):
    """外部 API 适配器基类"""

    @abstractmethod
    def normalize(self, raw: TExternal) -> TNormalized:
        """将外部 API 响应转换为中间标准化格式"""
        ...

    @abstractmethod
    def source_name(self) -> str:
        """数据来源标识，用于第 3 层合并"""
        ...
```

```python
# tools/adapters/geo.py
from pydantic import BaseModel, field_validator


class GeoPoint(BaseModel):
    """🔑 统一的地理坐标模型 —— 整个系统唯一的地理点表示"""
    lat: float
    lng: float

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not (-90 <= v <= 90):
            raise ValueError(f"纬度必须在 -90~90 之间，收到: {v}")
        return round(v, 6)

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not (-180 <= v <= 180):
            raise ValueError(f"经度必须在 -180~180 之间，收到: {v}")
        return round(v, 6)
```

```python
# tools/adapters/amap_adapter.py
from tools.adapters.base import BaseAdapter
from tools.adapters.geo import GeoPoint

class AmapPOIResponse:
    """高德 POI 搜索原始响应（仅示意字段）"""
    id: str
    name: str
    location: str  # ⚠️ "116.397428,39.90923" (lng,lat 逗号拼接!)
    biz_ext: dict  # ⚠️ 评分藏在 biz_ext.rating 里


class AmapAdapter(BaseAdapter[AmapPOIResponse, "AmapNormalized"]):
    """高德地图 → 统一坐标模型"""

    def source_name(self) -> str:
        return "amap"

    def normalize(self, raw: AmapPOIResponse) -> "AmapNormalized":
        # ⭐ 关键转换：高德的 "lng,lat" 字符串 → GeoPoint
        lng_str, lat_str = raw.location.split(",")
        return AmapNormalized(
            source=self.source_name(),
            external_id=raw.id,
            name=raw.name,
            location=GeoPoint(
                lat=float(lat_str),   # ← 注意：高德格式是 lng 在前！
                lng=float(lng_str),
            ),
            rating=float(raw.biz_ext.get("rating", 0)),
            raw=raw,  # 保留原始数据，便于调试和回溯
        )


class AmapNormalized(BaseModel):
    source: str
    external_id: str
    name: str
    location: GeoPoint   # ← 已统一为 GeoPoint
    rating: float
    raw: object          # 原始响应，调试用
```

```python
# tools/adapters/unsplash_adapter.py

class UnsplashPhotoResponse:
    """Unsplash 图片原始响应"""
    id: str
    description: str
    urls: dict           # {raw, full, regular, small, thumb}
    location: dict       # ⚠️ {city, country, position: {latitude, longitude}}


class UnsplashAdapter(BaseAdapter[UnsplashPhotoResponse, "UnsplashNormalized"]):
    """Unsplash → 统一坐标模型"""

    def source_name(self) -> str:
        return "unsplash"

    def normalize(self, raw: UnsplashPhotoResponse) -> "UnsplashNormalized":
        pos = raw.location.get("position", {})
        return UnsplashNormalized(
            source=self.source_name(),
            external_id=raw.id,
            description=raw.description,
            image_url=raw.urls.get("regular", ""),
            location=GeoPoint(
                lat=float(pos.get("latitude", 0)),    # ← Unsplash 用 latitude/longitude
                lng=float(pos.get("longitude", 0)),   # ← 注意字段名完全不同
            ),
        )
```

```python
# tools/adapters/weather_adapter.py

class OpenWeatherResponse:
    """OpenWeatherMap 原始响应"""
    coord: dict  # ⚠️ {"lon": 116.4, "lat": 39.9}
    weather: list
    main: dict   # {temp, feels_like, temp_min, temp_max, humidity}


class HefengWeatherResponse:
    """和风天气 原始响应"""
    location: dict  # ⚠️ {"lon": "116.4", "lat": "39.9"} —— 注意是字符串!
    now: dict       # {"temp": "25", "text": "晴", ...}


class WeatherAdapter:
    """天气多源适配器 —— 支持 OpenWeatherMap / 和风天气 双源"""

    @staticmethod
    def from_openweather(raw: dict) -> "WeatherNormalized":
        return WeatherNormalized(
            source="openweathermap",
            location=GeoPoint(
                lat=float(raw["coord"]["lat"]),
                lng=float(raw["coord"]["lon"]),   # ← 用 "lon" 不是 "lng"
            ),
            temperature=raw["main"]["temp"],
            humidity=raw["main"]["humidity"],
            condition=raw["weather"][0]["main"],
        )

    @staticmethod
    def from_hefeng(raw: dict) -> "WeatherNormalized":
        return WeatherNormalized(
            source="hefeng",
            location=GeoPoint(
                lat=float(raw["location"]["lat"]),  # ← 和风天气坐标是字符串，需转 float
                lng=float(raw["location"]["lon"]),
            ),
            temperature=float(raw["now"]["temp"]),
            humidity=float(raw["now"].get("humidity", 0)),
            condition=raw["now"]["text"],
        )
```

#### 第 2 层：Canonical Model —— 领域标准模型

所有 Adapter 输出统一的领域模型。上层代码（Agent、Service）**只 import 这些模型，永远不 import 外部原始类型。**

```python
# schemas/canonical.py
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from tools.adapters.geo import GeoPoint


class WeatherNormalized(BaseModel):
    """🌤️ 天气 —— 统一天气数据模型"""
    source: str
    location: GeoPoint      # ← 永远是 GeoPoint，不管来源是什么
    temperature: float
    humidity: float
    condition: str          # "晴" / "多云" / "雨" → 统一中文
    fetched_at: datetime | None = None


class AttractionInfo(BaseModel):
    """🏛️ 景点 —— 统一景点数据模型"""
    source: str             # "amap" | "baidu" | "google_places"
    external_id: str
    name: str
    description: str = ""
    location: GeoPoint      # ← 永远是 GeoPoint
    rating: float = 0       # 统一 0-5 分制
    price: float = 0        # 统一人民币元
    duration_minutes: int = 120
    open_time: str = "09:00"
    close_time: str = "17:00"
    tags: list[str] = []
    image_url: str = ""
    source_url: str = ""    # 信息来源链接


class HotelInfo(BaseModel):
    """🏨 酒店 —— 统一酒店数据模型"""
    source: str
    external_id: str
    name: str
    location: GeoPoint      # ← 永远是 GeoPoint
    price_per_night: float  # 统一人民币元
    rating: float           # 统一 0-5 分制
    amenities: list[str] = []


class RouteInfo(BaseModel):
    """🚗 路径 —— 统一路径规划模型"""
    source: str             # "amap" | "baidu"
    origin: GeoPoint
    destination: GeoPoint
    distance_meters: int
    duration_seconds: int
    polyline: list[GeoPoint]  # 路线折线点
    transport_mode: str       # "driving" | "walking" | "transit"
```

#### 第 3 层：多源数据合并

同一个景点可能出现在多个数据源中（高德有、百度也有）。合并层负责去重和择优。

```python
# tools/merger.py
from schemas.canonical import AttractionInfo, GeoPoint
from math import radians, cos, sin, asin, sqrt


def haversine(p1: GeoPoint, p2: GeoPoint) -> float:
    """计算两点间距离（米）"""
    R = 6371000
    dlat = radians(p2.lat - p1.lat)
    dlng = radians(p2.lng - p1.lng)
    a = sin(dlat/2)**2 + cos(radians(p1.lat)) * cos(radians(p2.lat)) * sin(dlng/2)**2
    return R * 2 * asin(sqrt(a))


def merge_attractions(
    items: list[AttractionInfo],
    distance_threshold: float = 100.0,  # 100 米内视为同一景点
) -> list[AttractionInfo]:
    """
    合并多个数据源的景点数据。

    策略：
    1. 按地理位置聚类（同一景点可能在高德和百度各出现一次）
    2. 同簇取评分最高、信息最完整的版本
    3. 合并 tags，去重
    4. 记录所有来源 URL
    """
    clusters: list[list[AttractionInfo]] = []

    for item in items:
        matched = False
        for cluster in clusters:
            rep = cluster[0]
            if haversine(item.location, rep.location) < distance_threshold:
                cluster.append(item)
                matched = True
                break
        if not matched:
            clusters.append([item])

    merged = []
    for cluster in clusters:
        # 选评分最高的作为主版本
        best = max(cluster, key=lambda x: x.rating)
        # 聚合所有 tags 和 source_url
        all_tags = list({t for item in cluster for t in item.tags})
        all_urls = [item.source_url for item in cluster if item.source_url]
        best.tags = all_tags
        best.source_url = all_urls[0] if all_urls else ""
        best.source = "+".join(item.source for item in cluster)  # "amap+baidu"
        merged.append(best)

    return merged


# 信任权重：用于数据冲突时的抉择
SOURCE_TRUST = {
    "amap": 0.9,            # 高德：国内 POI 数据最全
    "baidu": 0.85,          # 百度：评分体系较好
    "google_places": 0.8,   # Google：国际景点覆盖好
    "ctrip_crawl": 0.7,     # 携程抓取：价格信息丰富但可能偏差
    "web_scrape": 0.5,      # 通用网页抓取：可信度较低
}
```

#### 在 Agent 中的使用

Agent 只跟 Adapter + Canonical Model 打交道，完全不需要知道外部 API 的原始字段名：

```python
# agents/attraction.py
from tools.adapters.amap_adapter import AmapAdapter, AmapPOIResponse
from tools.adapters.unsplash_adapter import UnsplashAdapter
from tools.merger import merge_attractions
from schemas.canonical import AttractionInfo, GeoPoint


async def search_attractions(city: str, preference: str) -> list[AttractionInfo]:
    # 第 1 层：调用多个外部 API，每个都用 Adapter 归一化
    raw_amap_results: list[AmapPOIResponse] = await amap_client.search_poi(city, preference)
    amap_adapter = AmapAdapter()
    amap_normalized = [amap_adapter.normalize(r) for r in raw_amap_results]

    # 也可以接入百度作为补充
    raw_baidu_results = await baidu_client.search_poi(city, preference)
    baidu_adapter = BaiduAdapter()
    baidu_normalized = [baidu_adapter.normalize(r) for r in raw_baidu_results]

    # 第 2 层：已经全部是 Canonical Model，可以直接合并
    all_items = amap_normalized + baidu_normalized

    # 第 3 层：去重合并
    merged = merge_attractions(all_items)

    # Agent 之后只操作 AttractionInfo，永远不碰 GeoPoint 之外的坐标类型
    return merged
```

#### 架构收益总结

| 维度 | 没有适配层 | 有适配层 |
|------|-----------|---------|
| 坐标字段 | 每个 Agent 自己处理 `lng`/`lon`/`longitude`/`location` 等变体 | 所有 Agent 只用 `GeoPoint.lat` 和 `GeoPoint.lng` |
| 新增数据源 | 修改所有消费该数据的 Agent | 只新增一个 Adapter 类 |
| 数据校验 | 分散在各处，容易遗漏 | 集中在 Adapter 和 Canonical Model 中 |
| 多源合并 | Agent prompt 里手动处理 | `merger.py` 统一策略，可独立测试 |
| 调试回溯 | 不知道数据从哪来的 | `source` 字段 + `raw` 保留原始响应 |
| 单元测试 | 需要 mock 外部 API | 可以 mock Adapter，用固定数据测合并逻辑 |

### 6.4 核心数据模型（TypeScript 类型镜像定义）

```python
# schemas/plan.py
from pydantic import BaseModel
from datetime import date, time
from typing import Optional
from enum import Enum

class Preference(str, Enum):
    HISTORY = "history"
    NATURE = "nature"
    FOOD = "food"
    SHOPPING = "shopping"
    FAMILY = "family"
    PHOTOGRAPHY = "photography"

class BudgetLevel(str, Enum):
    ECONOMY = "economy"
    COMFORT = "comfort"
    LUXURY = "luxury"

class TripInput(BaseModel):
    destination: str
    start_date: date
    end_date: date
    preferences: list[Preference] = []
    budget_level: BudgetLevel = BudgetLevel.COMFORT
    travelers: int = 1
    notes: str = ""

class Attraction(BaseModel):
    id: str
    name: str
    description: str
    image_url: str | None = None
    rating: float           # 0-5
    price: float            # 门票价格
    duration_minutes: int   # 建议游览时长
    open_time: str          # "09:00"
    close_time: str         # "17:00"
    lat: float
    lng: float
    tags: list[str]         # ["世界遗产", "博物馆"]
    source_urls: list[str]  # 信息来源链接

class Restaurant(BaseModel):
    id: str
    name: str
    cuisine_type: str
    price_per_person: float
    rating: float
    lat: float
    lng: float
    distance_from_route: float  # 偏离路线距离(m)

class Hotel(BaseModel):
    id: str
    name: str
    price_per_night: float
    rating: float
    lat: float
    lng: float
    distance_to_center: float
    amenities: list[str]

class DailyRoute(BaseModel):
    day: int
    date: date
    attractions: list[Attraction]
    lunch: Restaurant | None
    dinner: Restaurant | None
    hotel: Hotel | None
    transport_notes: str

class WeatherReport(BaseModel):
    daily: list[dict]  # [{date, condition, temp_high, temp_low, rain_prob}]
    overall_risk: str  # "low" | "medium" | "high"

class BudgetReport(BaseModel):
    attractions_total: float
    hotels_total: float
    meals_total: float
    transport_total: float
    total: float
    per_person: float
    breakdown: list[dict]  # 逐项明细

class TripPlan(BaseModel):
    id: str
    input: TripInput
    attractions_pool: list[Attraction]  # 候选景点池
    daily_routes: list[DailyRoute]
    weather: WeatherReport
    budget: BudgetReport
    tips: list[str]                     # 小贴士
    created_at: str
```

### 6.5 LangGraph StateGraph 伪代码

```python
# graph/workflow.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated
import operator

class TripState(TypedDict):
    # 输入
    user_input: TripInput
    # 中间结果（各 Agent 输出）
    weather: WeatherReport | None
    attractions: list[Attraction]
    hotels: list[Hotel]
    daily_routes: list[DailyRoute]
    restaurants: list[Restaurant]
    budget: BudgetReport | None
    review: str | None
    # 流程控制
    next_agent: str
    error: str | None
    messages: Annotated[list, operator.add]  # 消息历史

def build_trip_graph() -> StateGraph:
    workflow = StateGraph(TripState)

    # 添加节点
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("attraction_agent", attraction_node)
    workflow.add_node("weather_agent", weather_node)
    workflow.add_node("hotel_agent", hotel_node)
    workflow.add_node("route_agent", route_node)
    workflow.add_node("cuisine_agent", cuisine_node)
    workflow.add_node("budget_agent", budget_node)
    workflow.add_node("critic_agent", critic_node)

    # 入口 → Supervisor
    workflow.set_entry_point("supervisor")

    # Supervisor 路由到合适的 Agent
    workflow.add_conditional_edges(
        "supervisor",
        supervisor_router,  # 返回下一个节点名
        {
            "attraction_agent": "attraction_agent",
            "weather_agent": "weather_agent",
            "hotel_agent": "hotel_agent",
            "route_agent": "route_agent",
            "cuisine_agent": "cuisine_agent",
            "budget_agent": "budget_agent",
            "critic_agent": "critic_agent",
            "finish": END,
        }
    )

    # 各 Agent 执行完后回到 Supervisor
    workflow.add_edge("attraction_agent", "supervisor")
    workflow.add_edge("weather_agent", "supervisor")
    workflow.add_edge("hotel_agent", "supervisor")
    workflow.add_edge("route_agent", "supervisor")
    workflow.add_edge("cuisine_agent", "supervisor")
    workflow.add_edge("budget_agent", "supervisor")

    # Critic 审查后可能回到 route_agent 重排
    workflow.add_conditional_edges(
        "critic_agent",
        critic_router,  # "approved" → END, "revise" → route_agent
        {"route_agent": "route_agent", "finish": END}
    )

    return workflow.compile(checkpointer=MemorySaver())
```

---

## 七、API 设计

### 7.1 核心端点

```yaml
# 行程管理
POST   /api/trips                    # 创建行程（保存用户输入）
GET    /api/trips                    # 获取历史行程列表
GET    /api/trips/:id                # 获取行程详情
DELETE /api/trips/:id                # 删除行程

# 规划生成（核心）
POST   /api/trips/:id/generate       # 启动 Agent 规划（返回 SSE stream）
GET    /api/trips/:id/generate/stream # SSE 连接（获取规划进度和结果）
POST   /api/trips/:id/regenerate     # 重新生成（修改部分参数后）
POST   /api/trips/:id/adjust         # 局部调整（替换某天某个景点）

# 备选方案
POST   /api/trips/:id/alternatives   # 生成备选方案
GET    /api/trips/:id/alternatives   # 获取备选方案列表

# 酒店
GET    /api/trips/:id/hotels         # 获取推荐酒店
POST   /api/trips/:id/hotels/:hotel_id/select  # 选择酒店

# 分享
POST   /api/trips/:id/share          # 生成分享链接
GET    /api/share/:share_id          # 查看分享

# 导出
GET    /api/trips/:id/export/pdf     # 导出 PDF
GET    /api/trips/:id/export/image   # 导出图片

# 工具接口
GET    /api/search/destination       # 目的地模糊搜索（?q=北京）
GET    /api/search/attractions       # 景点搜索
```

### 7.2 SSE 事件流示例

```
event: phase_start
data: {"phase":"gathering","agent":"attraction","message":"正在搜索景点信息..."}

event: agent_progress
data: {"agent":"attraction","message":"已找到 15 个候选景点","percent":60}

event: partial_result
data: {"agent":"attraction","attractions":[...前5个...]}

event: phase_done
data: {"phase":"gathering"}

event: phase_start
data: {"phase":"routing","agent":"route","message":"正在优化第1天行程路线..."}

...

event: plan_ready
data: {"plan":{...完整TripPlan...}}
```

---

## 八、项目初始化与工程化

### 8.1 前端初始化

```bash
# 创建 Vue 3 + TypeScript 项目
npm create vite@latest frontend -- --template vue-ts
cd frontend

# 安装核心依赖
npm install vue-router@4 pinia ofetch
npm install naive-ui             # UI 组件库
npm install @vuemap/vue-amap     # 高德地图
npm install vuedraggable@next    # 拖拽排序
npm install echarts vue-echarts  # 图表
npm install dayjs                # 日期处理

# 开发依赖
npm install -D @types/node eslint prettier
npm install -D @vitejs/plugin-vue
npm install -D unplugin-auto-import unplugin-vue-components
```

### 8.2 后端初始化

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 核心依赖
pip install fastapi uvicorn[standard]
pip install langgraph langchain langchain-anthropic
pip install sqlalchemy[asyncio] asyncpg alembic
pip install redis arq
pip install pydantic pydantic-settings
pip install httpx python-dotenv

# 开发依赖
pip install pytest pytest-asyncio httpx pytest-mock
```

### 8.3 根目录结构

```
stars-trip-planner/
├── DESIGN.md              # 本文档
├── README.md              # 项目说明
├── docker-compose.yml     # 一键启动全部服务
├── .gitignore
│
├── frontend/              # Vue 3 + TypeScript
│   ├── src/
│   │   ├── views/         # 页面
│   │   ├── components/    # 组件
│   │   ├── stores/        # Pinia
│   │   ├── api/           # API 封装
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   └── ...
│
├── backend/               # Python + FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── graph/
│   │   ├── tools/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   └── ...
│
└── docs/                  # 补充文档
    ├── agent-design.md    # Agent 设计细节
    ├── api-spec.md        # API 详细规范
    └── roadmap.md         # 开发路线图
```

---

## 九、开发路线图

### Phase 1：基础设施（1-2 周）

- [ ] 前端项目脚手架搭建（Vue 3 + TS + Vite + Pinia + Router）
- [ ] 后端项目脚手架搭建（FastAPI + SQLAlchemy + Alembic）
- [ ] Docker Compose 开发环境（PostgreSQL + Redis + MinIO）
- [ ] 基础 UI 布局（首页、行程页骨架）
- [ ] 前后端联调打通（CORS、基础 CRUD）

### Phase 2：Agent 核心（2-3 周）

- [ ] 实现各 Worker Agent 的 prompt 和工具调用
- [ ] 构建 LangGraph StateGraph 工作流
- [ ] Supervisor Agent 的任务分解与路由逻辑
- [ ] 工具层：WebSearch、MapAPI、WeatherAPI 封装
- [ ] SSE 进度推送机制
- [ ] Critic Agent 审查与重排循环

### Phase 3：前端核心体验（2 周）

- [ ] 偏好输入向导（SearchBox、PreferenceTags 等）
- [ ] 行程时间线展示（DayTabs、TimelineCard）
- [ ] 地图集成（高德地图 + 路线标注）
- [ ] 预算面板（饼图 + 明细）
- [ ] Agent 进度展示（SSE 实时更新进度条）
- [ ] 拖拽排序调整行程

### Phase 4：增强功能（1-2 周）

- [ ] 多方案生成与对比
- [ ] 局部调整（替换景点/酒店/餐厅）
- [ ] PDF / 图片导出
- [ ] 分享链接功能
- [ ] 历史记录
- [ ] 响应式适配（移动端）

### Phase 5：打磨上线（1 周）

- [ ] 性能优化（Agent 缓存、前端懒加载）
- [ ] 错误处理与降级（API 不可用时的 fallback）
- [ ] SEO / 分享预览优化
- [ ] 部署文档与 CI/CD

---

## 十、关键风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|---------|
| LLM 输出不稳定 | Agent 返回非预期结构 | 严格的 Pydantic 输出校验 + retry 机制 + structured output |
| Web 搜索结果质量差 | 景点信息不准确 | 多源交叉验证 + 缓存高质量结果 + 引入向量检索 |
| API 调用耗时过长 | 用户体验差 | 并行执行独立 Agent + 流式返回中间结果 + 缓存复用 |
| 地图 API 配额不足 | 路线规划功能不可用 | 多地图服务商 fallback + 静态距离估算兜底 |
| 预算计算偏差大 | 用户信任度下降 | 价格数据标记置信度 + 展示信息来源 + "仅供参考"提示 |

---

## 十一、竞争优势

与现有旅行规划产品相比，我们的差异化优势：

| 维度 | 传统攻略网站 | ChatGPT 通用对话 | **我们的智能助手** |
|------|------------|-----------------|-------------------|
| 信息来源 | 单一（UGC 或编辑） | 训练数据（可能过时） | **多源实时搜索 + 交叉验证** |
| 个性化 | 标签筛选（粗粒度） | 仅靠 prompt 描述 | **多 Agent 协同深度推理偏好** |
| 可调整性 | 低（重新搜索） | 低（重新对话） | **高（局部修改自动联动更新）** |
| 透明度 | 无解释 | 无解释 | **每项推荐附带理由和来源链接** |
| 可视化 | 图文列表 | 纯文本 | **地图 + 时间线 + 预算图表** |
| 多方案对比 | 手动 | 手动 | **一键生成多方案，差异高亮** |

---

*本文档为智能旅行助手项目的产品概念与架构设计，后续将持续迭代更新。*
