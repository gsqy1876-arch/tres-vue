<script setup lang="ts">
import { BackSide, TextureLoader } from 'three'
import { ref, shallowRef, computed, watch, onMounted } from 'vue'

/**
 * 全景查看器组件
 * 封装了 TresCanvas、TresPerspectiveCamera、OrbitControls、TresAmbientLight
 * 支持可点击的锚点标记
 */

// 锚点接口定义
export interface AnchorPoint {
  id: string
  position: [number, number, number]
  label?: string
  color?: string
}

// Props 配置接口
export interface PanoramaViewerProps {
  /** 全景图片路径 */
  imageSrc?: string
  /** 相机初始位置 */
  cameraPosition?: [number, number, number]
  /** 默认视野角度 */
  defaultFov?: number
  /** 最小视野角度 */
  minFov?: number
  /** 最大视野角度 */
  maxFov?: number
  /** 缩放速度 */
  zoomSpeed?: number
  /** 是否启用缩放 */
  enableZoom?: boolean
  /** 是否启用平移 */
  enablePan?: boolean
  /** 是否只允许水平旋转 */
  horizontalOnly?: boolean
  /** 环境光强度 */
  lightIntensity?: number
  /** 球体半径 */
  sphereRadius?: number
  /** 球体分段数 */
  sphereSegments?: number
  /** 锚点数量 */
  anchorCount?: number
  /** 锚点距离相机的距离 */
  anchorDistance?: number
  /** 是否显示锚点 */
  showAnchors?: boolean
}

// 定义 props 和默认值
const props = withDefaults(defineProps<PanoramaViewerProps>(), {
  imageSrc: '/images/panorama.png',
  cameraPosition: () => [0, 0, 0.1] as [number, number, number],
  defaultFov: 105,
  minFov: 90,
  maxFov: 105,
  zoomSpeed: 0.05,
  enableZoom: true,
  enablePan: false,
  horizontalOnly: true,
  lightIntensity: 1,
  sphereRadius: 500,
  sphereSegments: 64,
  anchorCount: 2,
  anchorDistance: 100,
  showAnchors: true
})

// 定义 emits
const emit = defineEmits<{
  'fov-change': [fov: number]
  'texture-loaded': []
  'texture-error': [error: Error]
  'anchor-click': [anchor: AnchorPoint, worldPosition: { x: number; y: number; z: number }]
}>()

// 纹理状态
const texture = shallowRef()
const isLoading = ref(true)
const hasError = ref(false)

// 当前 FOV
const fov = ref(props.defaultFov)

// 锚点数据
const anchors = ref<AnchorPoint[]>([])

// 生成球面上的随机点
const generateRandomSpherePoint = (radius: number): [number, number, number] => {
  // 使用球面坐标系生成均匀分布的随机点
  const theta = Math.random() * 2 * Math.PI // 水平角度 0-360度
  const phi = Math.PI / 2 // 固定在水平面上（因为只允许水平旋转）
  
  const x = radius * Math.sin(phi) * Math.cos(theta)
  const y = 0 // 保持在水平面
  const z = radius * Math.sin(phi) * Math.sin(theta)
  
  return [x, y, z]
}

// 生成随机锚点
const generateAnchors = () => {
  const newAnchors: AnchorPoint[] = []
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  
  for (let i = 0; i < props.anchorCount; i++) {
    const position = generateRandomSpherePoint(props.anchorDistance)
    newAnchors.push({
      id: `anchor-${i}`,
      position,
      label: `锚点 ${i + 1}`,
      color: colors[i % colors.length]
    })
  }
  
  anchors.value = newAnchors
}

// 处理锚点点击
const handleAnchorClick = (anchor: AnchorPoint) => {
  const worldPosition = {
    x: anchor.position[0],
    y: anchor.position[1],
    z: anchor.position[2]
  }
  
  // 计算球面坐标（角度）
  const sphericalCoords = {
    theta: Math.atan2(anchor.position[2], anchor.position[0]) * (180 / Math.PI),
    phi: Math.acos(anchor.position[1] / props.anchorDistance) * (180 / Math.PI)
  }
  
  console.log(`锚点 ${anchor.id} 被点击:`, {
    label: anchor.label,
    worldPosition,
    sphericalCoords
  })
  
  emit('anchor-click', anchor, worldPosition)
}

// 计算 OrbitControls 的极角限制
const polarAngleLimits = computed(() => {
  if (props.horizontalOnly) {
    return {
      min: Math.PI / 2,
      max: Math.PI / 2
    }
  }
  return {
    min: 0,
    max: Math.PI
  }
})

// 加载纹理 - 只在客户端执行
const loadTexture = () => {
  if (!import.meta.client) return
  
  isLoading.value = true
  hasError.value = false
  
  const loader = new TextureLoader()
  loader.load(
    props.imageSrc,
    (loadedTexture) => {
      texture.value = loadedTexture
      isLoading.value = false
      emit('texture-loaded')
    },
    undefined,
    (error) => {
      isLoading.value = false
      hasError.value = true
      emit('texture-error', error as Error)
      console.error('Failed to load panorama texture:', error)
    }
  )
}

// 处理滚轮缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const delta = event.deltaY * props.zoomSpeed
  const newFov = fov.value + delta
  
  fov.value = Math.max(
    props.minFov,
    Math.min(props.maxFov, newFov)
  )
  
  emit('fov-change', fov.value)
}

// 监听图片源变化，重新加载
watch(() => props.imageSrc, () => {
  loadTexture()
})

// 监听锚点数量变化，重新生成
watch(() => props.anchorCount, () => {
  generateAnchors()
})

// 在客户端挂载后加载纹理和生成锚点
onMounted(() => {
  loadTexture()
  generateAnchors()
})

// 暴露方法给父组件
defineExpose({
  fov,
  isLoading,
  hasError,
  anchors,
  reload: loadTexture,
  regenerateAnchors: generateAnchors
})
</script>

<template>
  <div class="panorama-container" @wheel.prevent="handleWheel">
    <ClientOnly>
      <TresCanvas window-size>
        <!-- 透视相机 -->
        <TresPerspectiveCamera
          :position="props.cameraPosition"
          :fov="fov"
        />
        
        <!-- 轨道控制器 -->
        <OrbitControls
          :enable-zoom="props.enableZoom"
          :enable-pan="props.enablePan"
          :min-polar-angle="polarAngleLimits.min"
          :max-polar-angle="polarAngleLimits.max"
        />
        
        <!-- 全景球体 -->
        <TresMesh v-if="texture">
          <TresSphereGeometry :args="[props.sphereRadius, props.sphereSegments, props.sphereSegments / 2]" />
          <TresMeshBasicMaterial
            :map="texture"
            :side="BackSide"
          />
        </TresMesh>
        
        <!-- 锚点标记 -->
        <template v-if="showAnchors">
          <TresMesh
            v-for="anchor in anchors"
            :key="anchor.id"
            :position="anchor.position"
            @click="() => handleAnchorClick(anchor)"
          >
            <!-- 锚点球体 -->
            <TresSphereGeometry :args="[5, 32, 32]" />
            <TresMeshBasicMaterial :color="anchor.color" />
          </TresMesh>
        </template>
        
        <!-- 环境光 -->
        <TresAmbientLight :intensity="props.lightIntensity" />
      </TresCanvas>
      
      <!-- 加载指示器插槽 -->
      <template #fallback>
        <slot name="loading">
          <div class="loading-indicator">
            <span>加载中...</span>
          </div>
        </slot>
      </template>
    </ClientOnly>
    
    <!-- 加载中状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <slot name="loading">
        <div class="loading-spinner"></div>
      </slot>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-overlay">
      <slot name="error">
        <div class="error-message">
          <p>无法加载全景图片</p>
          <button @click="loadTexture">重试</button>
        </div>
      </slot>
    </div>
    
    <!-- 锚点信息面板 -->
    <div v-if="showAnchors && anchors.length > 0" class="anchor-info-panel">
      <h3>锚点列表</h3>
      <ul>
        <li v-for="anchor in anchors" :key="anchor.id">
          <span class="anchor-dot" :style="{ background: anchor.color }"></span>
          {{ anchor.label }}
          <small>({{ anchor.position[0].toFixed(1) }}, {{ anchor.position[1].toFixed(1) }}, {{ anchor.position[2].toFixed(1) }})</small>
        </li>
      </ul>
    </div>
    
    <!-- 默认插槽：用于叠加 UI -->
    <slot></slot>
  </div>
</template>

<style scoped>
.panorama-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-indicator,
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 5;
}

.error-message {
  text-align: center;
}

.error-message button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #00dc82;
  color: #020420;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.error-message button:hover {
  background: #00c774;
}

/* 锚点信息面板 */
.anchor-info-panel {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  z-index: 10;
  pointer-events: auto;
}

.anchor-info-panel h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.anchor-info-panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.anchor-info-panel li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.anchor-info-panel small {
  opacity: 0.7;
  font-family: monospace;
}

.anchor-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
