<template lang="pug">
  .dashboard(v-if="Object.keys(client).length && client")
    //V ==>
    .swapper
      .swapper__text IF YOU CANNOT SEE YOUR PROJECT(S), PLEASE CLICK ON THE BUTTON BELOW TO BE REDIRECTED
      .swapper__button
        Button(:value="'Archive'" @clicked="goToAnotherPortal")
    //V <==

    .row
      .col
        AllOpenRequests(:client="client" :allRequests="clientRequests")
      .col
        MyOpenRequests(:client="client" :myRequests="myFilteredRequest")
    .row
      .col
        AllOpenQuotes( :allQuotes="openQuotes" @changeQuoteStatus="makeQuoteAction")
      .col
        MyOpenQuotes( :myQuotes="myFilteredQuotes")
    .row
      .col
        AllOpenProjects( :allProjects="projects")
      .col
        MyOpenProjects( :myProjects="myFilteredProjects")
</template>

<script>
	import AllOpenRequests from "../../../components/Tables/dashboard/AllOpenRequests"
	import MyOpenRequests from "../../../components/Tables/dashboard/MyOpenRequests"
	import AllOpenQuotes from "../../../components/Tables/dashboard/AllOpenQuotes"
	import MyOpenQuotes from "../../../components/Tables/dashboard/MyOpenQuotes"
	import AllOpenProjects from "../../../components/Tables/dashboard/AllOpenProjects"
	import MyOpenProjects from "../../../components/Tables/dashboard/MyOpenProjects"
	import { mapActions, mapGetters } from "vuex"
  import moment from "moment"
  import { updateOpenProjects } from "../../../store/actions"
  import Button from "../../../components/pangea/Button"

	export default {
		props: {
			// projects: {
			// 	type: Array
			// },
			// requests: {
			// 	type: Array
			// }
		},
		data() {
			return {
			}
		},
		methods: {
			...mapActions({
        setQuoteStatus: "setQuoteStatus",
        setOpenProjects: "setOpenProjects",
        setOpenRequests: "setOpenRequests",
        setOpenQuotes: "setOpenQuotes",
        getClient: "getClient",
			}),
      goToAnotherPortal(){
        const redirectTo = `https://portal.pangea.global`
        let [ cookieValue ] = document.cookie.split(';').filter(i => i.includes('client'))
        let [ key, token ] = cookieValue.split('=')
        const today = moment(new Date()).format('DD MMM YYYY')
        document.cookie = `client=${token} path=/; expires=Thu, ${today} 22:00:00 UTC; domain=.pangea.global`
        window.open(redirectTo)
      },
			filterByStatus(statuses) {
				return this.projects.filter(item => {
					return statuses.indexOf(item.status) !== -1
				})
			},
			getDetails({ index }, prop) {
				const id = this[prop][index]._id
				this.$router.push(`/dashboard/details/${ id }`)
			},
      // getMyRequestDetails({ index }) {
      //   const id = this.myFilteredRequest[index]._id
      //   this.$router.push(`/client-request/details/${ id }`)
      // },
      // getRequestDetails({index}) {
      //   const id = this.filteredRequest[index]._id
      //   this.$router.push(`/client-request/details/${ id }`)
      // },
			async makeQuoteAction({ _id, status }) {
        const quote = this.openQuotes.find((quote) => quote._id === _id)
				try {
					await this.updateQuoteStatus({ quote, key: status })
				} catch (err) {

				}
			},
      // getCreatedBy(createdBy) {
      //   return createdBy && createdBy.hasOwnProperty('firstName') ? createdBy.firstName : '-'
      // },
      // customFormatter(date) {
      //   return moment(date).format('MMM D, HH:mm')
      // },
      // setFields() {
      //   if(this.isOpenProjects) {
      //     let progressElement = {...this.fields[this.fields.length-1], label: 'Progress', key: 'progress', width: "11.5%"};
      //     this.fields.pop();
      //     this.fields.splice(3, 0, progressElement);
      //   }
      //   if(this.isOpenRequest) {
      //     this.fields = [
      //       {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "20%", padding: "0"},
      //       {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "20%", padding: "0"},
      //       {label: "Status", headerKey: "headerStatus", key: "status", width: "20%", padding: "0"},
      //       {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "15%", padding: "0"},
      //       {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "15%", padding: "0"},
      //       {label: "Created By", headerKey: "headerCreatedBy", key: "createdBy", width: "10%", padding: "0"},
      //     ]
      //   }
      // },
		},
		computed: {
		  ...mapGetters({
        projects: "getAllOpenProjects",
        user: "getUserInfo",
        clientRequests: "getAllOpenRequests",
        openQuotes: "getAllOpenQuotes",
        client: "getClientInfo"
      }),
			// projects() {
			// 	let statuses = [ 'Started', 'Approved', 'In progress', 'Ready for Delivery' ]
			// 	const result = this.filterByStatus(statuses)
			// 	return result.sort((a, b) => a.startDate < b.startDate ? 1 : -1)
			// },
			// openQuotes() {
			// 	let statuses = [ 'Quote sent', 'Requested' ]
			// 	const projects = this.filterByStatus(statuses)
			// 	return projects
			// },
      // filteredRequest() {
			// 	return this.clientRequests.filter(clientRequest => clientRequest.status !== 'Closed')
			// },
      myFilteredQuotes() {
		    return this.openQuotes.filter(quote =>  quote.hasOwnProperty('clientContacts') && quote.clientContacts.map(({ _id }) => _id).includes(this.user._id ))
          // return quote.hasOwnProperty('clientContacts') && quote.clientContacts.map(({ firstName, surname }) => firstName + surname).includes(this.user.firstName + this.user.surname )})
      },
      myFilteredProjects() {
		    return this.projects.filter(project => project.hasOwnProperty('clientContacts') && project.clientContacts.map(({ _id }) => _id).includes(this.user._id ))
      },
      myFilteredRequest() {
		    return this.clientRequests.filter(request => request.hasOwnProperty('clientContacts') && request.clientContacts.map(({ _id }) => _id).includes(this.user._id ))
      }
		},
    created() {
      this.setOpenProjects()
      this.setOpenQuotes()
      this.setOpenRequests()
    },
    components: {
      Button,
			// Table,
      AllOpenRequests,
      MyOpenRequests,
      AllOpenQuotes,
      MyOpenQuotes,
      AllOpenProjects,
      MyOpenProjects
		},
  }

</script>

<style lang="scss" scoped>
.swapper {
  width: 500px;
  text-align: center;
  padding: 20px;
  border: 1px solid #333;
  font-size: 18px;
  margin-bottom: 50px;

  &__button {
    margin-top: 15px;
  }
}

.dashboard {
  width: 1530px;
  //margin: 50px;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 35px;
    flex-wrap: wrap;
  }

  .col {
    width: 750px;
    padding: 10px 20px 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    box-sizing: border-box;
    background-color: white;
    border-radius: 4px;
    position: relative;
    align-self: baseline;
  }
}

@media (max-width: 1860px) {
  .dashboard {
    width: 750px;
  }
  .row .col:first-child {
    margin-bottom: 35px;
  }
}

</style>
