import {createRouter,createWebHistory, }from 'vue-router'
import type{RouteRecordRaw} from 'vue-router'
import login from '@/views/login.vue'
import home_student from '@/views/home_student.vue'

const routes: Array<RouteRecordRaw> = [

  {
      path: '/login',
      name: 'login',
      component: login,
  },
  {
    path:'/home_student',
    name:'home_student',
    component:home_student,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router