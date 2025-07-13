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
import notification_create from '@/views/teacher/notification_create.vue' // 新增课程通知创建界面
import notification_detail from '@/views/teacher/notification_detail.vue' // 新增课程通知详情界面
import course_material_list from '@/views/teacher/course_material_list.vue'
import document_list from '@/views/teacher/document_list.vue'
// admin界面
import log_management from '@/views/admin/log_management.vue'
import CreateTeacher from '@/views/admin/CreateTeacher.vue'
import CreateStudent from '@/views/admin/CreateStudent.vue'
import teacher_management from '@/views/admin/teacher_management.vue'
import student_management from '@/views/admin/student_management.vue'
import model_management from '@/views/admin/model_management.vue'


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
        path: '/notification_list/:courseId',
        name: 'notification_list',
        component:notification_list ,
        meta: { requiresAuth: true }
    },
   {
        path: '/notification_create/:courseId',
        name: 'notification_create',
        component:notification_create ,
        meta: { requiresAuth: true }
    },
     {
        path: '/notification_detail/:courseId/:notificationId',
        name: 'notification_detail',
        component: notification_detail,
        meta: { requiresAuth: true }
    },

    // 添加课程资料列表路由
    {
        path: '/teacher/course/:courseId/materials',
        name: 'course_material_list',
        component: course_material_list,
        meta: { requiresAuth: true, role: 'teacher' }
    },
    {
        path: '/teacher/document_list',
        name: 'document_list',
        component:document_list,
        meta: { requiresAuth: true, role: 'teacher' }
    },






    // 管理员端路由
    {
        path: '/admin/log_management',
        name: 'log_management',
        component: log_management,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/create_teacher',
        name: 'CreateTeacher',
        component: CreateTeacher,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/create_student',
        name: 'CreateStudent',
        component: CreateStudent,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/student_management',
        name: 'student_management',
        component: student_management,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/teacher_management',
        name: 'teacher_management',
        component: teacher_management,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/model_management',
        name: 'model_management',
        component: model_management,
        meta: { requiresAuth: true, role: 'admin' }
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router