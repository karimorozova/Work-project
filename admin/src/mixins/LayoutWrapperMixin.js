import moment from "moment"
import { mapActions } from "vuex"

export default {
	data() {
		return {
			moduleData: [],
			isDataRemain: true,
			layoutsPossibleSettings: {
				"receivables-reports-steps": {
					fields: [
						{
							id: "sf_projectName",
							name: "Project Name",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_customer.name",
							name: "Client / Billing Name",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						// {
						// 	id: "sf_paymentType",
						// 	name: "Payment Type",
						// 	isCheck: false,
						// 	style: { "min-width": "240px" }
						// },
						{
							id: "sf_steps.stepId",
							name: "Step ID",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_steps.stepAndUnit.step.title",
							name: "Step",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_languagePair",
							name: "Language Pair",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_billingDate",
							name: "Billing Date",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_status",
							name: "Status",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_fee",
							name: "Fee",
							isCheck: false,
							style: { "min-width": "240px" }
						}
					],
					filters: [
						{
							id: "f_projectName",
							name: "Project Name",
							isCheck: false
						},
						{
							id: "f_customer.name",
							name: "Client",
							isCheck: false,
						},
						{
							id: "f_steps.stepId",
							name: "Step ID",
							isCheck: false,
						},
						{
							id: "f_steps.stepAndUnit.step.title",
							name: "Step",
							isCheck: false,
						},

					],
					sorting: [
						{
							id: "sf_projectName",
							name: "Project Name",
							isCheck: false
						},
						{
							id: "sf_customer.name",
							name: "Client",
							isCheck: false,
						},
						{
							id: "sf_steps.stepId",
							name: "Step ID",
							isCheck: false,
						},
						{
							id: "sf_steps.stepAndUnit.step.title",
							name: "Step",
							isCheck: false,
						},


					]
				},
				project: {
					filters: [
						{
							id: "f_projectId",
							name: "Project ID",
							isCheck: false
						},
						{
							id: "f_projectName",
							name: "Project Name",
							isCheck: false
						},
						{
							id: "f_clients",
							name: "Clients",
							isCheck: false
						},
						{
							id: "f_startDate",
							name: "Start Date Range",
							isCheck: false
						},
						{
							id: "f_deadline",
							name: "Deadline Range",
							isCheck: false
						},
						{
							id: "f_projectManager",
							name: "Project Manager",
							isCheck: false
						},
						{
							id: "f_accountManager",
							name: "Account Manger",
							isCheck: false
						},
						{
							id: "f_sourceLanguages",
							name: "Source Languages",
							isCheck: false
						},
						{
							id: "f_targetLanguages",
							name: "Target Languages",
							isCheck: false
						},
						{
							id: "f_industry",
							name: "Industry",
							isCheck: false
						},
						{
							id: "f_tasksServices",
							name: "Tasks Services",
							isCheck: false
						},
						{
							id: "f_stepsServices",
							name: "Step Services",
							isCheck: false
						},
						{
							id: "f_tasksStatuses",
							name: "Tasks Statuses",
							isCheck: false
						},
						{
							id: "f_stepsStatuses",
							name: "Steps Statuses",
							isCheck: false
						},
						{
							id: "f_isTest",
							name: "Test",
							isCheck: false
						},
						{
							id: "f_projectCurrency",
							name: "Currency",
							isCheck: false
						},
						{
							id: "f_vendors",
							name: "Vendors",
							isCheck: false
						},
						{
							id: "f_requestId",
							name: "Request ID",
							isCheck: false
						}
					],
					fields: [
						{
							id: "sf_projectID",
							name: "Project ID",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_projectName",
							name: "Project Name",
							isCheck: false,
							style: { "min-width": "240px" }
						},
						{
							id: "sf_clientName",
							name: "Client Name",
							isCheck: false,
							style: { "min-width": "180px" }
						},
						{
							id: "sf_startDate",
							name: "Start Date",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_deadline",
							name: "Deadline",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_languages",
							name: "Languages",
							isCheck: false,
							style: { "min-width": "220px" }
						},
						{
							id: "sf_projectManager",
							name: "Project Manager",
							isCheck: false,
							style: { "min-width": "160px" }
						},
						{
							id: "sf_accountManager",
							name: "Account Manger",
							isCheck: false,
							style: { "min-width": "160px" }
						},
						{
							id: "sf_industry",
							name: "Industry",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_isTest",
							name: "Test",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_payables",
							name: "Payables",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_receivables",
							name: "Receivables",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_total",
							name: "Total",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_margin",
							name: "Margin",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_marginPercent",
							name: "Margin %",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_roi",
							name: "Roi",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_projectCurrency",
							name: "Currency",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_status",
							name: "Status",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_urgent",
							name: "Urgent",
							isCheck: false,
							style: { "min-width": "100px" }
						},
						{
							id: "sf_requestId",
							name: "Request ID",
							isCheck: false,
							style: { "min-width": "150px" }
						},
						{
							id: "sf_tasksServices",
							name: "Tasks Services",
							isCheck: false,
							style: { "min-width": "150px" }
						},
						{
							id: "sf_tasksStatuses",
							name: "Tasks Statuses",
							isCheck: false,
							style: { "min-width": "150px" }
						},
						{
							id: "sf_stepsServices",
							name: "Step Services",
							isCheck: false,
							style: { "min-width": "150px" }
						},
						{
							id: "sf_stepsStatuses",
							name: "Steps Statuses",
							isCheck: false,
							style: { "min-width": "150px" }
						},
						{
							id: "sf_extraServices",
							name: "Extra Services",
							isCheck: false,
							style: { "min-width": "130px" }
						},
						{
							id: "sf_vendors",
							name: "Vendors",
							isCheck: false,
							style: { "min-width": "300px" }
						}
					],
					sorting: [
						{
							id: "sf_projectID",
							name: "Project ID",
							isCheck: false
						},
						{
							id: "sf_projectName",
							name: "Project Name",
							isCheck: false
						},
						{
							id: "sf_clientName",
							name: "Client Name",
							isCheck: false
						},
						{
							id: "sf_startDate",
							name: "Start Date",
							isCheck: false
						},
						{
							id: "sf_deadline",
							name: "Deadline",
							isCheck: false
						},
						{
							id: "sf_projectManager",
							name: "Project Manager",
							isCheck: false
						},
						{
							id: "sf_accountManager",
							name: "Account Manger",
							isCheck: false
						},
						{
							id: "sf_industry",
							name: "Industry",
							isCheck: false
						},
						{
							id: "sf_isTest",
							name: "Test",
							isCheck: false
						},
						{
							id: "sf_payables",
							name: "Payables",
							isCheck: false
						},
						{
							id: "sf_receivables",
							name: "Receivables",
							isCheck: false
						},
						{
							id: "sf_total",
							name: "Total",
							isCheck: false
						},
						{
							id: "sf_margin",
							name: "Margin",
							isCheck: false
						},
						{
							id: "sf_marginPercent",
							name: "Margin %",
							isCheck: false
						},
						{
							id: "sf_roi",
							name: "Roi",
							isCheck: false
						},
						{
							id: "sf_projectCurrency",
							name: "Currency",
							isCheck: false
						},
						{
							id: "sf_status",
							name: "Status",
							isCheck: false
						},
						{
							id: "sf_urgent",
							name: "Urgent",
							isCheck: false
						},
						{
							id: "sf_requestId",
							name: "Request ID",
							isCheck: false
						}
					]
				},
        vendor: {
          filters: [
            {
              id: "f_vendorId",
              name: "Vendor ID",
              isCheck: false
            },
            {
              id: "f_phone",
              name: "Vendor Phone",
              isCheck: false
            },
            {
              id: "f_email",
              name: "Vendor Email",
              isCheck: false
            },
            {
              id: "f_currency",
              name: "Vendor Currency",
              isCheck: false
            },
            {
              id: "f_timezone",
              name: "Vendor Timezone",
              isCheck: false
            },
            {
              id: "f_status",
              name: "Vendor Status",
              isCheck: false,
            },
            {
              id: "f_gender",
              name: "Vendor Gender",
              isCheck: false,
            },
            {
              id: "f_vendorType",
              name: "Vendor Type",
              isCheck: false,
            },
            {
              id: "f_native",
              name: "Native Language",
              isCheck: false,
            },
            {
              id: "f_isAvailableForWork",
              name: "Is Available",
              isCheck: false,
            },
            {
              id: "f_isTest",
              name: "Is Test",
              isCheck: false,
            },
            {
              id: "f_companyName",
              name: "Company Name",
              isCheck: false,
            },
            {
              id: "f_website",
              name: "Website",
              isCheck: false,
            },
            {
              id: "f_surname",
              name: "Vendor",
              isCheck: false,
            },
            {
              id: "f_billingInfo",
              name: "Payment Methods",
              isCheck: false,
            },
            {
              id: "f_catExperience",
              name: "CAT Experience",
              isCheck: false,
            },
            {
              id: "f_sourceLanguages",
              name: "Source Languages",
              isCheck: false
            },
            {
              id: "f_targetLanguages",
              name: "Target Languages",
              isCheck: false,
            },
            {
              id: "f_industry",
              name: "Industries",
              isCheck: false,
            },
            {
              id: "f_steps",
              name: "Steps",
              isCheck: false,
            },
            {
              id: "f_rate",
              name: "Vendor rate",
              isCheck: false,
            },
          ],
          fields: [
            {
              id: "sf_vendorID",
              name: "Vendor ID",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_phone",
              name: "Vendor Phone",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_email",
              name: "Vendor Email",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_currency",
              name: "Vendor Currency",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_timezone",
              name: "Vendor Timezone",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_status",
              name: "Vendor Status",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_gender",
              name: "Vendor Gender",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_vendorType",
              name: "Vendor Type",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_native",
              name: "Native Language",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_isAvailableForWork",
              name: "Is Available",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_isTest",
              name: "is Test",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_companyName",
              name: "Company Name",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_website",
              name: "Website",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_surname",
              name: "Vendor",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_billingInfo",
              name: "Payment Methods",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_catExperience",
              name: "CAT Experience",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_sourceLanguages",
              name: "Source Languages",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_targetLanguages",
              name: "Target Languages",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_industry",
              name: "Industries",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_steps",
              name: "Steps",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_rate",
              name: "Vendor rate",
              isCheck: false,
              style: { "min-width": "130px" }
            },
          ],
          sorting: [
            {
              id: "sf_vendorID",
              name: "Vendor ID",
              isCheck: false,
            },
            {
              id: "sf_phone",
              name: "Vendor Phone",
              isCheck: false
            },
            {
              id: "sf_email",
              name: "Vendor Email",
              isCheck: false,
            },
            {
              id: "sf_currency",
              name: "Vendor Currency",
              isCheck: false,
            },
            {
              id: "sf_timezone",
              name: "Vendor Timezone",
              isCheck: false,
            },
            {
              id: "sf_status",
              name: "Vendor Status",
              isCheck: false,
            },
            {
              id: "sf_gender",
              name: "Vendor Gender",
              isCheck: false,
            },
            {
              id: "sf_vendorType",
              name: "Vendor Type",
              isCheck: false,
            },
            {
              id: "sf_native",
              name: "Native Language",
              isCheck: false,
            },
            {
              id: "sf_isAvailableForWork",
              name: "Is Available",
              isCheck: false,
            },
            {
              id: "sf_isTest",
              name: "is Test",
              isCheck: false,
            },
            {
              id: "sf_companyName",
              name: "Company Name",
              isCheck: false,
            },
            {
              id: "sf_website",
              name: "Website",
              isCheck: false,
            },
            {
              id: "sf_surname",
              name: "Vendor",
              isCheck: false,
            },
            {
              id: "sf_billingInfo",
              name: "Payment Methods",
              isCheck: false,
            },
            {
              id: "sf_catExperience",
              name: "CAT Experience",
              isCheck: false,
            },
            {
              id: "sf_sourceLanguages",
              name: "Source Languages",
              isCheck: false,
            },
            {
              id: "sf_targetLanguages",
              name: "Target Languages",
              isCheck: false,
            },
            {
              id: "sf_industry",
              name: "Industries",
              isCheck: false,
            },
            {
              id: "sf_steps",
              name: "Steps",
              isCheck: false,
            },
            {
              id: "sf_rate",
              name: "Vendor rate",
              isCheck: false,
              style: { "min-width": "130px" }
            },
          ]
        }
			}
		}
	},
	methods: {
		...mapActions([ 'alertToggle' ]),
		dateFormat(date) {
			return moment(date).format('MMM D, HH:mm')
		},
		async replaceRoute(id, value) {
			let query = this.$route.query
			delete query[id]
			await this.$router.replace({ path: this.$route.path, query: { ...query, [id]: value } })

			this.calculateTableMaxHeight
					? this.calculateTableMaxHeight()
					: this.$parent.calculateTableMaxHeight()
		},
		async removeQuery(id) {
			await this.replaceRoute(id, '')
		},
		async setSimpleValue(id, value) {
			await this.replaceRoute(id, value)
		},
		getSimpleValue(id) {
			return this.$route.query[id] || ''
		},
		async getModuleData({ sort = {}, query = {} }) {
			console.log('getModuleData')
			try {
				const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
					countToGet: 50,
					countToSkip: 0,
					sort,
					query
				})
				this.moduleData = res.data
				this.isDataRemain = res.data.length === 50
			} catch (e) {
				this.alertToggle({ message: e.data, isShow: true, type: "error" })
			}
		},
		async lazyLoading({ sort = {}, query = {} }) {
			console.log('lazyLoading')
			if (!this.isDataRemain) return
			try {
				const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
					countToGet: 50,
					countToSkip: this.moduleData.length,
					sort,
					query
				})
				this.moduleData.push(...res.data)
				this.isDataRemain = res.data.length === 50
			} catch (e) {
				this.alertToggle({ message: e.data, isShow: true, type: "error" })
			}
		},
		collectQueryData(callback) {
			const sort = {}
			const query = {}

			for (const paramsKey in this.$route.params) {
				if (this.$route.params[paramsKey] && paramsKey === 'status') {
					query[paramsKey] = this.$route.params[paramsKey]
				}
			}
			for (const queryKey in this.$route.query) {
				if (this.$route.query[queryKey]) {
					const [ prefix ] = queryKey.split('_')
					prefix === 'sf'
							? sort[queryKey] = this.$route.query[queryKey]
							: query[queryKey] = this.$route.query[queryKey]
				}
			}
			if (callback) return callback({ sort, query })
		}
	}
}
