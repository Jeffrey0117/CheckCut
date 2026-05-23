import { getPersons, getPerson } from '../../helpers/api/local.js'

const state = {
  personList: [],
  currentPerson: null,
  loading: false,
  error: null,
}

const getters = {
  personList: s => s.personList,
  currentPerson: s => s.currentPerson,
  isLoading: s => s.loading,
}

const mutations = {
  SET_PERSONS(state, persons) { state.personList = persons },
  SET_CURRENT_PERSON(state, person) { state.currentPerson = person },
  SET_LOADING(state, val) { state.loading = val },
  SET_ERROR(state, err) { state.error = err },
}

const actions = {
  async fetchPersons({ commit }) {
    commit('SET_LOADING', true)
    try {
      const data = await getPersons()
      commit('SET_PERSONS', data.persons || [])
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchPerson({ commit }, slug) {
    commit('SET_LOADING', true)
    try {
      const data = await getPerson(slug)
      commit('SET_CURRENT_PERSON', data.person || null)
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
