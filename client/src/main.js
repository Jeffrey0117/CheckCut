import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'
import { loadTheme, applyTheme } from './store/modules/settings.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './themes.css'
import './App.css'
import './styles/tailwind.css'

// Register all solid FontAwesome icons globally.
library.add(fas)

// Apply the persisted theme (default LIGHT) before mount so there is no flash.
applyTheme(loadTheme())

const app = createApp(App)
app.use(router)
app.use(store)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
