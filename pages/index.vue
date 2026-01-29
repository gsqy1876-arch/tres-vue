<script setup lang="ts">
// Page metadata
useHead({
  title: 'TresJS Nuxt - {{projectName}}',
  meta: [
    { name: 'description', content: 'A TresJS Nuxt application' }
  ]
})
</script>

<template>

  <div class="h-screen w-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <!-- <ThemeToggle class="absolute top-8 right-8 z-50" />
    
    <h1 class="text-3xl font-bold text-gray-900 dark:text-green-400 transition-colors duration-300">
      Tailwind + Nuxt 安装成功!
    </h1> -->
    <NuxtLink to="/3dView" class="text-3xl font-bold text-gray-900 dark:text-green-400 transition-colors duration-300">
      entry
    </NuxtLink>
  </div>
</template>