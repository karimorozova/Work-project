<template lang="pug">
  .closed-jobs
    .jobs_block
      h3 Closed Jobs
      .jobs
        Filters(
          :jobs="filteredJobs"
          :startFilter="startFilter"
          :deadFilter="deadFilter"
          :currentFormVisible="currentFormVisible"
          :currentFormVisibleOther="currentFormVisibleOther"
          :invoiceDateFilter="invoiceDateFilter"
          :jobTypeFilter="jobTypeFilter"
          @setJobTypeFilter="(option) => setFilter(option, 'jobTypeFilter')"
          @setInvoiceDateFilter="(option) => setFilter(option, 'invoiceDateFilter')"
          @requestOnFilterStartDate="requestOnFilterStartDate"
          @requestOnFilterDeadline="requestOnFilterDeadline"
        )
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="filteredJobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            bodyClass="tbody_height-200"
            /*rowClass="tbody_row_width-875"*/
            @closeErrors="closeErrors"
          )
            template(slot="headerProjectId" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerProjectName" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerType" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerDeadline" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerAmount" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerInvoiceDate" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="projectId" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectId }}
            template(slot="projectName" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectName }}
            template(slot="type" slot-scope="{ row, index }")
              .jobs__data(v-if="row.name === 'translate1'") Translation
              .jobs__data(v-else) Proofing
            template(slot="deadline" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.deadline }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.finance.Price.payables }}
                span.jobs__currency(v-if="row.finance.Price.payables") &euro;
            template(slot="invoiceDate" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.invoiceDate }}
    nuxt-child
</template>

<script>
  import moment from 'moment';
  import DataTable from "~/components/Tables/DataTable";
  import Filters from "../../components/jobs/Tables/Closed_Jobs/Filters";
  import { mapGetters, mapActions } from "vuex";

  export default {
    data() {
      return {
        fields: [
          {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "22%", padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: "14%", padding: "0"},
          {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "17%", padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "18%", padding: "0"},
          {label: "Invoice date", headerKey: "headerInvoiceDate", key: "invoiceDate", width: "16%", padding: "0"},
        ],
        isTableDropMenu: true,
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,
        deleteIndex: -1,
        startDateFilter: {from: "", to: ""},
        deadlineFilter: {from: "", to: ""},
        currentFormVisible: false,
        currentFormVisibleOther: false,
        jobTypeFilter: {type: "All"},
        invoiceDateFilter: {invoiceDate: "All"},
        filteredJobs: [],
        fakeJobs: [],
        closedJobs: [],
      }
    },
    methods: {
      ...mapActions({
        getJobs: "getJobs"
      }),
      closeErrors() {
        this.areErrors = false;
      },
      setDefaults() {
        return true
      },
      async checkErrors(index) {

      },
      async makeAction(index, key) {
        console.log('clicked:', index, key);
      },

      requestOnFilterStartDate(data) {
        this.startDateFilter = {from: data.from, to: data.to};
        this.filterJobs();
        this.currentFormVisible = false;
      },
      requestOnFilterDeadline(data) {
        this.deadlineFilter = {from: data.from, to: data.to};
        this.filterJobs();
        this.currentFormVisibleOther = false;

      },

      setFilter({option}, prop) {
        this[prop] = option;
        this.filterJobs();
      },

      filterJobs() {
        this.filteredJobs = this.closedJobs;

        if (this.jobTypeFilter && this.jobTypeFilter.type !== 'All') {
          this.filteredJobs = this.filteredJobs.filter(item => item.type === this.jobTypeFilter.type)
        }

        if (this.invoiceDateFilter && this.invoiceDateFilter.invoiceDate !== 'All') {
          this.filteredJobs = this.filteredJobs.filter(item => item.invoiceDate === this.invoiceDateFilter.invoiceDate)
        }

        if (this.deadlineFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.deadline).format() >= moment(this.deadlineFilter.from).format()) && (moment(item.deadline).format() <= moment(this.deadlineFilter.to).format())))
        }

        if (this.startDateFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.start).format() >= moment(this.startDateFilter.from).format()) && (moment(item.start).format() <= moment(this.startDateFilter.to).format())))
        }
      },
    },
    computed: {
      ...mapGetters({
        jobs: "getAllJobs"
      }),
      startFilter() {
        let result = "";
        if (this.startDateFilter.from) {
          result = moment(this.startDateFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.startDateFilter.to).format('DD-MM-YYYY');
        }
        return result
      },
      deadFilter() {
        let result = "";
        if (this.deadlineFilter.from) {
          result = moment(this.deadlineFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.deadlineFilter.to).format('DD-MM-YYYY');
        }
        return result
      }
    },
    components: {
      DataTable,
      Filters
    },
    mounted() {
      this.getJobs();
    //   console.log('jobs from store:', this.jobs);
      // this.closedJobs = this.jobs.filter((job) => job.status === "Closed");
      this.fakeJobs = [{
        "type": "Translation",
        "name": "translate1",
        "status": "Closed",
        "username": "illy.dim",
        "deadline": "11 Dec 2018",
        "startDate": "01 Apr 2017",
        "start": "01 Apr 2017",
        "projectId": "2018 04 11 [27]",
        "projectName": "Market resources(Updated)",
        "amount": "1000 €",
        "invoiceDate": "May 2018",
        "finance":{
          "Price":{
            "payables": 10
          }
        }
      },
        {
          "type": "QA",
          "name": "translate1",
          "status": "Closed",
          "username": "kriti.chris",
          "deadline": "11 Dec 2018",
          "startDate": "15 Jan 2018",
          "start": "15 Jan 2018",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "gender": "FEMALE",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        },
        {
          "type": "Proofing",
          "name": "correct1",
          "status": "Closed",
          "username": "admin",
          "deadline": "24 Nov 2018",
          "startDate": "05 Dec 2018",
          "start": "05 Dec 2018",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Closed",
          "username": "admin",
          "deadline": "23 Dec 2018",
          "startDate": "09 Dec 2018",
          "start": "09 Dec 2018",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Request Sent",
          "username": "admin",
          "deadline": "11 Jan 2018",
          "startDate": "15 Nov 2017",
          "start": "15 Nov 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Closed",
          "username": "admin",
          "deadline": "11 Nov 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Created",
          "username": "admin",
          "deadline": "11 Aug 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Created",
          "username": "admin",
          "deadline": "11 Aug 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Created",
          "username": "admin",
          "deadline": "11 Aug 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Created",
          "username": "admin",
          "deadline": "11 Apr 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Created",
          "username": "admin",
          "deadline": "11 Apr 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "June 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        }, {
          "type": "Proofing",
          "name": "correct1",
          "status": "Accepted",
          "username": "admin",
          "deadline": "11 Apr 2018",
          "startDate": "15 Dec 2017",
          "start": "15 Dec 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "August 2018","finance":{
            "Price":{
              "payables": 10
            }
          }
        },
      ];
      this.closedJobs = this.fakeJobs.filter((job) => job.status === "Closed");
      this.filteredJobs = this.closedJobs;

    //   console.log('filteredJobs:',this.filteredJobs);
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors.scss';

  .closed-jobs {
    width: 100%;
    padding: 30px;

    .jobs_block {
      color: $main-color;

      .jobs {
        width: 1047px;
        height: auto;
        background-color: $white;
        box-shadow: 0 0 10px $main-color;
        box-sizing: border-box;
        padding-top: 15px;

        &__table {
          // width: 875px;
          padding: 5px;
          margin: 0 auto;
        }

        position: relative;

        &__data, &__editing-data {
          height: 32px;
          padding: 0 5px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        &__editing-data, &__drop-menu {
          box-shadow: inset 0 0 7px $brown-shadow;
        }

        &__drop-menu {
          position: relative;
        }

        &__data-input {
          box-sizing: border-box;
          width: 100%;
          border: none;
          outline: none;
          color: $main-color;
        }

        &__icons {
          padding-top: 3px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        &__icon {
          cursor: pointer;
          opacity: 0.5;
          margin-right: 8px;
          transition: transform 0.1s ease-out;

          &:hover {
            transform: scale(1.2);
          }
        }

        &_opacity {
          opacity: 1;
        }
      }
    }

  }

</style>
