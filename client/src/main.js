import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'
import { loadTheme, applyTheme } from './store/modules/settings.js'
import './themes.css'
import './App.css'
import './styles/tailwind.css'

// Apply the persisted theme (default LIGHT) before mount so there is no flash.
applyTheme(loadTheme())

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
