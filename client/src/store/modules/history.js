const STORAGE_KEY = 'ck-history'
const MAX_HISTORY = 200

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // silently fail
  }
}

const state = {
  historyList: loadFromStorage(),
}

const getters = {
  getHistory: (s) => s.historyList,
  getHistoryById: (s) => (videoId) => s.historyList.find((h) => h.videoId === videoId),
}

const mutations = {
  setHistory(state, history) {
    state.historyList = history
  },
  addToHistory(state, video) {
    const filtered = state.historyList.filter((h) => h.videoId !== video.videoId)
    state.historyList = [video, ...filtered].slice(0, MAX_HISTORY)
    saveToStorage(state.historyList)
  },
  removeFromHistory(state, videoId) {
    state.historyList = state.historyList.filter((h) => h.videoId !== videoId)
    saveToStorage(state.historyList)
  },
  clearHistory(state) {
    state.historyList = []
    saveToStorage([])
  },
}

const actions = {
  initHistory({ commit }) {
    commit('setHistory', loadFromStorage())
  },
  recordWatch({ commit }, video) {
    commit('addToHistory', {
      videoId: video.videoId,
      title: video.title,
      thumbnail_url: video.thumbnail_url,
      person_name: video.person_name,
      person_slug: video.person_slug,
      duration: video.duration,
      watchedAt: Date.now(),
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
