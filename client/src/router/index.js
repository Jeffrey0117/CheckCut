import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store/index.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { title: 'CheckCut' },
      component: () => import('../views/Home/Home.vue'),
    },
    {
      path: '/watch/:id',
      name: 'watch',
      meta: { title: 'Watch' },
      component: () => import('../views/Watch/Watch.vue'),
    },
    {
      path: '/person/:slug',
      name: 'person',
      meta: { title: 'Person' },
      component: () => import('../views/Person/Person.vue'),
    },
    {
      path: '/category/:name',
      name: 'category',
      meta: { title: 'Category' },
      component: () => import('../views/Category/Category.vue'),
    },
    {
      path: '/search',
      name: 'search',
      meta: { title: 'Search' },
      component: () => import('../views/Search/Search.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      meta: { title: 'Favorites' },
      component: () => import('../views/Favorites/Favorites.vue'),
    },
    {
      path: '/history',
      name: 'history',
      meta: { title: 'History' },
      component: () => import('../views/History/History.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: 'Login' },
      component: () => import('../views/Login/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { title: 'Register' },
      component: () => import('../views/Register/Register.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      meta: { title: 'Admin', requiresAuth: true },
      component: () => import('../views/Admin/AdminDashboard.vue'),
    },
    {
      path: '/admin/videos',
      name: 'adminVideos',
      meta: { title: 'Manage Videos', requiresAuth: true },
      component: () => import('../views/Admin/AdminVideos.vue'),
    },
    {
      path: '/admin/videos/new',
      name: 'adminVideoNew',
      meta: { title: 'New Video', requiresAuth: true },
      component: () => import('../views/Admin/AdminVideoEdit.vue'),
    },
    {
      path: '/admin/videos/:id',
      name: 'adminVideoEdit',
      meta: { title: 'Edit Video', requiresAuth: true },
      component: () => import('../views/Admin/AdminVideoEdit.vue'),
    },
    {
      path: '/admin/studio',
      name: 'adminStudio',
      meta: { title: '影片工作室', requiresAuth: true },
      component: () => import('../views/Studio/Studio.vue'),
    },
    {
      path: '/admin/persons',
      name: 'adminPersons',
      meta: { title: 'Manage Persons', requiresAuth: true },
      component: () => import('../views/Admin/AdminPersons.vue'),
    },
    {
      path: '/admin/persons/new',
      name: 'adminPersonNew',
      meta: { title: 'New Person', requiresAuth: true },
      component: () => import('../views/Admin/AdminPersonEdit.vue'),
    },
    {
      path: '/admin/persons/:id',
      name: 'adminPersonEdit',
      meta: { title: 'Edit Person', requiresAuth: true },
      component: () => import('../views/Admin/AdminPersonEdit.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
})

// Auth guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isLoggedIn = store.getters['user/getIsLoggedIn']
    if (!isLoggedIn) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
