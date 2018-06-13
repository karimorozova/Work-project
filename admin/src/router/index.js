import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Requests from '@/components/Requests'
import TasksReport from '@/components/TasksReport'
import Main from '@/components/Main'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    /*
    {
      path: '/',
      name: 'Requests',
      component: Requests
    },
    */
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
    /*
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    */
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/main',
      name: 'main',
      component: Main
    }
  ]
})
