const STORAGE_KEY = 'ck-favorites'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // silently fail
  }
}

const state = {
  favorites: loadFromStorage(),
}

const getters = {
  getFavorites: (s) => s.favorites,
  isFavorite: (s) => (videoId) => s.favorites.some((f) => f.videoId === videoId),
}

const mutations = {
  setFavorites(state, favorites) {
    state.favorites = favorites
  },
  addFavorite(state, video) {
    state.favorites = [video, ...state.favorites]
    saveToStorage(state.favorites)
  },
  removeFavorite(state, videoId) {
    state.favorites = state.favorites.filter((f) => f.videoId !== videoId)
    saveToStorage(state.favorites)
  },
}

const actions = {
  initFavorites({ commit }) {
    commit('setFavorites', loadFromStorage())
  },
  toggleFavorite({ commit, getters }, video) {
    if (getters.isFavorite(video.videoId)) {
      commit('removeFavorite', video.videoId)
    } else {
      commit('addFavorite', {
        videoId: video.videoId,
        title: video.title,
        thumbnail_url: video.thumbnail_url,
        person_name: video.person_name,
        person_slug: video.person_slug,
        duration: video.duration,
        addedAt: Date.now(),
      })
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
