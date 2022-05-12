import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import NewLogin from '@/components/NewLogin'
import PasswordReset from '../components/PasswordReset'
import PasswordResetRequest from '../components/PasswordResetRequest'
import PasswordRestore from '@/components/PasswordRestore'
import ProjectInfo from '@/components/pmArea/ProjectInfo'
import Pricelists from '@/components/finance/Pricelists'
import PricelistSettingsLayout from '@/components/finance/PricelistSettingsLayout'
import TableLeadsources from '@/components/Table/TableLeadsources'
import TableDiscounts from '@/components/Table/TableDiscounts'
import TableGroups from '@/components/Table/TableGroups'
import TableLanguages from '@/components/Table/TableLanguagesNew'
import TableServices from '@/components/Table/TableServices'
import TableIndustries from '@/components/Table/TableIndustries'
import TablePaymentTerms from "@/components/Table/TablePaymentTerms"
import Instructions from '@/components/Table/Instructions'
import CancelReasons from '@/components/Table/CancelReasons'
import TierLqas from '@/components/Table/TierLqas'
import Users from '@/components/Table/Users'
import NewClientInfo from '@/components/clients/new-client/NewClientInfo'
import ClientInfo from '@/components/clients/ClientInfo'
import NewVendor from '@/components/vendors/NewVendor'
import AccountInfo from '@/components/account/AccountInfo'
import ZohoCode from '@/components/ZohoCode'
import TierReport from '@/components/reports/langPair/TierReport'
import BenchmarkReport from '@/components/reports/benchmark/BenchmarkReport'
import LqaReport from '@/components/reports/lqa/LqaReport'
import LqaVendors from '@/components/reports/upcomingLqas/LqaVendors'
import StepsDashboard from '@/components/dashboard/StepsDashboard'
import OverallView from '@/components/dashboard/OverallView'
import Activity from '@/components/dashboard/Activity'
import Finance from '@/components/dashboard/Finance'
import SalesPerformance from '@/components/dashboard/SalesPerformance'
import IndustryLqa from '@/components/Table/IndustryLqa'
import TableClientApiSetting from "../components/Table/TableClientApiSetting"
import Navbar from "../components/Navbar"
import clearRouterView from "../components/clearRouterView"
import RequestInfo from "../components/pmArea/clientRequests/clientRequestInfo"
import QuoteDecision from '../components/pmArea/QuoteDecision'
import CreationLayout from "../components/pmArea/creationProject/CreationLayout"
import PaymentMethodsLayout from "../components/Table/PaymentMethods/Layout"
import Company from "../components/Table/company/Layout"


//NEW LAYOUT LISTS
import ProjectsListLayout from '../components/allModulesLayoutsLists/Projects/index'
import ReceivablesReports from '../components/allModulesLayoutsLists/ReceivablesReports/index'
import VendorsListLayout from '../components/allModulesLayoutsLists/Vendors/index'

// LIST ================================================================================================
import Projects from '@/components/pmArea/lists/Projects'
import Requests from '@/components/pmArea/lists/Requests'

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

import ReceivablesDetails from "../components/invoicingReceivables_old/ReceivablesDetails"
import ReceivablesAdd from "../components/invoicingReceivables_old/ReceivablesAdd"
import axios from "axios"
import cookie from "../../../vendor/plugins/vue-cookie"

import AddReports from "../components/invoicingClientReports/AddReports"
import ReportDetails from "../components/invoicingClientReports/ReportDetails"
import ReportsList from "../components/invoicingClientReports/ReportsList"

import AddInvoice from "../components/invoicingClientInvoices/AddInvoice"
import InvoiceDetails from "../components/invoicingClientInvoices/InvoiceDetails"
import InvoiceEdit from "../components/invoicingClientInvoices/InvoiceEdit"
import InvoicesList from "../components/invoicingClientInvoices/InvoicesList"
// =====================================================================================================


Vue.use(Router)

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/login',
			name: 'login',
			component: NewLogin
		},
		{
			path: '/password-reset/token/:token',
			name: 'password-reset',
			component: PasswordReset
		},
		{
			path: '/password-reset-request',
			name: 'password-reset-request',
			component: PasswordResetRequest
		},
		{
			path: '/forgot',
			name: 'forgot',
			component: PasswordRestore
		},
		{
			path: '/quote-decision',
			name: 'quote-decision',
			component: QuoteDecision
		},
		{
			path: '/',
			name: 'main',
			redirect: '/pangea-dashboard/overall-view',
			component: Navbar,
			props: true,
			children: [
				{
					path: '/pangea-zoho-code',
					name: 'zoho',
					component: ZohoCode
				},
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
							path: 'pipeline',
							name: 'pipeline',
							component: StepsDashboard
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
						},
						{
							path: 'finance',
							name: 'finance',
							component: Finance
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
							path: 'payment-methods',
							name: 'payment-methods',
							component: PaymentMethodsLayout
						},
						{
							path: 'users',
							name: 'users',
							component: Users
						},
						{
							path: 'payment-terms',
							name: 'payment-terms',
							component: TablePaymentTerms
						},
						{
							path: 'company',
							name: 'company',
							component: Company
						}
					]
				},
				{
					path: 'pangea-vendors',
					name: 'pangea-vendors',
					component: clearRouterView,
					children: [

						{
							path: 'all-vendors/:status/:presetId',
							name: 'all-vendors',
							props: true,
              component: VendorsListLayout
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
							path: 'all-projects/:status/:presetId',
							name: 'all-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'all-projects/:status/details/:id',
							name: 'all-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'draft-projects/:status/:presetId',
							name: 'draft-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'draft-projects/:status/details/:id',
							name: 'draft-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cost-quote-projects/:status/:presetId',
							name: 'cost-quote-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'cost-quote-projects/:status/details/:id',
							name: 'cost-quote-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'quote-sent-projects/:status/:presetId',
							name: 'quote-sent-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'quote-sent-projects/:status/details/:id',
							name: 'quote-sent-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'in-progress-projects/:status/:presetId',
							name: 'in-progress-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'in-progress-projects/:status/details/:id',
							name: 'in-progress-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'approved-projects/:status/:presetId',
							name: 'approved-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'approved-projects/:status/details/:id',
							name: 'approved-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'rejected-projects/:status/:presetId',
							name: 'rejected-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'rejected-projects/:status/details/:id',
							name: 'rejected-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'closed-projects/:status/:presetId',
							name: 'closed-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'closed-projects/:status/details/:id',
							name: 'closed-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cancelled-projects/:status/:presetId',
							name: 'cancelled-projects',
							component: ProjectsListLayout,
							props: true
						},
						{
							path: 'cancelled-projects/:status/details/:id',
							name: 'cancelled-project-details',
							component: ProjectInfo,
							props: true
						},
						{
							path: 'cancelled-halfway-projects/:status/:presetId',
							name: 'cancelled-halfway-projects',
							component: ProjectsListLayout,
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
							path: 'create-project',
							name: 'create-project',
							component: CreationLayout
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
							path: 'payables-reports/reports',
							name: 'payables-reports',
							component: PayablesReportsList
						},
						{
							path: 'payables-reports/paid-reports',
							name: 'payables-reports',
							component: PayablesPaidReportsList
						},
						{
							path: 'payables-reports/paid-reports/:id',
							name: 'payables-reports',
							component: PayablesPaidDetails
						},
						{
							path: 'payables-reports/reports/:id',
							name: 'payables-reports',
							component: PayablesDetails
						},
						{
							path: 'payables-reports/create-reports',
							name: 'payables-reports',
							component: PayablesAdd
						},

						{
							path: 'receivables-reports/reports',
							name: 'receivables-reports',
							component: ReportsList
						},
						{
							path: 'receivables-reports/reports/:id',
							name: 'receivables-reports',
							component: ReportDetails
						},
						{
							path: 'receivables-reports/create-reports',
							name: 'receivables-reports',
							// component: AddReports
							component: ReceivablesReports
						},
						{
							path: 'receivables-reports/create-reports-o',
							name: 'receivables-reports',
							component: AddReports
							// component: ReceivablesReports
						},
						{
							path: 'receivables-reports/invoice',
							name: 'receivables-invoice',
							component: InvoicesList
						},
						{
							path: 'receivables-reports/invoice/:id',
							name: 'receivables-invoice',
							component: InvoiceDetails
						},
						{
							path: 'receivables-reports/invoice/:id/edit',
							name: 'receivables-invoice',
							component: InvoiceEdit
						},
						{
							path: 'receivables-reports/create-invoice',
							name: 'receivables-invoice',
							component: AddInvoice
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

router.beforeEach(async (to, from, next) => {
	// const token = localStorage.getItem("token")
	try {
		if (to.path === '/login' || to.path === '/pangea-zoho-code' || to.path === '/password-reset-request' || to.name === 'password-reset' || to.name === 'quote-decision') return next()
		const { status } = await axios.post('/check-jwt')
		if (status === 200) {
			return next()
		}
		next('/login')
	} catch (e) {
		exit()
	}

	function exit() {
		cookie.delete('admin')
		return next('/login')
	}
})

export default router
