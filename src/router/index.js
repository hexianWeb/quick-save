import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    /* {
      path: '/login',
      component: () => import('@/views/login/index'),
      hidden: true
    }, */
    {
      path: '/model_v2',
      component: () => import('@/views/model_v2/index')
    },
    {
      path: '/eld',
      component: () => import('@/views/device/index')
    }
  ]
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
