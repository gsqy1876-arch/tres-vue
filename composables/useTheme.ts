import { ref, watch, onMounted, computed } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'tres-vue-theme'
const isDark = ref<boolean>(false)

export const useTheme = () => {
    // 初始化主题
    const initTheme = () => {
        if (import.meta.client) {
            const stored = localStorage.getItem(STORAGE_KEY) as Theme | null

            if (stored) {
                isDark.value = stored === 'dark'
            } else {
                // 检测系统主题偏好
                isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
            }

            applyTheme()
        }
    }

    // 应用主题到 DOM
    const applyTheme = () => {
        if (import.meta.client) {
            if (isDark.value) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }

    // 切换主题
    const toggleTheme = () => {
        isDark.value = !isDark.value
    }

    // 设置特定主题
    const setTheme = (theme: Theme) => {
        isDark.value = theme === 'dark'
    }

    // 监听主题变化并持久化
    watch(isDark, (newValue) => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light')
            applyTheme()
        }
    })

    return {
        isDark,
        theme: computed(() => isDark.value ? 'dark' as Theme : 'light' as Theme),
        toggleTheme,
        setTheme,
        initTheme
    }
}
