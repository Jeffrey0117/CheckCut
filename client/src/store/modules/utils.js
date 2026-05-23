const state = {
  isSideNavOpen: false,
  outlinesHidden: true,
  showProgressBar: false,
  progressBarPercentage: 0,
  appTitle: 'CheckCut',
  openPrompts: new Set(),
}

const getters = {
  getIsSideNavOpen: (s) => s.isSideNavOpen,
  getOutlinesHidden: (s) => s.outlinesHidden,
  getShowProgressBar: (s) => s.showProgressBar,
  getProgressBarPercentage: (s) => s.progressBarPercentage,
  getAppTitle: (s) => s.appTitle,
  isAnyPromptOpen: (s) => s.openPrompts.size > 0,
}

const mutations = {
  toggleSideNav(state) {
    state.isSideNavOpen = !state.isSideNavOpen
  },
  setIsSideNavOpen(state, value) {
    state.isSideNavOpen = value
  },
  setOutlinesHidden(state, value) {
    state.outlinesHidden = value
  },
  setShowProgressBar(state, value) {
    state.showProgressBar = value
  },
  setProgressBarPercentage(state, value) {
    state.progressBarPercentage = value
  },
  setAppTitle(state, value) {
    state.appTitle = value
    document.title = value
  },
  addOpenPrompt(state, id) {
    state.openPrompts.add(id)
  },
  removeOpenPrompt(state, id) {
    state.openPrompts.delete(id)
  },
}

const actions = {
  showOutlines({ commit }) {
    commit('setOutlinesHidden', false)
  },
  hideOutlines({ commit }) {
    commit('setOutlinesHidden', true)
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
