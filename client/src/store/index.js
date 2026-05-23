import { createStore } from 'vuex'
import settings from './modules/settings'
import player from './modules/player'
import favorites from './modules/favorites'
import user from './modules/user'
import history from './modules/history'
import playlists from './modules/playlists'
import utils from './modules/utils'
import videos from './modules/videos'
import persons from './modules/persons'

export default createStore({
  modules: {
    settings,
    player,
    favorites,
    user,
    history,
    playlists,
    utils,
    videos,
    persons,
  },
  strict: false,
})
