import {createRouter,createWebHistory, }from 'vue-router'
import type{RouteRecordRaw} from 'vue-router'
import login from '@/views/Login/login.vue'
import home_student from '@/views/home_student.vue'
// 教师界面
import home_teacher from '@/views/teacher/home_teacher.vue'
import exercise_generate from '@/views/teacher/exercise_gernerate.vue'
import exercise_history from '@/views/teacher/exercise_history.vue'
import PPT_generate from '@/views/teacher/PPT_generate.vue'
import PPT_outline from '@/views/teacher/PPT_outline.vue'
import PPT_files from '@/views/teacher/PPT_files.vue' // 新增PPT文件管理界面
import course_list from '@/views/teacher/course_list.vue'
import course_create from '@/views/teacher/course_create.vue'
import course_addstudent from '@/views/teacher/course_addstudent.vue' // 新增课程添加学生界面
import course_detail from '@/views/teacher/course_detail.vue' // 新增课程详情界面
import notification_list from '@/views/teacher/notification_list.vue' // 新增课程通知列表界面
// admin界面
import log_management from '@/views/admin/log_management.vue'
import CreateTeacher from '@/views/admin/CreateTeacher.vue'
import CreateStudent from '@/views/admin/CreateStudent.vue'
import teacher_management from '@/views/admin/teacher_management.vue'
import student_management from '@/views/admin/student_management.vue'


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: login,
    },
    // 学生端路由
    {
        path: '/home_student',
        name: 'home_student',
        component: home_student,
        meta: { requiresAuth: true, role: 'student' }
    },
    // 教师端路由
    {
        path: '/home_teacher',
        name: 'home_teacher',
        component: home_teacher,
        meta: { requiresAuth: true, role: 'teacher' }
    },
    {
        path: '/exercise_generate',
        name: 'exercise_generate',
        component: exercise_generate,
        meta: { requiresAuth: true, role: 'teacher' }
    },
    {
        path: '/exercise_history',
        name: 'exercise_history',
        component: exercise_history,
        meta: { requiresAuth: true }
    },
    {
        path: '/PPT_generate',
        name: 'PPT_generate',
        component: PPT_generate,
        meta: { requiresAuth: true }
    },
     {
        path: '/PPT_outline',
        name: 'PPT_outline',
        component: PPT_outline,
        meta: { requiresAuth: true }
    },
    {
        path: '/PPT_files',
        name: 'PPTFiles',
        component: PPT_files,
        meta: { requiresAuth: true }
    },
    {
        path: '/course_list',
        name: 'course_list',
        component: course_list,
        meta: { requiresAuth: true }
    },
     {
        path: '/course_create',
        name: 'course_create',
        component: course_create,
        meta: { requiresAuth: true }
    },
     {
        path: '/course_create',
        name: 'course_create',
        component: course_create,
        meta: { requiresAuth: true }
    },
    {
        path: '/course_addstudent/:id',
        name: 'course_addstudent',
        component: course_addstudent,
        meta: { requiresAuth: true }
    },
     {
        path: '/course_detail/:courseId',
        name: 'course_detail',
        component: course_detail,
        meta: { requiresAuth: true }
    },
      {
        path: '/notification_list',
        name: 'course_detail',
        component: course_detail,
        meta: { requiresAuth: true }
    },




    // 管理员端路由
    {
        path: '/admin/log_management',
        name: 'log_management',
        component: log_management,
        meta: { requiresAuth: true, role: 'admin' }
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