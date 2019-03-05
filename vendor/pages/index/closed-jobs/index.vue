<template lang="pug">
  .closed-jobs
    .jobs_block
      h3 Closed Jobs
      .jobs
        Filters(
          :startFilter="startFilter"
          :deadFilter="deadFilter"
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
            @closeErrors="closeErrors"
            @onRowClicked="chooseJob"
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
              .jobs__data(v-if="currentActive !== index") {{ formatDeadline(row.deadline) }}
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
        jobTypeFilter: "All",
        invoiceDateFilter: "All",
        filteredJobs: [],
        fakeJobs: [],
        closedJobs: [],
      }
    },
    methods: {
      ...mapActions({
        getJobs: "getJobs",
        selectJob: "selectJob",
        alertToggle: "alertToggle"
      }),
      chooseJob({index}) {
        this.selectJob(this.tableData[index]);
        this.$router.push("/closed-jobs/project-details");
      },
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
        if (data.isTouched) {
          this.startDateFilter = {from: data.from, to: data.to};
          this.filterJobs();
        }
        this.currentFormVisible = false;
      },
      requestOnFilterDeadline(data) {
        if (data.isTouched) {
          this.deadlineFilter = {from: data.from, to: data.to};
          this.filterJobs();
        }
        this.currentFormVisibleOther = false;

      },

      setFilter({option}, prop) {
        this[prop] = option;
        this.filterJobs();
      },

      filterJobs() {
        this.filteredJobs = this.closedJobs;

        if (this.jobTypeFilter && this.jobTypeFilter !== 'All' && this.jobTypeFilter !== 'QA') {
          if (this.jobTypeFilter === 'Translation') {
            this.filteredJobs = this.filteredJobs.filter(item => item.name === 'translate1')
          } else if (this.jobTypeFilter === 'Proofing') {
            this.filteredJobs = this.filteredJobs.filter(item => item.name === 'correct1')
          }
        }

        if (this.invoiceDateFilter && this.invoiceDateFilter !== 'All') {
          this.filteredJobs = this.filteredJobs.filter(item => item.invoiceDate === this.invoiceDateFilter)
        }

        if (this.deadlineFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.deadline).format() >= moment(this.deadlineFilter.from).format()) && (moment(item.deadline).format() <= moment(this.deadlineFilter.to).format())))
        }

        if (this.startDateFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.start).format() >= moment(this.startDateFilter.from).format()) && (moment(item.start).format() <= moment(this.startDateFilter.to).format())))
        }
      },
      formatDeadline(date) {
        if (date) {
          return moment(date).format('DD-MMM-YYYY')
        }
        return ''
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
      this.closedJobs = this.jobs.filter((job) => job.status === "Closed");

      // this.fakeJobs = [{"finance":{"Wordcount":{"receivables":2,"payables":2},"Price":{"receivables":"0.16","payables":"0.14"}},"vendorsClickedOffer":[],"_id":"5c7932cc1651893b02b06c18","taskId":"2019 03 01 [02] T01","name":"translate1","source":"EN-GB","target":"ZH-MO","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"2019-03-01T13:24:59.832Z","deadline":"","progress":{"wordsTotal":2,"wordsToBeDone":2,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Closed","receivables":"","payables":"","clientRate":0.08,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 01 [02]","projectName":"Viktor","xtmJobId":29080},{"finance":{"Wordcount":{"receivables":2,"payables":2},"Price":{"receivables":"0.03","payables":"0.14"}},"vendorsClickedOffer":[],"_id":"5c7932cc1651893b02b06c17","taskId":"2019 03 01 [02] T01","name":"correct1","source":"EN-GB","target":"ZH-MO","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"","deadline":"2019-03-29T13:24:00.000Z","progress":{"wordsTotal":2,"wordsToBeDone":2,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Closed","receivables":"","payables":"","clientRate":0.017,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 01 [02]","projectName":"Viktor","xtmJobId":29080},{"finance":{"Wordcount":{"receivables":6,"payables":6},"Price":{"receivables":"0.48","payables":"0.42"}},"vendorsClickedOffer":[],"_id":"5c7ce2bcd81d4e50261e1be9","taskId":"2019 03 04 [01] T01","name":"translate1","source":"EN-GB","target":"AR-EG","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"2019-03-04T08:31:48.093Z","deadline":"","progress":{"wordsTotal":6,"wordsToBeDone":6,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Closed","receivables":"","payables":"","clientRate":0.08,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 04 [01]","projectName":"Monday_test","xtmJobId":29637},{"finance":{"Wordcount":{"receivables":6,"payables":6},"Price":{"receivables":"0.10","payables":"0.42"}},"vendorsClickedOffer":[],"_id":"5c7ce2bcd81d4e50261e1be8","taskId":"2019 03 04 [01] T01","name":"correct1","source":"EN-GB","target":"AR-EG","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"","deadline":"2019-03-28T08:31:00.000Z","progress":{"wordsTotal":6,"wordsToBeDone":6,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Created","receivables":"","payables":"","clientRate":0.017,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 04 [01]","projectName":"Monday_test","xtmJobId":29637},{"finance":{"Wordcount":{"receivables":6,"payables":6},"Price":{"receivables":"0.48","payables":"0.42"}},"vendorsClickedOffer":[],"_id":"5c7ce396d81d4e50261e1bf4","taskId":"2019 03 04 [02] T01","name":"translate1","source":"EN-GB","target":"RO","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"2019-03-04T08:35:40.958Z","deadline":"2019-03-29T08:35:00.000Z","progress":{"wordsTotal":6,"wordsToBeDone":6,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Accepted","receivables":"","payables":"","clientRate":0.08,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 04 [02]","projectName":"Monday2","xtmJobId":29678},{"finance":{"Wordcount":{"receivables":6,"payables":6},"Price":{"receivables":"0.10","payables":"0.42"}},"vendorsClickedOffer":[],"_id":"5c7ce396d81d4e50261e1bf3","taskId":"2019 03 04 [02] T01","name":"correct1","source":"EN-GB","target":"RO","vendor":{"firstName":"asda-default","surname":"gfglk","email":"asda@ddf.com","_id":"5c7930dc1651893b02b062c2"},"start":"2019-03-29T08:35:00.000Z","deadline":"2019-06-15T08:35:00.000Z","progress":{"wordsTotal":6,"wordsToBeDone":6,"wordsDone":0,"wordsToBeChecked":0,"wordsToBeCorrected":0},"status":"Request Sent","receivables":"","payables":"","clientRate":0.017,"vendorRate":0.07,"margin":"","check":false,"projectId":"2019 03 04 [02]","projectName":"Monday2","xtmJobId":29678}];


      // this.fakeJobs = [{
      //   "type": "Translation",
      //   "name": "translate1",
      //   "status": "Closed",
      //   "username": "illy.dim",
      //   "deadline": "11 Dec 2018",
      //   "startDate": "01 Apr 2017",
      //   "start": "01 Apr 2017",
      //   "projectId": "2018 04 11 [27]",
      //   "projectName": "Market resources(Updated)",
      //   "amount": "1000 €",
      //   "invoiceDate": "May 2018",
      //   "finance":{
      //     "Price":{
      //       "payables": 10
      //     }
      //   }
      // },
      //   {
      //     "type": "QA",
      //     "name": "translate1",
      //     "status": "Closed",
      //     "username": "kriti.chris",
      //     "deadline": "11 Dec 2018",
      //     "startDate": "15 Jan 2018",
      //     "start": "15 Jan 2018",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "gender": "FEMALE",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   },
      //   {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Closed",
      //     "username": "admin",
      //     "deadline": "24 Nov 2018",
      //     "startDate": "05 Dec 2018",
      //     "start": "05 Dec 2018",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Closed",
      //     "username": "admin",
      //     "deadline": "23 Dec 2018",
      //     "startDate": "09 Dec 2018",
      //     "start": "09 Dec 2018",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Request Sent",
      //     "username": "admin",
      //     "deadline": "11 Jan 2018",
      //     "startDate": "15 Nov 2017",
      //     "start": "15 Nov 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Closed",
      //     "username": "admin",
      //     "deadline": "11 Nov 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Created",
      //     "username": "admin",
      //     "deadline": "11 Aug 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Created",
      //     "username": "admin",
      //     "deadline": "11 Aug 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Created",
      //     "username": "admin",
      //     "deadline": "11 Aug 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Created",
      //     "username": "admin",
      //     "deadline": "11 Apr 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Created",
      //     "username": "admin",
      //     "deadline": "11 Apr 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "June 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   }, {
      //     "type": "Proofing",
      //     "name": "correct1",
      //     "status": "Accepted",
      //     "username": "admin",
      //     "deadline": "11 Apr 2018",
      //     "startDate": "15 Dec 2017",
      //     "start": "15 Dec 2017",
      //     "projectId": "2018 04 11 [27]",
      //     "projectName": "Market resources(Updated)",
      //     "amount": "1000 €",
      //     "invoiceDate": "August 2018","finance":{
      //       "Price":{
      //         "payables": 10
      //       }
      //     }
      //   },
      // ];
      // this.closedJobs = this.fakeJobs.filter((job) => job.status === "Closed");
      this.filteredJobs = this.closedJobs;

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
          width: 1027px;
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
