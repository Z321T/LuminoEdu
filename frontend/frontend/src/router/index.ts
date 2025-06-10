import {createRouter,createWebHistory, }from 'vue-router'
import type{RouteRecordRaw} from 'vue-router'
import login from '@/views/login.vue'
import home_student from '@/views/home_student.vue'
import home_teacher from '@/views/home_teacher.vue'
import exercise_generate from '@/views/exercise_gernerate.vue'
import exercise_history from '@/views/exercise_history.vue' // 新增导入

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
  {
    path: '/home_teacher',
    name: 'home_teacher',
    component: home_teacher,
  },
  {
    path: '/exercise_generate',
    name: 'exercise_generate',
    component: exercise_generate,
  },
  {
    path: '/exercise_history', // 新增习题历史页面路由
    name: 'exercise_history',
    component: exercise_history,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router