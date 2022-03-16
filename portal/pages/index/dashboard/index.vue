<template lang="pug">
  .dashboard(v-if="Object.keys(client).length && client")
    .row
      .col
        AllOpenRequests(:client="client" :allRequests="clientRequests")
      .col
        MyOpenRequests(:client="client" :myRequests="myFilteredRequest")
    .row
      .col
        AllOpenQuotes(:client="client" :allQuotes="openQuotes")
      .col
        MyOpenQuotes(:client="client" :myQuotes="myFilteredQuotes")
    .row
      .col
        AllOpenProjects(:client="client" :allProjects="projects")
      .col
        MyOpenProjects(:client="client" :myProjects="myFilteredProjects")
    .swapper
      .swapper__button
        Button(:value="'Archive'" @clicked="goToAnotherPortal")
      .swapper__text If you cannot see your project(s), please click on the button below to be redirected.
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
    return {
      projects: [],
      clientRequests: [],
      openQuotes: [],
      extraQuotes: []
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    goToAnotherPortal() {
      const redirectTo = `https://archive-portal.pangea.global`
      let [ cookieValue ] = document.cookie.split(';').filter(i => i.includes('client'))
      let [ key, token ] = cookieValue.split('=')
      const today = moment(new Date()).format('DD MMM YYYY')
      document.cookie = `client=${ token }; path=/; expires=Thu, ${ today } 22:00:00 UTC; domain=.pangea.global`
      window.location.replace(redirectTo)
    },
    // async makeQuoteAction({ _id, status }) {
    //   const quote = this.openQuotes.find((quote) => quote._id === _id)
    //   try {
    //     await this.updateQuoteStatus({ quote, key: status })
    //   } catch (err) {
    //   }
    // },
    async getDashboardProject() {
      try {
        this.projects = (await this.$axios.get(`/portal/open-projects?token=${ this.token }`)).data
        this.clientRequests = (await this.$axios.get(`/portal/open-requests?token=${ this.token }`)).data
        this.openQuotes = (await this.$axios.get(`/portal/open-quotes?token=${ this.token }`)).data
        this.extraQuotes = (await this.$axios.get(`/portal/extra-quotes?token=${ this.token }`)).data.filter(item => !item.minimumCharge.isUsed)
      } catch (err) {
        this.alertToggle({ message: 'Internal Error', isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo",
      client: "getClientInfo",
      token: "getToken"
    }),
    myFilteredQuotes() {
      if (!this.openQuotes && !this.extraQuotes) return []
      const quotes = this.openQuotes.filter(quote => quote.hasOwnProperty('clientContacts') && quote.clientContacts.map(({ _id }) => _id).includes(this.user._id))
      return [ ...this.extraQuotes, ...quotes ]
    },
    myFilteredProjects() {
      if (!this.projects) return []
      return this.projects.filter(project => project.hasOwnProperty('clientContacts') && project.clientContacts.map(({ _id }) => _id).includes(this.user._id))
    },
    myFilteredRequest() {
      if (!this.clientRequests) return []
      return this.clientRequests.filter(request => request.hasOwnProperty('clientContacts') && request.clientContacts.map(({ _id }) => _id).includes(this.user._id))
    }
  },
  async created() {
    await this.getDashboardProject()
  },
  components: {
    Button,
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
  padding: 10px 25px;
  border: 1px solid $border;
  display: flex;
  font-size: 14px;
  align-items: center;
  box-sizing: border-box;
  gap: 25px;
}

.dashboard {
  //width: 1530px;

  .row {
    display: flex;
    margin-bottom: 25px;
    flex-wrap: wrap;
    gap: 25px;
  }

  .col {
    width: 775px;
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
