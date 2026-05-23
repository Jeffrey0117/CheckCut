const STORAGE_KEY = 'ck-settings'

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

const state = {
  baseTheme: 'system',
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

actions.grabUserSettings = ({ commit }) => {
  const saved = loadSettings()
  for (const [key, value] of Object.entries(saved)) {
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
    const mutationName = `set${capitalized}`
    if (mutations[mutationName]) {
      commit(mutationName, value)
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions,
}
