<template lang="pug">
  .closed-jobs
    .jobs_block
      h3 Completed Jobs
      .jobs
        Filters(
          :startFilter="startFilter"
          :deadFilter="deadFilter"
          :invoiceDateFilter="invoiceDateFilter"
          :jobTypeFilter="jobTypeFilter"
          @setJobTypeFilter="setJobTypeFIlter"
          @setInvoiceDateFilter="(option) => setFilter(option, 'invoiceDateFilter')"
          @requestOnFilterStartDate="requestOnFilterStartDate"
          @requestOnFilterDeadline="requestOnFilterDeadline"
        )
        .jobs__table
          DataTable(
            :fields="tableFields"
            :tableData="completedJobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            :bodyClass="completedJobs.length < 7 ? 'tbody_height-200 tbody_visible-overflow' : 'tbody_height-200'"
            :tableHeadRowClass="completedJobs.length < 7 ? 'tbody_visible-overflow' : ''"
            @closeErrors="closeErrors"
            @onRowClicked="chooseJob"
          )
            template(slot="headerJobId" slot-scope="{ field }")
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
            template(slot="jobId" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.stepId }}
            template(slot="projectName" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectName }}
            template(slot="type" slot-scope="{ row, index }")
              .jobs__data {{ row.name }}
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
  import Filters from "../../components/jobs/Tables/Completed_Jobs/Filters";
  import { mapGetters, mapActions } from "vuex";
  import tableFields from "~/mixins/tableFields";

  export default {
    mixins: [tableFields],
    data() {
      return {
        fields: [
          {label: "Job ID", headerKey: "headerJobId", key: "jobId", width: Math.floor(1042*0.18), padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: Math.floor(1042*0.22), padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: Math.floor(1042*0.14), padding: "0"},
          {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: Math.floor(1042*0.18), padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: Math.floor(1042*0.14), padding: "0"},
          {label: "Invoice date", headerKey: "headerInvoiceDate", key: "invoiceDate", width: 0, padding: "0"},
        ],
        tableWidth: 1042,
        isTableDropMenu: true,
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,
        deleteIndex: -1,
        startDateFilter: {from: "", to: ""},
        deadlineFilter: {from: "", to: ""},
        jobTypeFilter: "All",
        invoiceDateFilter: "All"
      }
    },
    methods: {
      ...mapActions({
        getJobs: "getJobs",
        selectJob: "selectJob",
        alertToggle: "alertToggle"
      }),
      chooseJob({index}) {
        this.selectJob(this.completedJobs[index]);
        this.$router.push(`/completed-jobs/project-details/${this.completedJobs[index]._id}`);
      },
      closeErrors() {
        this.areErrors = false;
      },
      setDefaults() {
        return true
      },
      async checkErrors(index) {

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
      setJobTypeFIlter({step}) {
        this.jobTypeFilter = step.title || step;
        if(step !== 'All') {
            this.filterJobs = this.completedJobs.filter(item => item.serviceStep.symbol === step.symbol);
        } else {
            this.filteredJobs = this.completedJobs;    
        }
      },

      filterJobs() {
        this.filteredJobs = this.completedJobs;

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
      },
      completedJobs() {
        let result = [];
        if(this.jobs.length) {
          result = this.jobs.filter(job => job.status === "Completed" || job.status === "Cancelled" ||job.status === "Cancelled Halfway");
        }
        return result;
      }
    },
    components: {
      DataTable,
      Filters
    },
     mounted() {
      this.getJobs();
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
        width: 1062px;
        height: auto;
        background-color: $white;
        box-shadow: 0 0 10px $main-color;
        box-sizing: border-box;
        padding-top: 15px;

        &__table {
          width: 1042px;
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
