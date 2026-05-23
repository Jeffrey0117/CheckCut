import { getVideos, getVideo, getFeatured, search as searchVideos } from '../../helpers/api/local.js'

const state = {
  videoList: [],
  currentVideo: null,
  featuredData: null,
  searchResults: [],
  loading: false,
  error: null,
}

const getters = {
  videoList: s => s.videoList,
  currentVideo: s => s.currentVideo,
  featuredData: s => s.featuredData,
  searchResults: s => s.searchResults,
  isLoading: s => s.loading,
}

const mutations = {
  SET_VIDEOS(state, videos) { state.videoList = videos },
  SET_CURRENT_VIDEO(state, video) { state.currentVideo = video },
  SET_FEATURED(state, data) { state.featuredData = data },
  SET_SEARCH_RESULTS(state, results) { state.searchResults = results },
  SET_LOADING(state, val) { state.loading = val },
  SET_ERROR(state, err) { state.error = err },
}

const actions = {
  async fetchVideos({ commit }, params = {}) {
    commit('SET_LOADING', true)
    try {
      const data = await getVideos(params)
      commit('SET_VIDEOS', data.videos || [])
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchVideo({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const data = await getVideo(id)
      commit('SET_CURRENT_VIDEO', data.video || null)
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchFeatured({ commit }) {
    commit('SET_LOADING', true)
    try {
      const data = await getFeatured()
      commit('SET_FEATURED', data)
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async searchVideos({ commit }, query) {
    commit('SET_LOADING', true)
    try {
      const data = await searchVideos(query)
      commit('SET_SEARCH_RESULTS', data.videos || [])
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
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
