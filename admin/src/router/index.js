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
import TablePaymentTerms from "@/components/Table/TablePaymentTerms"
import Instructions from '@/components/Table/Instructions'
import CancelReasons from '@/components/Table/CancelReasons'
import TierLqas from '@/components/Table/TierLqas'
import Users from '@/components/Table/Users'
import NewClientInfo from '@/components/clients/new-client/NewClientInfo'
import ClientInfo from '@/components/clients/ClientInfo'
import NewVendor from '@/components/vendors/NewVendor'
import AccountInfo from '@/components/account/AccountInfo'
import CreateProject from '@/components/pmArea/CreateProject'
// import ZohoCode from '@/components/ZohoCode'
import TierReport from '@/components/reports/langPair/TierReport'
import BenchmarkReport from '@/components/reports/benchmark/BenchmarkReport'
import LqaReport from '@/components/reports/lqa/LqaReport'
import LqaVendors from '@/components/reports/upcomingLqas/LqaVendors'
// import Xtrf from '@/components/reports/Xtrf'
import OverallView from '@/components/dashboard/OverallView'
import Activity from '@/components/dashboard/Activity'
import SalesPerformance from '@/components/dashboard/SalesPerformance'
import IndustryLqa from '@/components/Table/IndustryLqa'
import TableClientApiSetting from "../components/Table/TableClientApiSetting"
import Navbar from "../components/Navbar"
import clearRouterView from "../components/clearRouterView"
import RequestInfo from "../components/pmArea/clientRequests/clientRequestInfo"


// LIST ================================================================================================
import Projects from '@/components/pmArea/lists/Projects'
import Requests from '@/components/pmArea/lists/Requests'
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

import PayablesReportsList from "../components/invoicingPayables/PayablesReportsList"
import PayablesPaidReportsList from "../components/invoicingPayables/PayablesPaidReportsList"
import PayablesDetails from "../components/invoicingPayables/PayablesDetails"
import PayablesAdd from "../components/invoicingPayables/PayablesAdd"
import PayablesPaidDetails from "../components/invoicingPayables/PayablesPaidDetails"


import ReceivablesReportsList from "../components/invoicingReceivables/ReceivablesReportsList"
import ReceivablesPaidReportsList from "../components/invoicingReceivables/ReceivablesPaidReportsList"
import ReceivablesDetails from "../components/invoicingReceivables/ReceivablesDetails"
import ReceivablesAdd from "../components/invoicingReceivables/ReceivablesAdd"
import ReceivablesPaidDetails from "../components/invoicingReceivables/ReceivablesPaidDetails"
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
				{
					path: 'pangea-account',
					name: 'pangea-account',
					component: AccountInfo
				},
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
						},
						{
							path: 'activities',
							name: 'activities',
							component: Activity
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
						},
						{
							path: 'payment-terms',
							name: 'payment-terms',
							component: TablePaymentTerms
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
							name: 'all-client-info',
							component: ClientInfo,
							props: true
						},
						{
							path: 'active',
							name: 'active-clients',
							component: ActiveClients,
							props: true
						},
						{
							path: 'active/details/:id',
							name: 'active-client-info',
							component: ClientInfo,
							props: true
						},
						{
							path: 'inactive',
							name: 'inactive-clients',
							component: InactiveClients,
							props: true
						},
						{
							path: 'inactive/details/:id',
							name: 'inactive-client-info',
							component: ClientInfo,
							props: true
						},
						{
							path: 'potential',
							name: 'potential-clients',
							component: PotentialClients,
							props: true
						},
						{
							path: 'potential/details/:id',
							name: 'potential-client-info',
							component: ClientInfo,
							props: true
						},
						{
							path: 'new-client',
							name: 'new-client',
							component: NewClientInfo,
							props: true
						}
					]
				},
				{
					path: 'pangea-projects',
					name: 'pangea-projects',
					component: clearRouterView,
					children: [
						{
							path: 'all-projects/:status',
							name: 'all-projects',
							component: Projects,
							props: true
						},
						{
							path: 'all-projects/:status/details/:id',
							name: 'all-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'draft-projects/:status',
							name: 'draft-projects',
							component: Projects,
							props: true
						},
						{
							path: 'draft-projects/:status/details/:id',
							name: 'draft-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cost-quote-projects/:status',
							name: 'cost-quote-projects',
							component: Projects,
							props: true
						},
						{
							path: 'cost-quote-projects/:status/details/:id',
							name: 'cost-quote-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'quote-sent-projects/:status',
							name: 'quote-sent-projects',
							component: Projects,
							props: true
						},
						{
							path: 'quote-sent-projects/:status/details/:id',
							name: 'quote-sent-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'in-progress-projects/:status',
							name: 'in-progress-projects',
							component: Projects,
							props: true
						},
						{
							path: 'in-progress-projects/:status/details/:id',
							name: 'in-progress-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'approved-projects/:status',
							name: 'approved-projects',
							component: Projects,
							props: true
						},
						{
							path: 'approved-projects/:status/details/:id',
							name: 'approved-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'rejected-projects/:status',
							name: 'rejected-projects',
							component: Projects,
							props: true
						},
						{
							path: 'rejected-projects/:status/details/:id',
							name: 'rejected-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'closed-projects/:status',
							name: 'closed-projects',
							component: Projects,
							props: true
						},
						{
							path: 'closed-projects/:status/details/:id',
							name: 'closed-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cancelled-projects/:status',
							name: 'cancelled-projects',
							component: Projects,
							props: true
						},
						{
							path: 'cancelled-projects/:status/details/:id',
							name: 'cancelled-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cancelled-halfway-projects/:status',
							name: 'cancelled-halfway-projects',
							component: Projects,
							props: true
						},
						{
							path: 'cancelled-halfway-projects/:status/details/:id',
							name: 'cancelled-halfway-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'requests',
							name: 'requests',
							component: clearRouterView,
							props: true,
							children: [
								{
									path: 'am-requests/:status',
									name: 'am-requests',
									component: Requests,
									props: true
								},
								{
									path: 'am-requests/:status/details/:id',
									name: 'am-requests-details',
									component: RequestInfo,
									props: true
								},
								{
									path: 'pm-requests/:status',
									name: 'pm-requests',
									component: Requests,
									props: true
								},
								{
									path: 'pm-requests/:status/details/:id',
									name: 'pm-requests-details',
									component: RequestInfo,
									props: true
								},
								{
									path: 'closed-requests/:status',
									name: 'closed-requests',
									component: Requests,
									props: true
								},
								{
									path: 'closed-requests/:status/details/:id',
									name: 'closed-requests-details',
									component: RequestInfo,
									props: true
								}
							]
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
						},
						{
							path: 'invoicing-payables/reports',
							name: 'invoicing-payables',
							component: PayablesReportsList
						},
						{
							path: 'invoicing-payables/paid-invoices',
							name: 'invoicing-payables',
							component: PayablesPaidReportsList
						},
						{
							path: 'invoicing-payables/paid-invoices/:id',
							name: 'invoicing-payables',
							component: PayablesPaidDetails
						},
						{
							path: 'invoicing-payables/reports/:id',
							name: 'invoicing-payables',
							component: PayablesDetails
						},
						{
							path: 'invoicing-payables/create-reports',
							name: 'invoicing-payables',
							component: PayablesAdd
						},
						{
							path: 'invoicing-receivables/reports',
							name: 'invoicing-receivables',
							component: ReceivablesReportsList
						},
						{
							path: 'invoicing-receivables/paid-invoices',
							name: 'invoicing-receivables',
							component: ReceivablesPaidReportsList
						},
						{
							path: 'invoicing-receivables/paid-invoices/:id',
							name: 'invoicing-receivables',
							component: ReceivablesPaidDetails
						},
						{
							path: 'invoicing-receivables/reports/:id',
							name: 'invoicing-receivables',
							component: ReceivablesDetails
						},
						{
							path: 'invoicing-receivables/create-reports',
							name: 'invoicing-receivables',
							component: ReceivablesAdd
						},

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
	const token = localStorage.getItem("token")

	try {
		if (to.path === '/login' || to.path === '/forgot') return next()
		if (!!token) {
			const jwtObj = jwt.verify(JSON.parse(token).value, secretKey)
			if (jwtObj) {
				if (date > new Date(jwtObj.timestamp)) exit()
				return next()
			}
		}
		next('/login')
	} catch (e) {
		exit()
	}

	function exit() {
		localStorage.removeItem("token")
		return next('/login')
	}
})

export default router
