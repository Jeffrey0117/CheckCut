const STORAGE_KEY = 'ck-user'

function loadUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // silently fail
  }
}

const state = {
  currentUser: loadUser(),
  isLoggedIn: !!loadUser(),
}

const getters = {
  getCurrentUser: (s) => s.currentUser,
  getIsLoggedIn: (s) => s.isLoggedIn,
  getIsAdmin: (s) => s.currentUser?.role === 'admin',
}

const mutations = {
  setCurrentUser(state, user) {
    state.currentUser = user
    state.isLoggedIn = !!user
    saveUser(user)
  },
  clearUser(state) {
    state.currentUser = null
    state.isLoggedIn = false
    saveUser(null)
  },
}

const actions = {
  initializeUser({ commit }) {
    const user = loadUser()
    if (user) {
      commit('setCurrentUser', user)
    }
  },
  async login({ commit }, credentials) {
    const res = await fetch('/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    commit('setCurrentUser', data.user)
    return data.user
  },
  async register({ commit }, userData) {
    const res = await fetch('/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    commit('setCurrentUser', data.user)
    return data.user
  },
  async logout({ commit }) {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    commit('clearUser')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
