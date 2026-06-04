const STORAGE_KEY = 'ck-settings'

// Dedicated key for the light/dark base theme so it can be read by the
// inline loader script in index.html before the app (and ck-settings) loads.
const THEME_KEY = 'checkcut-theme'

function loadSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // silently fail
  }
}

// Read the persisted theme. First-time visitors (no saved value) default
// to LIGHT. Only 'light' | 'dark' are valid base themes for the toggle.
export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // silently fail
  }
}

// Apply the base theme class to <body> and keep the loader/root attribute
// (used by index.html) in sync. Centralized so App.vue + toggle share it.
// The brand main/sec color classes are appended so --primary-color (red
// accent) and --accent-color resolve from themes.css alongside the base theme.
export function applyTheme(theme, mainColor = 'Red', secColor = 'Blue') {
  const normalized = theme === 'dark' ? 'dark' : 'light'
  document.body.className = `${normalized} main${mainColor} sec${secColor}`
  document.documentElement.setAttribute('data-ck-theme', normalized)
  return normalized
}

const state = {
  baseTheme: loadTheme(),
  mainColor: 'Red',
  secColor: 'Blue',
  defaultVolume: 0.3,
  defaultPlayback: 1,
  defaultQuality: '720',
  autoplayVideos: true,
  rememberHistory: true,
  landingPage: '/',
  hideLabelsSideBar: false,
}

const getters = {}
const mutations = {}
const actions = {}

// Auto-generate getters, mutations, and actions for each setting
for (const key of Object.keys(state)) {
  const capitalized = key.charAt(0).toUpperCase() + key.slice(1)

  getters[`get${capitalized}`] = (s) => s[key]

  mutations[`set${capitalized}`] = (s, value) => {
    s[key] = value
  }

  actions[`update${capitalized}`] = ({ commit }, value) => {
    commit(`set${capitalized}`, value)
    const all = loadSettings()
    saveSettings({ ...all, [key]: value })
  }
}

// Override the auto-generated baseTheme action: the base theme persists to
// its own `checkcut-theme` key (so the loader can read it) and is applied to
// the DOM immediately. It deliberately does NOT touch `ck-settings`.
actions.updateBaseTheme = ({ commit, state: s }, value) => {
  const normalized = value === 'dark' ? 'dark' : 'light'
  commit('setBaseTheme', normalized)
  saveTheme(normalized)
  applyTheme(normalized, s.mainColor, s.secColor)
}

// Flip light <-> dark, persist and apply.
actions.toggleTheme = ({ dispatch, state: s }) => {
  const next = s.baseTheme === 'dark' ? 'light' : 'dark'
  dispatch('updateBaseTheme', next)
}

actions.grabUserSettings = ({ commit }) => {
  const saved = loadSettings()
  for (const [key, value] of Object.entries(saved)) {
    // baseTheme lives in its own storage key, never in ck-settings
    if (key === 'baseTheme') continue
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
    const mutationName = `set${capitalized}`
    if (mutations[mutationName]) {
      commit(mutationName, value)
    }
  }
  // Ensure the store reflects the persisted theme (default light).
  commit('setBaseTheme', loadTheme())
}

export default {
  state,
  getters,
  mutations,
  actions,
}
