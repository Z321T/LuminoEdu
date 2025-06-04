import {createRouter,createWebHistory, }from 'vue-router'
import type{RouteRecordRaw} from 'vue-router'
import login from '@/views/login.vue'
import home_student from '@/views/home_student.vue'
import home_teacher from '@/views/home_teacher.vue' // 新增导入
import exercise_generate from '@/views/exercise_gernerate.vue' // 添加习题生成页面导入

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
    path: '/home_teacher', // 新增教师主页路由
    name: 'home_teacher',
    component: home_teacher,
  },
  {
    path: '/exercise_generate', // 添加习题生成页面路由
    name: 'exercise_generate',
    component: exercise_generate,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router