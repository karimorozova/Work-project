<template lang="pug">
  .wrapper
    .navbar
      Menu(:elements="test" :path='path')
    .content
      router-view
</template>

<script>

	import Menu from './navBar/Menu'
	import { mapActions, mapGetters } from "vuex"
	import { setAllServices, setAllUnits, setAllUsers, setIndustries, setLanguages, setSteps } from "../vuex/general/actions"

	export default {
		data() {
			return {
				isSidebar: false,
				test: [
					{
						name: 'title',
						type: 'title'
					},
					{
						type: 'group',
						name: 'dashboard',
						path: 'dashboard',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Overall View',
								path: '/dashboard/overall-view'
							},
							{
								type: 'link',
								name: 'Sales Performance',
								path: '/dashboard/sales-perfomance'
							}
						]
					},
					{
						type: 'group',
						name: 'Vendors',
						path: 'vendors',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'All',
								path: '/vendors/all'
							},
							{
								type: 'link',
								name: 'Active',
								path: '/vendors/active'
							},
							{
								type: 'link',
								name: 'Inactive',
								path: '/vendors/inactive'
							},
							{
								type: 'group',
								name: 'CANDIDATES',
								path: 'candidates',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/vendors/candidates/potential',
										name: 'Potential'
									},
									{
										type: 'link',
										path: '/vendors/candidates/tests',
										name: 'Tests'
									}
								]

							},
							{
								type: 'group',
								path: 'report',
								name: 'REPORTS',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/vendors/report/pending-competencies-vendors',
										name: 'Competencies Queue'
									}
								]
							}

						]
					},
					{
						type: 'group',
						name: 'Clients',
						path: 'clients',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'All',
								path: '/clients/all'
							},
							{
								type: 'link',
								name: 'Active',
								path: '/clients/active'
							},
							{
								type: 'link',
								name: 'Inactive',
								path: '/clients/inactive'
							},
							{
								type: 'link',
								name: 'Potential',
								path: '/clients/potential'
							}
						]
					},
					{
						type: 'group',
						name: 'PROJECTS',
						path: 'projects',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Open Projects',
								path: '/projects/open-projects'
							},
							{
								type: 'link',
								name: 'Quote Sent',
								path: '/projects/quote-projects'
							},
							{
								type: 'link',
								name: 'Incoming Requests',
								path: '/projects/requests'
							},
							{
								type: 'link',
								name: 'Closed Projects',
								path: '/projects/closed-projects'
							},
							{
								type: 'group',
								path: 'xtrf',
								name: 'XTRF',
								isOpen: false,
								children: [
									{
										type: 'link',
										path: '/projects/xtrf/open-other-projects?status=In-progress',
										name: 'Open Projects'
									},
									{
										type: 'link',
										path: '/projects/xtrf/quote-other-projects?status=Quote',
										name: 'Open Projects'
									},
									{
										type: 'link',
										path: '/projects/xtrf/closed-other-projects?status=Closed',
										name: 'Closed Projects'
									}
								]
							}
						]
					},
					{
						type: 'link',
						name: 'FINANCE',
						path: '/finance'
					},
					{
						type: 'group',
						name: 'Reports',
						path: 'reports',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Language Tier',
								path: '/reports/lang-pair-tier'
							},
							{
								type: 'link',
								name: 'LQA Status',
								path: '/reports/lqa'
							},
							{
								type: 'link',
								name: 'Upcoming LQAs',
								path: '/reports/upcoming-lqa'
							},
							{
								type: 'link',
								name: 'Vendor Cost Benchmark',
								path: '/reports/benchmark'
							},
							{
								type: 'link',
								name: 'Competencies Queue',
								path: '/reports/pending-competencies'
							}
						]
					},
					{
						type: 'group',
						name: 'Settings',
						path: 'settings',
						isOpen: false,
						parent: true,
						children: [
							{
								type: 'link',
								name: 'Languages',
								path: '/settings/langs'
							},
							{
								type: 'link',
								name: 'Industries',
								path: '/settings/industries'
							},
							{
								type: 'link',
								name: 'Services',
								path: '/settings/services'
							},
							{
								type: 'link',
								name: 'Units',
								path: '/settings/units'
							},
							{
								type: 'link',
								name: 'Pricelists',
								path: '/settings/pricelists'
							},
							{
								type: 'link',
								name: 'Discounts/Surcharges',
								path: '/settings/discounts'
							},
							{
								type: 'link',
								name: 'Cancellation Reasons',
								path: '/settings/cancel-reasons'
							},
							{
								type: 'link',
								name: 'Instructions',
								path: '/settings/instructions'
							},
							{
								type: 'link',
								name: 'LQA',
								path: '/settings/tiers-lqas'
							},
							{
								type: 'link',
								name: 'Industry Tiers',
								path: '/settings/industry-lqas'
							},
							{
								type: 'link',
								name: 'Lead Sources',
								path: '/settings/leadsources'
							},
							{
								type: 'link',
								name: 'Clients Api',
								path: '/settings/api-customers'
							},
							{
								type: 'link',
								name: 'Users',
								path: '/settings/users'
							},
							{
								type: 'link',
								name: 'Groups',
								path: '/settings/groups'
							}
						]
					},
					{
						type: 'group',
						path: 'account',
						name: 'My Account',
						isOpen: false,
						children: [
							{
								type: 'link',
								path: '/account/settings',
								name: 'Settings'
							},
							{
								type: 'link',
								path: '/projects/xtrf/closed-other-projects?status=Closed',
								name: 'logout'
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
				setSteps: "setSteps"
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
			},
			userName() {
				return `${ this.user.firstName } ${ this.user.lastName } test`
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
		},
		components: {
			Menu
		}

	}
</script>

<style scoped lang="scss">
  .wrapper {
    display: flex;
  }

  .navbar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 265px;
    padding: 10px;
    background-color: #463b2a;
    box-sizing: border-box;
  }

  .content {
    margin-left: 265px;
  }
</style>