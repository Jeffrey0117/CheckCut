const STORAGE_KEY = 'ck-playlists'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(playlists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
  } catch {
    // silently fail
  }
}

const state = {
  playlists: loadFromStorage(),
}

const getters = {
  getPlaylists: (s) => s.playlists,
}

const mutations = {
  setPlaylists(state, playlists) {
    state.playlists = playlists
  },
}

const actions = {
  initPlaylists({ commit }) {
    commit('setPlaylists', loadFromStorage())
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
