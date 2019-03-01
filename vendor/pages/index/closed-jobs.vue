<template lang="pug">
  .vendor_portal_wrapper
    .jobs_block
      h3 Closed Jobs
      .jobs
        .dropItem
          .dropItem__filters
            .filterBlock
              .filterBlock__item.sourceLangs
                label.inner-label Job Type:
                .filters__drop-menu.job-type
                  JobTypeSelect(
                    :jobs="jobs"
                    :selectedInd="jobTypeFilter"
                    @setJobTypeFilter="(option) => setFilter(option, 'jobTypeFilter')"
                  )
            .filterBlock
              .filterBlock__item.deadline
                label.inner-label Start Date
                input.calendar(type="text" :value="startFilter")
                img(src="../../assets/images/calendar.png" @click="showDetailedCalendar")
              Calendar(v-if="currentFormVisible" @dateFilter='requestOnFilterStartDate')
            .filterBlock
              .filterBlock__item.deadline
                label.inner-label Deadline
                input.calendar(type="text" :value="deadFilter")
                img(src="../../assets/images/calendar.png" @click="showDetailedCalendarOther")
              Calendar(v-if="currentFormVisibleOther" @dateFilter='requestOnFilterDeadLine' :class="{switcher: currentFormVisibleOther}")
            .filterBlock
              .filterBlock__item.targetLangs
                label.inner-label Invoice Date
                .filters__drop-menu.invoice-date
                  InvoiceDateSelect(
                    :jobs="jobs"
                    :selectedInd="invoiceDateFilter"
                    @setInvoiceDateFilter="(option) => setFilter(option, 'invoiceDateFilter')"
                  )
        .jobs__table
          DataTable(
          :fields="fields"
            :tableData="filteredJobs"
              :errors="errors"
              :areErrors="areErrors"
              :isApproveModal="isDeleting"
          bodyClass="tbody_height-200"
          rowClass="tbody_row_width-875"
            @closeErrors="closeErrors"
              @approve="rejectJob"
              @notApprove="setDefaults"
              @closeModal="setDefaults"
              :jobTypeFilter="jobTypeFilter"
          )
            template(slot="headerProjectId" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerProjectName" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerType" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerDeadLine" slot-scope="{ field }")
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
              .jobs__data(v-if="currentActive !== index") {{ row.type }}
            template(slot="deadLine" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.deadLine }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.amount }}
            template(slot="invoiceDate" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.invoiceDate }}
</template>

<script>
  import moment from 'moment';
  import DataTable from "~/components/Tables/DataTable";
  import Calendar from "~/components/Calendar";
  import InvoiceDateSelect from "../components/jobs/Tables/Closed_Jobs/InvoiceDateSelect.vue";
  import JobTypeSelect from "../components/jobs/Tables/Closed_Jobs/JobTypeSelect.vue";

  export default {
    data() {
      return {
        fields: [
          {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "22%", padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: "14%", padding: "0"},
          {label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "17%", padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "18%", padding: "0"},
          {label: "Invoice date", headerKey: "headerInvoiceDate", key: "invoiceDate", width: "16%", padding: "0"},
        ],
        jobs: [{
          "type": "Translation",
          "username": "illy.dim",
          "deadLine": "11 Dec 2018",
          "startDate": "01 Apr 2017",
          "projectId": "2018 04 11 [27]",
          "projectName": "Market resources(Updated)",
          "amount": "1000 €",
          "invoiceDate": "May 2018",
        },
          {
            "type": "QA",
            "username": "kriti.chris",
            "deadLine": "11 Dec 2018",
            "startDate": "15 Jan 2018",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "gender": "FEMALE",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          },
          {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Dec 2018",
            "startDate": "05 Dec 2018",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "31 Dec 2018",
            "startDate": "09 Dec 2018",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Jan 2018",
            "startDate": "15 Nov 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Nov 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Aug 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Aug 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Aug 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Apr 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Apr 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "June 2018",
          }, {
            "type": "Proofing",
            "username": "admin",
            "deadLine": "11 Apr 2018",
            "startDate": "15 Dec 2017",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "invoiceDate": "August 2018",
          },
        ],
        isTableDropMenu: true,
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,
        deleteIndex: -1,

        sourceJobTypeFilter: '',
        targetInvoiceDateFilter: '',
        openSourceJobTypes: false,
        openTargetInvoiceDate: false,
        startDateFilter: {from: "", to: ""},
        deadLineFilter: {from: "", to: ""},
        currentFormVisible: false,
        currentFormVisibleOther: false,


        jobTypeFilter: {type: "All"},
        invoiceDateFilter: {invoiceDate: "All"},
        filteredJobs: []
      }
    },
    methods: {
      closeErrors() {
        this.areErrors = false;
      },
      setDefaults() {
        return true
      },
      async getJobs() {
        try {
          // const result = await this.$axios.$get("/jobs");
        } catch (err) {
          // this.alertToggle({message: err.message, isShow: true, type: "error"});
        }
      },
      rejectJob() {
        console.log('reject job');
      },
      isActive(key, index) {
        // if (this.currentActive === index) {
        //   return key !== "edit";
        // }
        // if (this.currentActive !== index) {
        //   return key !== "save" && key !== "cancel";
        // }
        return true;
      },
      async checkErrors(index) {

      },
      async makeAction(index, key) {
        console.log('clicked:', index, key);
      },


      jobTypeOpen() {
        this.openSourceJobTypes = !this.openSourceJobTypes;
        console.log('job type dropdown open', this.openSourceJobTypes);
      },
      chooseSourceJobTypes(data) {
        this.sourceJobTypeFilter = data;
        this.openSourceJobTypes = false;


        console.log('choose job type');
      },
      chooseInvoiceDate(data) {
        this.targetInvoiceDateFilter = data;
        this.openTargetInvoiceDate = false;
      },
      showDetailedCalendar() {
        this.currentFormVisible = !this.currentFormVisible;
        if (this.currentFormVisible) {
          this.currentFormVisibleOther = false;
        }
      },
      showDetailedCalendarOther() {
        this.currentFormVisibleOther = !this.currentFormVisibleOther;
        if (this.currentFormVisibleOther) {
          this.currentFormVisible = false;
        }
      },
      requestOnFilterStartDate(data) {
        this.startDateFilter = {from: data.from, to: data.to};
        this.filterJobs();
        this.currentFormVisible = false;
      },
      requestOnFilterDeadLine(data) {
        this.deadLineFilter = {from: data.from, to: data.to};
        this.filterJobs();
        this.currentFormVisibleOther = false;

      },
      targetInvoiceDateOpen() {
        this.openTargetInvoiceDate = !this.openTargetInvoiceDate;
        console.log('invoice date dropdown open', this.openTargetInvoiceDate);
      },


      /*methods from another select*/
      setFilter({option}, prop) {
        this[prop] = option;
        this.filterJobs();
      },
      filterJobs() {
        this.filteredJobs = this.jobs;

        if (this.jobTypeFilter && this.jobTypeFilter.type !== 'All') {
          this.filteredJobs = this.filteredJobs.filter(item => item.type === this.jobTypeFilter.type)
        }

        if (this.invoiceDateFilter && this.invoiceDateFilter.invoiceDate !== 'All') {
          this.filteredJobs = this.filteredJobs.filter(item => item.invoiceDate === this.invoiceDateFilter.invoiceDate)
        }

        if (this.deadLineFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.deadLine).format() >= moment(this.deadLineFilter.from).format()) && (moment(item.deadLine).format() <= moment(this.deadLineFilter.to).format())))
        }

        if (this.startDateFilter.from) {
          this.filteredJobs = this.filteredJobs.filter(item => ((moment(item.startDate).format() >= moment(this.startDateFilter.from).format()) && (moment(item.startDate).format() <= moment(this.startDateFilter.to).format())))
        }
      },
    },
    computed: {
      startFilter() {
        let result = "";
        if (this.startDateFilter.from) {
          result = moment(this.startDateFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.startDateFilter.to).format('DD-MM-YYYY');
        }
        return result
      },
      deadFilter() {
        let result = "";
        if (this.deadLineFilter.from) {
          result = moment(this.deadLineFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.deadLineFilter.to).format('DD-MM-YYYY');
        }
        return result
      },
    },
    components: {
      DataTable,
      Calendar,
      JobTypeSelect,
      InvoiceDateSelect
    },
    created() {
      this.filteredJobs = this.jobs;
    },
    mounted() {
      this.getJobs();
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/colors.scss';

  .filters {
    &__drop-menu {
      position: relative;
      z-index: 1;
      &.invoice-date {
        width: 117px;
        height: 28px;
      }
      &.job-type {
        width: 125px;
        height: 28px;
      }

    }
  }

  .switcher {
    position: absolute;
    top: 85px;
    left: 100px;
    z-index: 5;
    @media screen and (max-width: 1580px) {
      left: 0;
    }
    @media screen and (max-width: 1515px) {
      left: -150px;
    }
  }

  .dropItem {
    width: 100%;
    &__filters {
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      .filterBlock {
        width: 25%;
        position: relative;
        &__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          .inner-label {
            margin-bottom: 0;
          }
          input, span {
            /*padding: 5px;*/
            border: 1px solid #67573e;
            width: 175px;
            height: 20px;
            border-radius: 4px;
          }
          input.calendar {
            width: 128px;
            height: 28px;
            padding: 0 4px;
          }
          span {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            img {
              position: absolute;
              top: 0px;
              right: 0;
              background-color: white;
              padding: 8px;
            }
            .reverseImage {
              transform: rotate(180deg);
            }
          }
          .selector {
            display: flex;
            position: relative;
            &__drop {
              position: absolute;
              background-color: white;
              max-height: 150px;
              overflow: auto;
              right: 0;
              top: 32px;
              width: 99%;
              z-index: 2;
              border: 1px solid #67573e;
              padding-bottom: 5px;
            }
          }
        }
        .request, .deadline {
          position: relative;
          img {
            position: absolute;
            width: 19px;
            right: 2px;
            padding: 4px;
            background-color: white;
            cursor: pointer;
          }
        }
        .status {
          justify-content: flex-start;
          label {
            margin-right: 10px;
          }
        }
      }
      .filterBlock:not(:last-child) {
        margin-right: 10px;
      }
    }
  }

  .vendor_portal_wrapper {
    width: 100%;
    padding: 30px;

    .jobs_block {
      color: $main-color;

      .jobs {
        width: 892px;
        /*height: 243px;*/
        height: auto;
        background-color: $white;
        box-shadow: 0 0 10px $main-color;
        box-sizing: border-box;
        padding: 3px 0;

        &__table {
          width: 875px;
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
