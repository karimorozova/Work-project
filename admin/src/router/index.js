import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/components/Register'
import Login from '@/components/Login'
import PasswordRestore from '@/components/PasswordRestore'
import Main from '@/components/Main'
import DashboardSettings from '@/components/sliders/DashboardSettings'
import RecruitmentSettings from '@/components/sliders/RecruitmentSettings'
import VendorsSettings from '@/components/sliders/VendorsSettings'
import LanguagesSettings from '@/components/sliders/LanguagesSettings'
import ClientsSettings from '@/components/sliders/ClientsSettings'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import FinanceSettings from '@/components/sliders/FinanceSettings'
import Pricelists from '@/components/finance/Pricelists'
import PricelistRates from '@/components/finance/PricelistRates'
import ReportsSettings from '@/components/sliders/ReportsSettings'
import TableLeadsources from '@/components/Table/TableLeadsources'
import TablePackages from '@/components/Table/TablePackages'
import TableLanguages from '@/components/Table/TableLanguages'
import TableServices from '@/components/Table/TableServices'
import TableIndustries from '@/components/Table/TableIndustries'
import Users from '@/components/Table/Users'
import ClientDetails from '@/components/clients/ClientDetails'
import ClientInfo from '@/components/clients/ClientInfo'
import NewClientInfo from '@/components/clients/NewClientInfo'
import ContactDetails from '@/components/clients/ContactDetails'
import NewContactDetails from '@/components/clients/NewContactDetails'
import Vendordetails from '@/components/vendors/Vendordetails'
import NewVendor from '@/components/vendors/NewVendor'
import NewClient from '@/components/clients/NewClient'
import Accountinfo from '@/components/account/Accountinfo'
import Projects from '@/components/pmArea/Projects'
import Requests from '@/components/pmArea/Requests'
import PmArea from '@/components/sliders/PmArea'
import CreateProject from '@/components/pmArea/CreateProject'
import ZohoCode from '@/components/ZohoCode'
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
      path: '/login',
      name: 'login',
      component: Login
    },
    {
        path: '/forgot',
        name: 'forgot',
        component: PasswordRestore
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
          path: '/zoho-code',
          name: 'zoho',
          component: ZohoCode
        },
        {
          path: 'account-info',
          name: 'account-info',
          component: Accountinfo
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          props: true,
          component: DashboardSettings,
          children: [
            {
              path: 'leadsources',
              name: 'leadsources',
              component: TableLeadsources
            },
            {
              path: 'packages',
              name: 'packages',
              component: TablePackages
            },
            {
              path: 'langs',
              name: 'langs',
              component: TableLanguages
            },
            {
              path: 'services',
              name: 'services',
              component: TableServices
            },
            {
              path: 'industries',
              name: 'industries',
              component: TableIndustries
            },
            {
              path: 'users',
              name: 'users',
              component: Users
            }
          ]
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
          path: 'vendors/:id',
          name: 'vendor-details',
          component: Vendordetails
        },
        {
          path: 'new-vendor',
          name: 'new-vendor',
          component: NewVendor
        },
        {
          path: 'languages',
          name: 'languages',
          component: LanguagesSettings
        },
        {
          path: 'clients',
          name: 'clients',
          component: ClientsSettings,
        },
        {
          path: 'new-client',
          name: 'new-client',
          component: NewClient,
          redirect: {name: 'new-client-info'},
          props: true,
          children: [
            {
              path: '',
              name: 'new-client-info',
              component: NewClientInfo,
              props: true
            },
            {
              path: 'new_contact',
              name: 'new_contact',
              component: NewContactDetails,
              props: true
            },
            {
              path: '_contact/:index',
              name: '_contact',
              component: ContactDetails,
              props: true
            }
          ]
        },
        {
          path: 'clients/:id',
          name: 'client-details',
          component: ClientDetails,
          redirect: {name: 'client-info'},
          props: true,
          children: [
            {
              path: '',
              name: 'client-info',
              component: ClientInfo,
              props: true
            },
            {
              path: 'new-contact',
              name: 'new-contact',
              component: NewContactDetails,
              props: true
            },
            {
              path: 'contact/:index',
              name: 'contact',
              component: ContactDetails,
              props: true
            }
          ]
        },
        {
          path: 'pm-area',
          name: 'pm-area',
          component: PmArea,
          children: [
            {
              path: 'open-projects',
              name: 'open-projects',
              component: Projects,
              props: true
            },
            {
              path: 'requests',
              name: 'requests',
              component: Requests,
              props: true
            }
          ]
        },
        {
          path: 'pm-project-details/:id',
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
          component: FinanceSettings,
          redirect: '/finance/pricelists',
          children: [
            {
              path: 'pricelists',
              name: 'pricelists',
              component: Pricelists
            },
            {
              path: 'rates',
              name: 'rates',
              component: PricelistRates
            },
          ]
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportsSettings
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if(to.path === '/forgot') {
    next();
  } else if(!token && to.path !== '/login') {
    next('/login');
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