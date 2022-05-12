<template lang="pug">
  .wrapper
    .navbar
      .navbar__logo
        img(src="../assets/images/latest-version/navbar-logo.svg")
      .navbar__menu
        Menu(:elements="elements" :path='path')
      .navbar__name
        .navbar__name-title ADMIN PORTAL

    .content(v-if="user._id")
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
              name: 'Pipeline',
              path: `/pangea-dashboard/pipeline`
            },
            {
              type: 'link',
              name: 'Activities',
              path: '/pangea-dashboard/activities'
            },
            {
              type: 'link',
              name: 'Finance',
              path: '/pangea-dashboard/finance'
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
              path: '/pangea-vendors/all-vendors/All/Default_View'
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
              path: '/pangea-projects/all-projects/All/Default_View'
            },
            {
              name: 'Quotes',
              type: 'title'
            },
            {
              type: 'link',
              name: 'Draft',
              path: '/pangea-projects/draft-projects/Draft/Default_View'
            },
            {
              type: 'link',
              name: 'Cost Quote',
              path: '/pangea-projects/cost-quote-projects/Cost_Quote/Default_View'
            },
            {
              type: 'link',
              name: 'Quote Sent',
              path: '/pangea-projects/quote-sent-projects/Quote_sent/Default_View'
            },
            {
              name: 'In Progress',
              type: 'title'
            },
            {
              type: 'link',
              name: 'In Progress',
              path: '/pangea-projects/in-progress-projects/In_progress/Default_View'
            },
            {
              type: 'link',
              name: 'Approved',
              path: '/pangea-projects/approved-projects/Approved/Default_View'
            },
            {
              type: 'link',
              name: 'Rejected',
              path: '/pangea-projects/rejected-projects/Rejected/Default_View'
            },
            {
              name: 'Closed',
              type: 'title'
            },
            {
              type: 'link',
              name: 'Closed',
              path: '/pangea-projects/closed-projects/Closed/Default_View'
            },
            {
              type: 'link',
              name: 'Cancelled',
              path: '/pangea-projects/cancelled-projects/Cancelled/Default_View'
            },
            {
              type: 'link',
              name: 'Cancelled Halfway',
              path: '/pangea-projects/cancelled-halfway-projects/Cancelled_Halfway/Default_View'
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
            {
              type: 'group',
              path: 'payables-reports',
              name: 'Payables',
              isOpen: false,
              children: [
                {
                  type: 'link',
                  path: '/pangea-finance/payables-reports/reports',
                  name: 'Reports'
                },
                {
                  type: 'link',
                  path: '/pangea-finance/payables-reports/paid-reports',
                  name: 'Paid Reports'
                },
                {
                  type: 'link',
                  path: '/pangea-finance/payables-reports/create-reports',
                  name: 'Add Reports'
                }
              ]

            },
            {
              type: 'group',
              path: 'receivables-reports',
              name: 'Receivables',
              isOpen: false,
              children: [
                {
                  type: 'link',
                  path: '/pangea-finance/receivables-reports/reports',
                  name: 'Reports'
                },
                {
                  type: 'link',
                  path: '/pangea-finance/receivables-reports/invoice',
                  name: 'Invoice'
                },
                {
                  type: 'link',
                  path: '/pangea-finance/receivables-reports/create-reports',
                  name: 'Add Reports'
                },
                {
                  type: 'link',
                  path: '/pangea-finance/receivables-reports/create-invoice',
                  name: 'Add Invoice'
                }
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
              name: 'Services / Steps / Units',
              path: '/pangea-settings/services'
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
              name: 'Payment Methods',
              path: '/pangea-settings/payment-methods'
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
            },
            {
              type: 'link',
              name: 'Company',
              path: '/pangea-settings/company'
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
      // setVendorsForOption: 'setVendorsForOption',
      // setClientsForOption: 'setClientsForOption'
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
      userGroup: "getUserGroup",
      currentRequests: 'getRequestCounter'
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
    // this.setVendorsForOption()
    // this.setClientsForOption()
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
  width: 255px;
  z-index: 99999;
  box-sizing: border-box;
  background: white;
  border-right: 1px solid $light-border;

  &__name {
    text-align: center;
    font-size: 19px;
    border-top: 1px solid $border;
    padding-top: 26px;
    cursor: default;
    position: relative;
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
    width: 190px;

    img {
      width: 100%;
    }
  }
}

.content {
  width: 100%;
  min-width: fit-content;
  margin-left: 255px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

</style>
