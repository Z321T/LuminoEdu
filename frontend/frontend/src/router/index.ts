import {createRouter,createWebHistory, }from 'vue-router'
import type{RouteRecordRaw} from 'vue-router'
import login from '@/views/login.vue'
import home_student from '@/views/home_student.vue'
import home_teacher from '@/views/home_teacher.vue'
import exercise_generate from '@/views/exercise_gernerate.vue'
import exercise_history from '@/views/exercise_history.vue' // 新增导入
import admin_home from '@/views/admin_home.vue'
import CreateTeacher from '@/views/CreateTeacher.vue'
import CreateStudent from '@/views/CreateStudent.vue'
import teacher_management  from '@/views/teacher_management.vue'
import student_management from '@/views/student_management.vue'
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
  {
    path: '/admin_home', 
    name: 'admin_home',
    component: admin_home,
  },
  {
    path: '/admin/create-teacher',
    name: 'CreateTeacher',
    component: CreateTeacher,
    meta: { requiresAuth: true, role: 'admin' }
  },

 {
    path: '/admin/create-student',
    name: 'CreateStudent',
    component: CreateStudent,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/student-management',
    name: 'student_management',
    component: student_management,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/teacher-management',
    name: 'teacher_management',
    component: teacher_management,
    meta: { requiresAuth: true, role: 'admin' }
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router