import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/components/Register'
import Login from '@/components/Login'
import PasswordRestore from '@/components/PasswordRestore'
import Main from '@/components/Main'
import DashboardSettings from '@/components/sliders/DashboardSettings'
import Settings from '@/components/sliders/Settings'
import VendorsSettings from '@/components/sliders/VendorsSettings'
import LanguagesSettings from '@/components/sliders/LanguagesSettings'
import ClientsSettings from '@/components/sliders/ClientsSettings'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import RequestInfo from '@/components/pmArea/RequestInfo'
import FinanceSettings from '@/components/sliders/FinanceSettings'
import Pricelists from '@/components/finance/Pricelists'
import PricelistRates from '@/components/finance/PricelistRates'
import ReportsSettings from '@/components/sliders/ReportsSettings'
import TableLeadsources from '@/components/Table/TableLeadsources'
import TableGroups from '@/components/Table/TableGroups'
import TablePackages from '@/components/Table/TablePackages'
import TableLanguages from '@/components/Table/TableLanguages'
import TableServices from '@/components/Table/TableServices'
import TableIndustries from '@/components/Table/TableIndustries'
import DiscountChart from '@/components/Table/DiscountChart'
import ChartMatrix from '@/components/Table/ChartMatrix'
import Instructions from '@/components/Table/Instructions'
import CancelReasons from '@/components/Table/CancelReasons'
import Users from '@/components/Table/Users'
import ClientDetails from '@/components/clients/ClientDetails'
import Allclients from '@/components/clients/Allclients'
import ActiveClients from '@/components/clients/ActiveClients'
import InactiveClients from '@/components/clients/InactiveClients'
import PotentialClients from '@/components/clients/PotentialClients'
import ClientInfo from '@/components/clients/ClientInfo'
import NewClientInfo from '@/components/clients/NewClientInfo'
import ContactDetails from '@/components/clients/ContactDetails'
import NewContactDetails from '@/components/clients/NewContactDetails'
import Vendordetails from '@/components/vendors/Vendordetails'
import AllVendorsTable from '@/components/vendors/AllVendorsTable'
import ActiveVendors from '@/components/vendors/ActiveVendors'
import PotentialVendors from '@/components/vendors/PotentialVendors'
import InactiveVendors from '@/components/vendors/InactiveVendors'
import NewVendor from '@/components/vendors/NewVendor'
import NewClient from '@/components/clients/NewClient'
import Accountinfo from '@/components/account/Accountinfo'
import Projects from '@/components/pmArea/Projects'
import Requests from '@/components/pmArea/Requests'
import PrevProjects from '@/components/pmArea/PrevProjects'
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
                if (token) {
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
                    component: DashboardSettings,
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: Settings,
                    props: true,
                    children: [
                        {
                            path: 'leadsources',
                            name: 'leadsources',
                            component: TableLeadsources
                        },
                        {
                            path: 'groups',
                            name: 'groups',
                            component: TableGroups
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
                            path: 'pricelists',
                            name: 'pricelists',
                            component: Pricelists
                        },
                        {
                            path: 'discount-chart',
                            name: 'discount-chart',
                            component: DiscountChart,                            
                        },
                        {
                            path: 'matrix/:name',
                            name: 'matrix',
                            props: true,
                            component: ChartMatrix
                        },
                        {
                            path: 'instructions',
                            name: 'instructions',
                            component: Instructions
                        },
                        {
                            path: 'cancel-reasons',
                            name: 'cancel-reasons',
                            component: CancelReasons
                        },
                        {
                            path: 'rates',
                            name: 'rates',
                            component: PricelistRates
                        },
                        {
                            path: 'users',
                            name: 'users',
                            component: Users
                        }
                    ]
                },
                {
                    path: 'vendors',
                    name: '',
                    component: VendorsSettings,
                    children: [
                        {
                            path: '',
                            name: 'all-vendors',
                            props: true,
                            component: AllVendorsTable
                        },
                        {
                            path: 'active',
                            name: 'active-vendors',
                            props: true,
                            component: ActiveVendors
                        },
                        {
                            path: 'inactive',
                            name: 'inactive-vendors',
                            props: true,
                            component: InactiveVendors
                        },
                        {
                            path: 'potential',
                            name: 'potential-vendors',
                            props: true,
                            component: PotentialVendors
                        },
                        {
                            path: 'details/:id',
                            name: 'vendor-details',
                            component: Vendordetails
                        },
                        {
                            path: 'new-vendor',
                            name: 'new-vendor',
                            component: NewVendor
                        },
                    ]
                },
                {
                    path: 'languages',
                    name: 'languages',
                    component: LanguagesSettings
                },
                {
                    path: 'clients',
                    name: '',
                    component: ClientsSettings,
                    children: [
                        {
                            path: '',
                            name: 'all-clients',
                            component: Allclients,
                            props: true
                        },
                        {
                            path: 'active',
                            name: 'active-clients',
                            props: true,
                            component: ActiveClients
                        },
                        {
                            path: 'inactive',
                            name: 'inactive-clients',
                            props: true,
                            component: InactiveClients
                        },
                        {
                            path: 'potential',
                            name: 'potential-clients',
                            props: true,
                            component: PotentialClients
                        },
                        {
                            path: 'details/:id',
                            name: '',
                            component: ClientDetails,
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
                            path: 'new-client',
                            name: '',
                            component: NewClient,
                            props: true,
                            children: [
                                {
                                    path: '',
                                    name: '_info',
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
                        }
                    ]
                },
                {
                    path: 'projects',
                    name: 'projects',
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
                        },
                        {
                            path: 'prev-projects',
                            name: 'prev-projects',
                            component: PrevProjects
                        }
                    ]
                },
                {
                    path: 'project-details/:id',
                    name: 'project-details',
                    component: ProjectInfo
                },
                {
                    path: 'request-details/:id',
                    name: 'request-details',
                    component: RequestInfo
                },
                {
                    path: 'create-project',
                    name: 'create-project',
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
                }
            ]
        },
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token");
    if (to.path === '/forgot') {
        next();
    } else if (!token && to.path !== '/login') {
        next('/login');
    } else if (token) {
        const date = Date.now();
        const expiryTime = new Date(JSON.parse(token).timestamp);
        if (date > expiryTime && to.path !== '/login') {
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