import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/components/Register'
import Login from '@/components/Login'
import TasksReport from '@/components/TasksReport'
import Main from '@/components/Main'
import DashboardSettings from '@/components/sliders/DashboardSettings'
import RecruitmentSettings from '@/components/sliders/RecruitmentSettings'
import VendorsSettings from '@/components/sliders/VendorsSettings'
import LanguagesSettings from '@/components/sliders/LanguagesSettings'
import ClientsSettings from '@/components/sliders/ClientsSettings'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import FinanceSettings from '@/components/sliders/FinanceSettings'
import ReportsSettings from '@/components/sliders/ReportsSettings'
import Clientrequest from '@/components/request-forms/Clientrequest'
import Accountinfo from '@/components/account/Accountinfo'
import Projects from '@/components/pmArea/Projects'
import CreateProject from '@/components/pmArea/CreateProject'
import { store } from '../vuex/store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/tasks-report',
      name: 'tasks-report',
      component: TasksReport
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'main',
      redirect: '/dashboard',
      component: Main,
      props: true,
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem("token");
        if(token) {
            next()  
          } else {
            next('/login')
          }
      },
      children: [
        {
          path: 'account-info',
          name: 'account-info',
          component: Accountinfo
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          props: true,
          component: DashboardSettings
        },
        {
          path: 'recruitment',
          name: 'recruitment',
          component: RecruitmentSettings
        },
        {
          path: 'vendors',
          name: 'vendors',
          component: VendorsSettings
        },
        {
          path: 'languages',
          name: 'languages',
          component: LanguagesSettings
        },
        {
          path: 'clients',
          name: 'clients',
          component: ClientsSettings
        },
        {
          path: 'pm-projects',
          name: 'pm-projects',
          component: Projects
        },
        {
          path: 'pm-project-details',
          name: 'pm-project-details',
          component: ProjectInfo
        },
        {
          path: 'pm-create-project',
          name: 'pm-create-project',
          component: CreateProject
        },
        {
          path: 'finance',
          name: 'finance',
          component: FinanceSettings
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportsSettings
        },
        {
          path: 'translation-request',
          name: 'translation',
          component: Clientrequest
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if(!token && to.path !== '/login') {
    next('/login')
  } else if(token) {
    const date = Date.now();
    const expiryTime = new Date(JSON.parse(token).timestamp);
    if(date > expiryTime && to.path !== '/login') {
      store.dispatch("logout");
      next('/login')
    } else {
      next()
    }
  } else {
    next();
  }
})

export default router;