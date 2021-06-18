import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import PasswordRestore from '@/components/PasswordRestore'
import DashboardSettings from '@/components/sliders/DashboardSettings'
import Settings from '@/components/sliders/Settings'
import VendorsSettings from '@/components/sliders/VendorsSettings'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import OtherProjectInfo from '@/components/pmArea/otherProjects/OtherProjectInfo'
import clientRequestInfo from '@/components/pmArea/clientRequests/clientRequestInfo'
import FinanceSettings from '@/components/sliders/FinanceSettings'
import Pricelists from '@/components/finance/Pricelists'
import PricelistSettingsLayout from '@/components/finance/PricelistSettingsLayout'
import ReportsSettings from '@/components/sliders/ReportsSettings'
import TableLeadsources from '@/components/Table/TableLeadsources'
import TableDiscounts from '@/components/Table/TableDiscounts'
import TableGroups from '@/components/Table/TableGroups'
import TableLanguages from '@/components/Table/TableLanguagesNew'
import TableServices from '@/components/Table/TableServices'
import TableIndustries from '@/components/Table/TableIndustries'
import TableUnits from '@/components/Table/TableUnits'
import Instructions from '@/components/Table/Instructions'
import CancelReasons from '@/components/Table/CancelReasons'
import TierLqas from '@/components/Table/TierLqas'
import Users from '@/components/Table/Users'

//------------------------------------------------------------CLIENT------------------------------------------------------------
//NEW CLIENT
import NewClientInfo from '@/components/clients/new-client/NewClientInfo'
import NewContactDetails from '@/components/clients/new-client/NewContactDetails'
import NewClient from '@/components/clients/new-client/NewClient'

//CLIENT
import ContactDetails from '@/components/clients/ContactDetails'
import ClientInfo from '@/components/clients/ClientInfo'
import ClientDetails from '@/components/clients/ClientDetails'

//CLIENT TABLE
import Allclients from '@/components/clients/lists/Allclients'
import ActiveClients from '@/components/clients/lists/ActiveClients'
import InactiveClients from '@/components/clients/lists/InactiveClients'
import PotentialClients from '@/components/clients/lists/PotentialClients'
//------------------------------------------------------------CLIENT------------------------------------------------------------
import Vendordetails from '@/components/vendors/Vendordetails'
import AllVendorsTable from '@/components/vendors/lists/AllVendorsTable'
import ActiveVendors from '@/components/vendors/lists/ActiveVendors'
import PotentialVendors from '@/components/vendors/lists/PotentialVendors'
import InactiveVendors from '@/components/vendors/lists/InactiveVendors'
import NewVendor from '@/components/vendors/NewVendor'
import Accountinfo from '@/components/account/Accountinfo'
import Projects from '@/components/pmArea/lists/Projects'
import Requests from '@/components/pmArea/lists/Requests'
import ClosedProjects from '@/components/pmArea/lists/ClosedProjects'
import QuoteProjects from '@/components/pmArea/lists/QuoteProjects'
import OpenOtherProjects from '@/components/pmArea/lists/OpenOtherProjects'
import ClosedOtherProjects from '@/components/pmArea/lists/ClosedOtherProjects'
import QuoteOtherProjects from '@/components/pmArea/lists/QuoteOtherProjects'
import PmArea from '@/components/sliders/PmArea'
import CreateProject from '@/components/pmArea/CreateProject'
// import ZohoCode from '@/components/ZohoCode'
import TierReport from '@/components/reports/langPair/TierReport'
import BenchmarkReport from '@/components/reports/benchmark/BenchmarkReport'
import LqaReport from '@/components/reports/lqa/LqaReport'
import LqaVendors from '@/components/reports/upcomingLqas/LqaVendors'
import VendorsCandidatesTests from '@/components/vendors/lists/VendorsCandidatesTests'
// import Xtrf from '@/components/reports/Xtrf'
import OverallView from '@/components/dashboard/OverallView'
import SalesPerformance from '@/components/dashboard/SalesPerformance'
import IndustryLqa from '@/components/Table/IndustryLqa'
import PendingCompetenciesLayout from "../components/vendors/lists/PendingCompetenciesLayout"
import { store } from '../vuex/store'
import TableClientApiSetting from "../components/Table/TableClientApiSetting"
import Navbar from "../components/Navbar"
import clearRouterView from "../components/clearRouterView"

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        // {
        //     path: '/xtrf',
        //     name: 'xtrf',
        //     component: Xtrf
        // },
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
            redirect: '/dashboard/overall-view',
            component: Navbar,
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
                // {
                //     path: '/zoho-code',
                //     name: 'zoho',
                //     component: ZohoCode
                // },
                {
                    path: '/account/settings',
                    name: 'account-info',
                    component: Accountinfo
                },
                {
                    path: 'dashboard',
                    name: '',
                    component: DashboardSettings,
                    children: [
                        {
                            path: 'overall-view',
                            name: 'overall-view',
                            component: OverallView,
                        },
                        {
                            path: 'sales-perfomance',
                            name: 'sales-perfomance',
                            component: SalesPerformance,
                        }

                    ]
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: Settings,
                    props: true,
                    children: [
                        {
                            path: 'discounts',
                            name: 'discounts',
                            component: TableDiscounts
                        },
                        {
                            path: 'api-customers',
                            name: 'api-customers',
                            component: TableClientApiSetting
                        },
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
                            path: 'tiers-lqas',
                            name: 'tiers-lqas',
                            component: TierLqas
                        },
                        {
                            path: 'industry-lqas',
                            name: 'industry-lqas',
                            component: IndustryLqa,
                        },
                        {
                            path: 'pricelists/:id',
                            name: 'pricelist',
                            component: PricelistSettingsLayout
                        },
                        {
                            path: 'users',
                            name: 'users',
                            component: Users
                        },
                        {
                            path: 'units',
                            name: 'units',
                            component: TableUnits
                        },
                    ]
                },
                {
                    path: 'vendors',
                    name: '',
                    component: VendorsSettings,
                    children: [
                        {
                            path: 'all',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'all-vendors',
                                    props: true,
                                    component: AllVendorsTable,
                                },
                                {
                                    path: 'details/:id',
                                    name: 'all-vendor-details',
                                    component: Vendordetails
                                },
                            ]
                        },
                        {
                            path: 'active',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'active-vendors',
                                    props: true,
                                    component: ActiveVendors,
                                },
                                {
                                    path: 'details/:id',
                                    name: 'active-vendor-details',
                                    component: Vendordetails
                                },
                            ]
                        },
                        {
                            path: 'inactive',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'inactive-vendors',
                                    props: true,
                                    component: InactiveVendors,
                                },
                                {
                                    path: 'details/:id',
                                    name: 'inactive-vendor-details',
                                    component: Vendordetails
                                },
                            ]
                        },
                        {
                            path: 'candidates',
                            name: '',
                            component: clearRouterView,
                            children: [
                                {
                                    path: 'potential',
                                    name: '',
                                    props: true,
                                    component: clearRouterView,
                                    children: [
                                        {
                                            path: '',
                                            name: 'potential-vendors',
                                            props: true,
                                            component: PotentialVendors,
                                        },
                                        {
                                            path: 'details/:id',
                                            name: 'vendor-details',
                                            component: Vendordetails
                                        },
                                    ]
                                },
                                {
                                    path: 'tests',
                                    name: 'tests-vendors',
                                    props: true,
                                    component: VendorsCandidatesTests
                                },
                                // {
                                //     path: 'details/:id',
                                //     name: 'vendor-details',
                                //     component: Vendordetails
                                // },
                            ]
                        },
                        {
                            path: 'report',
                            name: '',
                            component: clearRouterView,
                            children: [
                                {
                                    path: 'pending-competencies-vendors',
                                    name: 'pending-competencies-vendors',
                                    component: PendingCompetenciesLayout
                                },
                                {
                                    path: 'details/:id',
                                    name: 'report-details',
                                    component: Vendordetails
                                },
                            ]
                        },
                        // {
                        //     path: 'details/:id',
                        //     name: 'vendor-details',
                        //     component: Vendordetails
                        // },
                        {
                            path: 'new-vendor',
                            name: 'new-vendor',
                            component: NewVendor
                        },
                    ]
                },
                {
                    path: 'clients',
                    name: '',
                    component: clearRouterView,
                    children: [
                        {
                            path: 'all',
                            name: '',
                            component: clearRouterView,
                            props: true,
                            children: [
                                {
                                    path: '',
                                    name: 'all-clients',
                                    component: Allclients,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'all-clients-details',
                                    component: ClientInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'active',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'active-clients',
                                    component: ActiveClients,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'active-clients-details',
                                    component: ClientInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'inactive',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'inactive-clients',
                                    component: InactiveClients,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'inactive-clients-details',
                                    component: ClientInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'potential',
                            name: '',
                            props: true,
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'potential-clients',
                                    component: PotentialClients,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'potential-clients-details',
                                    component: ClientInfo,
                                    props: true,
                                }
                            ]
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
                            name: '',
                            component: clearRouterView,
                            props: true,
                            children: [
                                {
                                    path: '',
                                    name: 'open-projects',
                                    component: Projects,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'open-project-details',
                                    component: ProjectInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'quote-projects',
                            name: '',
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'quote-projects',
                                    component: QuoteProjects,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'quote-projects-details',
                                    component: ProjectInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'requests',
                            name: '',
                            component: clearRouterView,
                            props: true,
                            children: [
                                {
                                    path: '',
                                    name: 'requests',
                                    component: Requests,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'requests-projects-details',
                                    component: ProjectInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'closed-projects',
                            name: '',
                            component: clearRouterView,
                            children: [
                                {
                                    path: '',
                                    name: 'closed-projects',
                                    component: ClosedProjects,
                                    props: true
                                },
                                {
                                    path: 'details/:id',
                                    name: 'closed-projects-details',
                                    component: ProjectInfo,
                                    props: true,
                                }
                            ]
                        },
                        {
                            path: 'xtrf',
                            name: '',
                            component: clearRouterView,
                            props: true,
                            children: [
                                {
                                    path: 'open-other-projects',
                                    name: '',
                                    component: clearRouterView,
                                    children: [
                                        {
                                            path: '',
                                            name: 'open-other-projects',
                                            component: OpenOtherProjects,
                                            props: true
                                        },
                                        {
                                            path: 'details/:id',
                                            name: 'open-other-projects-details',
                                            component: OtherProjectInfo,
                                            props: true,
                                        }
                                    ]
                                },
                                {
                                    path: 'closed-other-projects',
                                    name: '',
                                    component: clearRouterView,
                                    children: [
                                        {
                                            path: '',
                                            name: 'closed-other-projects',
                                            component: ClosedOtherProjects,
                                            props: true
                                        },
                                        {
                                            path: 'details/:id',
                                            name: 'closed-other-projects-details',
                                            component: OtherProjectInfo,
                                            props: true,
                                        }
                                    ]
                                },
                                {
                                    path: 'quote-other-projects',
                                    name: '',
                                    component: clearRouterView,
                                    children: [
                                        {
                                            path: '',
                                            name: 'quote-other-projects',
                                            component: QuoteOtherProjects,
                                            props: true
                                        },
                                        {
                                            path: 'details/:id',
                                            name: 'quote-other-projects-details',
                                            component: OtherProjectInfo,
                                            props: true,
                                        }
                                    ]
                                },
                                // {
                                //     path: 'details/:id',
                                //     name: 'details',
                                //     component: OtherProjectInfo
                                // },
                            ]
                        },
                        // {
                        //     path: 'details/:id',
                        //     name: 'details',
                        //     component: ProjectInfo
                        // },

                    ]
                },

                // {
                //     path: 'request-details/:id',
                //     name: 'request-details',
                //     component: RequestInfo
                // },
                {
                    path: 'request-details/:id',
                    name: 'request-details',
                    component: clientRequestInfo
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
                    component: ReportsSettings,
                    children: [
                        {
                            path: 'lang-pair-tier',
                            name: 'lang-pair-tier',
                            component: TierReport,
                            props: true
                        },
                        {
                            path: 'lqa',
                            name: 'lqa',
                            component: LqaReport,
                            props: true
                        },
                        {
                            path: 'upcoming-lqa',
                            name: 'upcoming-lqa',
                            component: LqaVendors
                        },
                        {
                            path: 'benchmark',
                            name: 'benchmark',
                            component: BenchmarkReport
                        },
                        {
                            path: 'pending-competencies',
                            name: 'pending-competencies',
                            component: PendingCompetenciesLayout
                        }
                    ]
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
