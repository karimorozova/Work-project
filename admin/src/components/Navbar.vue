<template lang="pug">
  .wrapper
    .navbar
      .navbar__logo
        img(src="../assets/images/latest-version/navbar-logo.svg")
      .navbar__menu
        Menu(:elements="elements" :path='path')
      .navbar__name ADMIN PORTAL

    .content
      Header
      router-view


</template>

<script>
	import Menu from './navBar/Menu'
	import { mapActions, mapGetters } from "vuex"
	import Header from "./navBar/Header"

	export default {
		data() {
			return {
				isSidebar: false,
				elements: [
					// {
					// 	name: 'title',
					// 	type: 'title'
					// },
					{
						type: 'group',
						name: 'Dashboard',
						path: 'pangea-dashboard',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Overall View',
								path: '/pangea-dashboard/overall-view'
							},
							{
								type: 'link',
								name: 'Activities',
								path: '/pangea-dashboard/activities'
							}
							// {
							// 	type: 'link',
							// 	name: 'Sales Performance',
							// 	path: '/pangea-dashboard/sales-perfomance'
							// }
						]
					},
					{
						type: 'group',
						name: 'Vendors',
						path: 'pangea-vendors',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'All',
								path: '/pangea-vendors/all'
							},
							{
								type: 'link',
								name: 'Active',
								path: '/pangea-vendors/active'
							},
							{
								type: 'link',
								name: 'Inactive',
								path: '/pangea-vendors/inactive'
							},
							{
								type: 'group',
								name: 'Candidates',
								path: 'candidates',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/pangea-vendors/candidates/potential',
										name: 'Potential'
									},
									{
										type: 'link',
										path: '/pangea-vendors/candidates/tests',
										name: 'Tests'
									}
								]

							},
							{
								type: 'group',
								path: 'report',
								name: 'Reports',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/pangea-vendors/report/pending-competencies-vendors',
										name: 'Competencies Queue'
									}
								]
							},
							{
								type: 'link',
								name: 'Add Vendor',
								path: '/pangea-vendors/new-vendor'
							}

						]
					},
					{
						type: 'group',
						name: 'Clients',
						path: 'pangea-clients',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'All',
								path: '/pangea-clients/all'
							},
							{
								type: 'link',
								name: 'Active',
								path: '/pangea-clients/active'
							},
							{
								type: 'link',
								name: 'Inactive',
								path: '/pangea-clients/inactive'
							},
							{
								type: 'link',
								name: 'Potential',
								path: '/pangea-clients/potential'
							},
							{
								type: 'link',
								name: 'Add Client',
								path: '/pangea-clients/new-client'
							}
						]
					},
					{
						type: 'group',
						name: 'Projects',
						path: 'pangea-projects',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'All',
								path: '/pangea-projects/all-projects/All'
							},
							{
								name: 'Quotes',
								type: 'title'
							},
							{
								type: 'link',
								name: 'Draft',
								path: '/pangea-projects/draft-projects/Draft'
							},
							{
								type: 'link',
								name: 'Cost Quote',
								path: '/pangea-projects/cost-quote-projects/Cost_Quote'
							},
							{
								type: 'link',
								name: 'Quote Sent',
								path: '/pangea-projects/quote-sent-projects/Quote_sent'
							},
							{
								name: 'In Progress',
								type: 'title'
							},
							{
								type: 'link',
								name: 'In Progress',
								path: '/pangea-projects/in-progress-projects/In_progress'
							},
							{
								type: 'link',
								name: 'Approved',
								path: '/pangea-projects/approved-projects/Approved'
							},
							{
								type: 'link',
								name: 'Rejected',
								path: '/pangea-projects/rejected-projects/Rejected'
							},
							{
								name: 'Closed',
								type: 'title'
							},
							{
								type: 'link',
								name: 'Closed',
								path: '/pangea-projects/closed-projects/Closed'
							},
							{
								type: 'link',
								name: 'Cancelled',
								path: '/pangea-projects/cancelled-projects/Cancelled'
							},
							{
								type: 'link',
								name: 'Cancelled Halfway',
								path: '/pangea-projects/cancelled-halfway-projects/Cancelled_Halfway'
							},
							{
								type: 'row'
							},
							// {
							// 	type: 'link',
							// 	name: 'Incoming Requests',
							// 	path: '/pangea-projects/requests'
							// },
							{
								type: 'group',
								path: 'requests',
								name: 'Incoming Requests',
								isOpen: false,
								children: [
									{
										type: 'link',
										name: 'Client Requests',
										path: '/pangea-projects/requests/pm-requests/Client_Request'
									},
									{
										type: 'link',
										name: 'Approved Requests',
										path: '/pangea-projects/requests/am-requests/Request_Approved'
									},
									{
										type: 'link',
										name: 'Closed Requests',
										path: '/pangea-projects/requests/closed-requests/Closed'
									}
								]
							},
							{
								type: 'group',
								path: 'xtrf',
								name: 'Other Projects (XTRF)',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/pangea-projects/xtrf/open-other-projects?status=In-progress',
										name: 'Open Projects'
									},
									{
										type: 'link',
										path: '/pangea-projects/xtrf/quote-other-projects?status=Quote',
										name: 'Quotes Projects'
									},
									{
										type: 'link',
										path: '/pangea-projects/xtrf/closed-other-projects?status=Closed',
										name: 'Closed Projects'
									}
								]
							},
							{
								type: 'link',
								name: 'Add Project',
								path: '/pangea-projects/create-project'
							}
						]
					},
					{
						type: 'group',
						name: 'Finance',
						path: 'pangea-finance',
						isOpen: false,
						parent: true,
						children: [
							// {
							// 	type: 'link',
							// 	name: 'Finance',
							// 	path: '/pangea-finance/finance'
							// },
              {
                type: 'group',
                path: 'invoicing-reports',
                name: 'Payables',
                isOpen: false,
                children: [
                  {
                    type: 'link',
                    path: '/pangea-finance/invoicing-reports/reports',
                    name: 'Invoices'
                  },
                  {
                    type: 'link',
                    path: '/pangea-finance/invoicing-reports/paid-invoices',
                    name: 'Paid Invoices'
                  },
                  {
                    type: 'link',
                    path: '/pangea-finance/invoicing-reports/create-reports',
                    name: 'Add Invoices'
                  },
                ]

							}
						]
					},
					{
						type: 'group',
						name: 'Reports',
						path: 'pangea-reports',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Language Tier',
								path: '/pangea-reports/lang-pair-tier'
							},
							{
								type: 'link',
								name: 'LQA Status',
								path: '/pangea-reports/lqa'
							},
							{
								type: 'link',
								name: 'Upcoming LQAs',
								path: '/pangea-reports/upcoming-lqa'
							},
							{
								type: 'link',
								name: 'Vendor Cost Benchmark',
								path: '/pangea-reports/benchmark'
							},

							{
								type: 'link',
								name: 'Competencies Queue',
								path: '/pangea-reports/pending-competencies'
							}
						]
					},
					{
						type: 'group',
						name: 'Settings',
						path: 'pangea-settings',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Languages',
								path: '/pangea-settings/languages'
							},
							{
								type: 'link',
								name: 'Industries',
								path: '/pangea-settings/industries'
							},
							{
								type: 'link',
								name: 'Services / Steps',
								path: '/pangea-settings/services'
							},
							{
								type: 'link',
								name: 'Units',
								path: '/pangea-settings/units'
							},
							{
								type: 'link',
								name: 'Pricelists',
								path: '/pangea-settings/pricelists'
							},
							{
								type: 'link',
								name: 'Discounts / Surcharges',
								path: '/pangea-settings/discounts'
							},
							{
								type: 'link',
								name: 'Payment Terms',
								path: '/pangea-settings/payment-terms'
							},
							{
								type: 'link',
								name: 'Cancellation Reasons',
								path: '/pangea-settings/cancel-reasons'
							},
							{
								type: 'link',
								name: 'Instructions',
								path: '/pangea-settings/instructions'
							},
							{
								type: 'link',
								name: 'LQA',
								path: '/pangea-settings/tiers-lqas'
							},
							{
								type: 'link',
								name: 'Industry Tiers',
								path: '/pangea-settings/industry-lqas'
							},
							{
								type: 'link',
								name: 'Lead Sources',
								path: '/pangea-settings/leadsources'
							},
							{
								type: 'link',
								name: 'Clients Api',
								path: '/pangea-settings/api-customers'
							},
							{
								type: 'link',
								name: 'Users',
								path: '/pangea-settings/users'
							},
							{
								type: 'link',
								name: 'Groups',
								path: '/pangea-settings/groups'
							}
						]
					}
				]
			}
		},
		methods: {
			...mapActions({
				setUser: "setUser",
				setAllServices: "setAllServices",
				setAllUnits: "setAllUnits",
				setLanguages: "setLanguages",
				setAllUsers: "setAllUsers",
				setIndustries: "setIndustries",
				setSteps: "setSteps",
				setVendorsForOption: 'setVendorsForOption'
			}),
			async getCurrentUserGroup() {
				try {
					if (!this.userGroup) {
						await this.setUser()
					}
				} catch (err) {
					console.log("Cannot identify user group")
				}
			}
		},
		computed: {
			...mapGetters({
				user: "getUser",
				userGroup: "getUserGroup"
			}),
			path() {
				const params = this.$route.path.split('/')
				params.shift()
				return params
			}
		},
		created() {
			this.getCurrentUserGroup()

			//SET GLOBAL VUEX
			this.setAllServices()
			this.setAllUnits()
			this.setLanguages()
			this.setAllUsers()
			this.setIndustries()
			this.setSteps()
			this.setVendorsForOption()
		},
		components: {
			Header,
			Menu
		}

	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors";

  .wrapper {
    display: flex;
  }

  .navbar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 270px;
    z-index: 99999;
    box-sizing: border-box;
    background: white;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    &__name {
      text-align: center;
      font-size: 20px;
      font-family: Myriad900;
      border-top: 1px solid $border;
      padding-top: 22px;
      cursor: default;
      -moz-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
    }

    &__menu {
      height: calc(100vh - 165px);
      overflow-y: auto;
      scrollbar-width: none;
    }

    ::-webkit-scrollbar {
      width: 0px;
    }

    &__logo {
      margin: 0 auto;
      padding: 20px 0 10px 0;
      width: 200px;

      img {
        width: 100%;
      }
    }
  }

  .content {
    width: 100%;
    min-width: fit-content;
    margin-left: 270px;
  }
</style>