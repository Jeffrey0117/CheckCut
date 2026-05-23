const state = {
  cachedPlayerLocales: {},
}

const getters = {}

const mutations = {
  addPlayerLocaleToCache(state, { locale, data }) {
    state.cachedPlayerLocales[locale] = data
  },
}

const actions = {
  async cachePlayerLocale({ commit }, locale) {
    try {
      const url = `/shaka-player-locales/${locale}.json`
      const response = await fetch(url)
      if (!response.ok) return
      const data = await response.json()
      Object.freeze(data)
      commit('addPlayerLocaleToCache', { locale, data })
    } catch {
      // Gracefully fail if locale file doesn't exist
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
