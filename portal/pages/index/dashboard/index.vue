<template lang="pug">
  .dashboard
    .dashboard__item
      .dashboard__title Open Quotes
      .dashboard__table
        Table(:projects="filteredQuotes" @iconClicked="makeQuoteAction" @getDetails="(e) => getDetails(e, 'filteredQuotes')")
    .dashboard__item
      .dashboard__title Open Projects
      .dashboard__table
        Table(:projects="filteredProjects" @getDetails="(e) => getDetails(e, 'filteredProjects')" :isOpenProjects="true")
    .dashboard__item
      .dashboard__title Open Requests
      .dashboard__table
        Table(:projects="filteredRequest"  @getDetails="getRequestDetails" :isOpenRequest="true" )
</template>

<script>
	import Table from "../../components/projects/Table"
	import { mapActions, mapGetters } from "vuex"
  import {getClientInfo, getToken, getUserInfo} from "../../../store/getters";

	export default {
		props: {
			projects: {
				type: Array
			},
			requests: {
				type: Array
			}
		},
		data() {
			return {
			}
		},
		methods: {
			...mapActions({
				updateQuoteStatus: "updateQuoteStatus",
			}),
			filterByStatus(statuses) {
				return this.projects.filter(item => {
					return statuses.indexOf(item.status) !== -1
				})
			},
			getDetails({ index }, prop) {
				const id = this[prop][index]._id
				this.$router.push(`/dashboard/details/${ id }`)
			},
      getRequestDetails({index}) {
        const id = this.filteredRequest[index]._id
        this.$router.push(`/client-request/details/${ id }`)
      },
			async makeQuoteAction({ index, key }) {
				const quote = this.filteredQuotes[index]
				try {
					await this.updateQuoteStatus({ quote, key })
				} catch (err) {

				}
			}
		},
		computed: {
		  ...mapGetters({
        clientRequests: "getClientRequests",
      }),
			filteredProjects() {
				let statuses = [ 'Started', 'Approved', 'In progress', 'Ready for Delivery' ]
				const result = this.filterByStatus(statuses)
				return result.sort((a, b) => a.startDate < b.startDate ? 1 : -1)
			},
			filteredQuotes() {
				let statuses = [ 'Quote sent', 'Requested' ]
				const projects = this.filterByStatus(statuses)
				return projects
			},
      filteredRequest() {
				// let statuses = [ 'Quote sent', 'Requested' ]
				return this.clientRequests
			}
		},
		components: {
			Table
		},
  }

</script>

<style lang="scss" scoped>

  .dashboard {
    width: 100%;
    display: flex;
    flex-direction: column;

    &__item {
      width: 1040px;
      display: flex;
      flex-direction: column;
      justify-content: center;

    }

    &__drop-menu {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-radius: 18px;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
      margin-right: 36px;
      margin-bottom: 10px;
      padding: 0 14px;
      color: #67573e;
      transition: all 0.2s;
    }

    &__select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 20px;
      cursor: pointer;
      font-size: 18px;
    }

    &__title{
      margin: 30px 0 10px;
      font-family: Myriad400;
      font-size: 20px;
      color: #67573e;
    }

    &__table {
      box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
      padding: 20px;
    }

    &_cornered {
      border-radius: 0;
      border: none;
      margin-bottom: 0;
    }

    &_rotate-180 {
      transform: rotate(180deg);
    }
  }

</style>
