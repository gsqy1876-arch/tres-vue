<script setup lang="ts">
/**
 * 3D 全景预览页面
 * 使用封装好的 PanoramaViewer 组件
 */

// Page metadata
useHead({
  title: '3D Panorama - TresJS',
  meta: [
    { name: 'description', content: '3D Panorama Viewer' }
  ]
})

// 全景查看器配置
const viewerConfig = {
  imageSrc: '/images/panorama.png',
  defaultFov: 105,
  minFov: 90,
  maxFov: 105,
  horizontalOnly: true,
  lightIntensity: 1,
  anchorCount: 2,
  showAnchors: true
}

// 事件处理
const handleFovChange = (fov: number) => {
  console.log('FOV changed:', fov)
}

const handleTextureLoaded = () => {
  console.log('Panorama texture loaded successfully')
}

const handleTextureError = (error: Error) => {
  console.error('Failed to load panorama:', error)
}

// 锚点点击事件处理
const handleAnchorClick = (anchor: any, worldPosition: { x: number; y: number; z: number }) => {
  console.log('=== 锚点被点击 ===')
  console.log('锚点信息:', anchor)
  console.log('世界坐标:', worldPosition)
  
  // 可以在这里添加自定义逻辑，例如：
  // - 显示详情弹窗
  // - 跳转到其他页面
  // - 触发动画效果
  alert(`锚点 "${anchor.label}" 被点击!\n\n坐标信息:\nX: ${worldPosition.x.toFixed(2)}\nY: ${worldPosition.y.toFixed(2)}\nZ: ${worldPosition.z.toFixed(2)}`)
}
</script>

<template>
  <div class="panorama-page">
    <PanoramaViewer
      :image-src="viewerConfig.imageSrc"
      :default-fov="viewerConfig.defaultFov"
      :min-fov="viewerConfig.minFov"
      :max-fov="viewerConfig.maxFov"
      :horizontal-only="viewerConfig.horizontalOnly"
      :light-intensity="viewerConfig.lightIntensity"
      :anchor-count="viewerConfig.anchorCount"
      :show-anchors="viewerConfig.showAnchors"
      @fov-change="handleFovChange"
      @texture-loaded="handleTextureLoaded"
      @texture-error="handleTextureError"
      @anchor-click="handleAnchorClick"
    >
      <!-- UI 覆盖层 -->
      <div class="ui-overlay">
        <ThemeToggle class="theme-toggle-btn" />
        
        <div class="info-panel">
          <h1 class="title">全景预览</h1>
          <p class="hint">鼠标拖动旋转，滚轮缩放</p>
          <NuxtLink to="/" class="back-button">
            返回首页
          </NuxtLink>
        </div>
      </div>
    </PanoramaViewer>
  </div>
</template>

<style scoped>
.panorama-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.ui-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.theme-toggle-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  pointer-events: auto;
}

.info-panel {
  position: absolute;
  top: 2rem;
  left: 2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.hint {
  margin: 0.5rem 0 1.5rem;
  font-size: 1rem;
  opacity: 0.8;
}

.back-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-button:active {
  transform: translateY(0);
}
</style>
