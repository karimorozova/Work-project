import Vue from 'vue'
import jwt from 'jsonwebtoken'
import secretKey from '../../configs/jwtkey'
import Router from 'vue-router'
import Login from '@/components/Login'
import PasswordRestore from '@/components/PasswordRestore'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import OtherProjectInfo from '@/components/pmArea/otherProjects/OtherProjectInfo'
import Pricelists from '@/components/finance/Pricelists'
import PricelistSettingsLayout from '@/components/finance/PricelistSettingsLayout'
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
import NewClientInfo from '@/components/clients/new-client/NewClientInfo'
import NewClient from '@/components/clients/new-client/NewClient'
import ClientInfo from '@/components/clients/ClientInfo'
import NewVendor from '@/components/vendors/NewVendor'
import Accountinfo from '@/components/account/Accountinfo'
import CreateProject from '@/components/pmArea/CreateProject'
// import ZohoCode from '@/components/ZohoCode'
import TierReport from '@/components/reports/langPair/TierReport'
import BenchmarkReport from '@/components/reports/benchmark/BenchmarkReport'
import LqaReport from '@/components/reports/lqa/LqaReport'
import LqaVendors from '@/components/reports/upcomingLqas/LqaVendors'
// import Xtrf from '@/components/reports/Xtrf'
import OverallView from '@/components/dashboard/OverallView'
import SalesPerformance from '@/components/dashboard/SalesPerformance'
import IndustryLqa from '@/components/Table/IndustryLqa'
import { store } from '../vuex/store'
import TableClientApiSetting from "../components/Table/TableClientApiSetting"
import Navbar from "../components/Navbar"
import clearRouterView from "../components/clearRouterView"
import RequestInfo from "../components/pmArea/clientRequests/clientRequestInfo"


// LIST ================================================================================================
import Projects from '@/components/pmArea/lists/Projects'
import Requests from '@/components/pmArea/lists/Requests'
import ClosedProjects from '@/components/pmArea/lists/ClosedProjects'
import QuoteProjects from '@/components/pmArea/lists/QuoteProjects'
import OpenOtherProjects from '@/components/pmArea/lists/OpenOtherProjects'
import ClosedOtherProjects from '@/components/pmArea/lists/ClosedOtherProjects'
import QuoteOtherProjects from '@/components/pmArea/lists/QuoteOtherProjects'

import Allclients from '@/components/clients/lists/Allclients'
import ActiveClients from '@/components/clients/lists/ActiveClients'
import InactiveClients from '@/components/clients/lists/InactiveClients'
import PotentialClients from '@/components/clients/lists/PotentialClients'

import PendingCompetenciesLayout from "../components/vendors/lists/PendingCompetenciesLayout"
import VendorsCandidatesTests from '@/components/vendors/lists/VendorsCandidatesTests'
import Vendordetails from '@/components/vendors/Vendordetails'
import AllVendorsTable from '@/components/vendors/lists/AllVendorsTable'
import ActiveVendors from '@/components/vendors/lists/ActiveVendors'
import PotentialVendors from '@/components/vendors/lists/PotentialVendors'
import InactiveVendors from '@/components/vendors/lists/InactiveVendors'
import ContactDetailsAddInNewClient from "../components/clients/new-client/ContactDetailsAddInNewClient"
import ContactDetailsInNewClient from "../components/clients/new-client/ContactDetailsInNewClient"
import ContactDetailsAddExistingClient from "../components/clients/ContactDetailsAddExistingClient"
import ContactDetailsExistingClient from "../components/clients/ContactDetailsExistingClient"
// =====================================================================================================


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
			redirect: '/pangea-dashboard/overall-view',
			component: Navbar,
			props: true,
			// beforeEnter: (to, from, next) => {
			// 	const token = localStorage.getItem("token")
			// 	if (token) {
			// 		next()
			// 	} else {
			// 		next('/login')
			// 	}
			// },
			children: [
				// {
				//     path: '/zoho-code',
				//     name: 'zoho',
				//     component: ZohoCode
				// },
				// {
				// 	path: '/account/settings',
				// 	name: 'account-info',
				// 	component: Accountinfo
				// },
				{
					path: 'pangea-dashboard',
					name: 'pangea-dashboard',
					component: clearRouterView,
					children: [
						{
							path: 'overall-view',
							name: 'overall-view',
							component: OverallView
						},
						{
							path: 'sales-perfomance',
							name: 'sales-perfomance',
							component: SalesPerformance
						}

					]
				},
				{
					path: 'pangea-settings',
					name: 'pangea-settings',
					component: clearRouterView,
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
							path: 'languages',
							name: 'languages',
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
							path: 'pricelists/:id',
							name: 'pricelist',
							component: PricelistSettingsLayout
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
							component: IndustryLqa
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
						}
					]
				},
				{
					path: 'pangea-vendors',
					name: 'pangea-vendors',
					component: clearRouterView,
					children: [

						{
							path: 'all',
							name: 'all-vendors',
							props: true,
							component: AllVendorsTable
						},
						{
							path: 'all/details/:id',
							name: 'all-vendor-details',
							component: Vendordetails
						},
						{
							path: 'active',
							name: 'active-vendors',
							props: true,
							component: ActiveVendors
						},
						{
							path: 'active/details/:id',
							name: 'active-vendor-details',
							component: Vendordetails
						},
						{
							path: 'inactive',
							name: 'inactive-vendors',
							props: true,
							component: InactiveVendors
						},
						{
							path: 'inactive/details/:id',
							name: 'inactive-vendor-details',
							component: Vendordetails
						},
						{
							path: 'candidates/potential',
							name: 'potential-vendors',
							props: true,
							component: PotentialVendors
						},
						{
							path: 'candidates/potential/details/:id',
							name: 'vendor-details',
							component: Vendordetails
						},
						{
							path: 'candidates/tests',
							name: 'tests-vendors',
							props: true,
							component: VendorsCandidatesTests
						},
						{
							path: 'report/pending-competencies-vendors',
							name: 'pending-competencies-vendors',
							component: PendingCompetenciesLayout
						},
						{
							path: 'new-vendor',
							name: 'new-vendor',
							component: NewVendor
						}

					]
				},
				{
					path: 'pangea-clients',
					name: 'pangea-clients',
					component: clearRouterView,
					children: [
						{
							path: 'all',
							name: 'all-clients',
							component: Allclients,
							props: true
						},
						{
							path: 'all/details/:id',
							name: '',
							component: clearRouterView,
							props: true,
							children: [
								{ path: '', name: 'all-client-info', component: ClientInfo, props: true },
								{ path: 'new-contact', name: 'all-new-contact', component: ContactDetailsAddExistingClient, props: true },
								{ path: 'contact/:index', name: 'all-contact', component: ContactDetailsExistingClient, props: true }
							]
						},
						{
							path: 'active',
							name: 'active-clients',
							component: ActiveClients,
							props: true
						},
						{
							path: 'active/details/:id',
							name: '',
							component: clearRouterView,
							props: true,
							children: [
								{ path: '', name: 'active-client-info', component: ClientInfo, props: true },
								{ path: 'new-contact', name: 'active-new-contact', component: ContactDetailsAddExistingClient, props: true },
								{ path: 'contact/:index', name: 'active-contact', component: ContactDetailsExistingClient, props: true }
							]
						},
						{
							path: 'inactive',
							name: 'inactive-clients',
							component: InactiveClients,
							props: true
						},
						{
							path: 'inactive/details/:id',
							name: '',
							component: clearRouterView,
							props: true,
							children: [
								{ path: '', name: 'inactive-client-info', component: ClientInfo, props: true },
								{ path: 'new-contact', name: 'inactive-new-contact', component: ContactDetailsAddExistingClient, props: true },
								{ path: 'contact/:index', name: 'inactive-contact', component: ContactDetailsExistingClient, props: true }
							]
						},
						{
							path: 'potential',
							name: 'potential-clients',
							component: PotentialClients,
							props: true
						},
						{
							path: 'potential/details/:id',
							name: '',
							component: clearRouterView,
							props: true,
							children: [
								{ path: '', name: 'potential-client-info', component: ClientInfo, props: true },
								{ path: 'new-contact', name: 'potential-new-contact', component: ContactDetailsAddExistingClient, props: true },
								{ path: 'contact/:index', name: 'potential-contact', component: ContactDetailsExistingClient, props: true }
							]
						},
						{
							path: 'new-client',
							name: 'new-client',
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
									component: ContactDetailsAddInNewClient,
									props: true
								},
								{
									path: '_contact/:index',
									name: '_contact',
									component: ContactDetailsInNewClient,
									props: true
								}
							]
						}
					]
				},
				{
					path: 'pangea-projects',
					name: 'pangea-projects',
					component: clearRouterView,
					children: [
						{
							path: 'open-projects',
							name: 'open-projects',
							component: Projects,
							props: true
						},
						{
							path: 'open-projects/details/:id',
							name: 'open-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'quote-projects',
							name: 'quote-projects',
							component: QuoteProjects,
							props: true
						},
						{
							path: 'quote-projects/details/:id',
							name: 'quote-projects-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'requests',
							name: 'requests',
							component: Requests,
							props: true
						},
						{
							path: 'requests/details/:id',
							name: 'requests-projects-details',
							component: RequestInfo,
							props: true
						},
						{
							path: 'closed-projects',
							name: 'closed-projects',
							component: ClosedProjects,
							props: true
						},
						{
							path: 'closed-projects/details/:id',
							name: 'closed-projects-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'xtrf',
							name: 'xtrf',
							component: clearRouterView,
							props: true,
							children: [
								{
									path: 'open-other-projects',
									name: 'open-other-projects',
									component: OpenOtherProjects,
									props: true
								},
								{
									path: 'open-other-projects/details/:id',
									name: 'open-other-projects-details',
									component: OtherProjectInfo,
									props: true
								},
								{

									path: 'closed-other-projects',
									name: 'closed-other-projects',
									component: ClosedOtherProjects,
									props: true
								},
								{
									path: 'closed-other-projects/details/:id',
									name: 'closed-other-projects-details',
									component: OtherProjectInfo,
									props: true
								},
								{
									path: 'quote-other-projects',
									name: 'quote-other-projects',
									component: QuoteOtherProjects,
									props: true
								},
								{
									path: 'quote-other-projects/details/:id',
									name: 'quote-other-projects-details',
									component: OtherProjectInfo,
									props: true
								}

							]
						},
						{
							path: 'create-project',
							name: 'create-project',
							component: CreateProject
						}
					]
				},
				{
					path: 'pangea-finance',
					name: 'pangea-finance',
					component: clearRouterView,
					props: true,
					children: [
						{
							path: 'finance',
							name: 'finance',
							component: clearRouterView
						}
					]
				},
				{
					path: 'pangea-reports',
					name: 'pangea-reports',
					component: clearRouterView,
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
		}
	]
})

router.beforeEach((to, from, next) => {
	const date = Date.now()

	try {
		const token = localStorage.getItem("token")
		if (to.path === '/login' || to.path === '/forgot') return next()
		if (!!token) {
			const jwtObj = jwt.verify(JSON.parse(token).value, secretKey)

			if (jwtObj) {
				if (date > new Date(JSON.parse(jwtObj).timestamp)) {
					exit()
				}
				return next()
			}
		}

		next('/login')

	} catch (e) {
		console.log(e, 'CACTCJ')
		exit()
	}

	function exit() {
		localStorage.removeItem("token")
		return next('/login')
	}
})

export default router
