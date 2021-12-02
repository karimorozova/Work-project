<template lang="pug">
  .dashboard(v-if="Object.keys(client).length && client")
    //V ==>
    //.swapper
    //  .swapper__text IF YOU CANNOT SEE YOUR PROJECT(S), PLEASE CLICK ON THE BUTTON BELOW TO BE REDIRECTED
    //  .swapper__button
    //    Button(:value="'Archive'" @clicked="goToAnotherPortal")
    //V <==
    .row
      .col
        AllOpenRequests(:client="client" :allRequests="clientRequests")
      .col
        MyOpenRequests(:client="client" :myRequests="myFilteredRequest")
    .row
      .col
        AllOpenQuotes(:client="client" :allQuotes="openQuotes" @changeQuoteStatus="makeQuoteAction")
      .col
        MyOpenQuotes(:client="client" :myQuotes="myFilteredQuotes")
    .row
      .col
        AllOpenProjects(:client="client" :allProjects="projects")
      .col
        MyOpenProjects(:client="client" :myProjects="myFilteredProjects")
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
import Button from "../../../components/pangea/Button"

export default {
  data() {
    return {}
  },
  methods: {
    ...mapActions({
      setOpenProjects: "setOpenProjects",
      setOpenRequests: "setOpenRequests",
      setOpenQuotes: "setOpenQuotes",
      getClient: "getClient"
    }),
    goToAnotherPortal() {
      const redirectTo = `https://portal.pangea.global`
      let [ cookieValue ] = document.cookie.split(';').filter(i => i.includes('client'))
      let [ key, token ] = cookieValue.split('=')
      const today = moment(new Date()).format('DD MMM YYYY')
      document.cookie = `client=${ token }; path=/; expires=Thu, ${ today } 22:00:00 UTC; domain=.pangea.global`
      window.location.replace(redirectTo)
    },
    getDetails({ index }, prop) {
      const id = this[prop][index]._id
      this.$router.push(`/dashboard/details/${ id }`)
    },
    async makeQuoteAction({ _id, status }) {
      const quote = this.openQuotes.find((quote) => quote._id === _id)
      try {
        await this.updateQuoteStatus({ quote, key: status })
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      projects: "getAllOpenProjects",
      user: "getUserInfo",
      clientRequests: "getAllOpenRequests",
      openQuotes: "getAllOpenQuotes",
      client: "getClientInfo"
    }),
    myFilteredQuotes() {
      return this.openQuotes.filter(quote => quote.hasOwnProperty('clientContacts') && quote.clientContacts.map(({ _id }) => _id).includes(this.user._id))
    },
    myFilteredProjects() {
      return this.projects.filter(project => project.hasOwnProperty('clientContacts') && project.clientContacts.map(({ _id }) => _id).includes(this.user._id))
    },
    myFilteredRequest() {
      return this.clientRequests.filter(request => request.hasOwnProperty('clientContacts') && request.clientContacts.map(({ _id }) => _id).includes(this.user._id))
    }
  },
  async created() {
    await this.setOpenProjects()
    await this.setOpenQuotes()
    await this.setOpenRequests()
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
  }
}

</script>

<style lang="scss" scoped>
@import "./assets/scss/colors";

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
    padding: 15px 25px 25px;
    box-shadow: $box-shadow;
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
