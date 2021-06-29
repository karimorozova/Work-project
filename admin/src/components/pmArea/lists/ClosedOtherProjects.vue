<template lang="pug">
  .other-projects
    OtherProjectFilter(
      :sourceLangs="sourceFilter"
      :targetLangs="targetFilter"
      @setFilter="setFilter"
      @addLangFilter="addLangFilter"
      @removeLangFilter="removeLangFilter"
      @refreshProjects="refreshProjects"
    )
    .other-projects__table
      OtherProjectTable(
        :allProjects="allProjects"
        @onRowClicked="onRowClicked"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
	import OtherProjectTable from '../otherProjects/OtherProjectTable'
	import OtherProjectFilter from '../otherProjects/OtherProjectFilter'
	import { mapActions } from 'vuex'

	export default {
		data() {
			return {
				allProjects: [],
				isDataRemain: false,
				lastDate: null,
				filters: {
					idFilter: '',
					clientFilter: '',
					pmFilter: '',
					startFilter: '',
					deadlineFilter: '',
					query: ''
				},
				sourceFilter: [],
				targetFilter: []
			}
		},
		methods: {
			...mapActions([ 'alertToggle' ]),
			onRowClicked(id) {
				this.$router.push(`/pangea-projects/xtrf/closed-other-projects/details/${ id }`)
			},
			refreshProjects(projects) {
				this.allProjects = projects
			},
			async setFilter({ option, prop }) {
				this.filters[prop] = option
				await this.getProjects(this.allFilters)
			},
			async addLangFilter({ to, lang }) {
				this[to].push(lang.symbol)
				await this.getProjects(this.allFilters)
			},
			async removeLangFilter({ from, position }) {
				this[from].splice(position, 1)
				await this.getProjects(this.allFilters)
			},
			async getProjects(filters) {
				let lastDate = new Date()
				lastDate.setDate(lastDate.getDate() + 1)
				this.isDataRemain = true
				try {
					const result = await this.$http.post('/memoqapi/other-projects', {
								...filters,
								lastDate
							}
					)
					this.allProjects = result.data
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].creationTime : ""
					this.isDataRemain = result.data.length === 25
				} catch (err) {
					this.alertToggle({
						message: 'Can\'t get projects',
						isShow: true,
						type: 'error'
					})
				}
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post('/memoqapi/other-projects', {
						...this.allFilters,
						lastDate: this.lastDate
					})
					this.allProjects.push(...result.data)
					this.isDataRemain = result.data.length === 25
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].creationTime : ""
				}
			}
		},
		computed: {
			allFilters() {
				return {
					idFilter: this.filters.idFilter,
					clientFilter: this.filters.clientFilter,
					pmFilter: this.filters.pmFilter,
					startFilter: this.filters.startFilter,
					deadlineFilter: this.filters.deadlineFilter,
					sourceFilter: this.sourceFilter,
					targetFilter: this.targetFilter,
					query: this.filters.query
				}
			}
		},
		components: {
			OtherProjectTable,
			OtherProjectFilter
		},
		async created() {
			this.filters.query = this.$route.query.status.replace(/(-)/g, ' ')
			await this.getProjects(this.allFilters)
		},
		watch: {
			$route(to) {
				this.filters.query = to.query.status.replace(/(-)/g, ' ')
				this.getProjects(this.allFilters)
			}
		}
	}
</script>

<style lang="scss" scoped>

  .other-projects {
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    position: relative;
    width: 1200px;
    margin: 50px;
    background: white;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 4px;
  }
</style>
