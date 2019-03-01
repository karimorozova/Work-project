<template lang="pug">
  .vendor_portal_wrapper
    .jobs_block
      h3 Upcoming Jobs
      .jobs
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="upcomingJobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            bodyClass="tbody_height-200"
            @closeErrors="closeErrors"
          )
            template(slot="headerProjectId" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerProjectName" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerType" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerStatus" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerDeadLine" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerAmount" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="projectId" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectId }}
            template(slot="projectName" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectName }}
            template(slot="type" slot-scope="{ row, index }")
              .jobs__data(v-if="row.name === 'translate1'") Translation
              .jobs__data(v-else) Proofing
            template(slot="status" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.status }}
            template(slot="deadLine" slot-scope="{ row, index }")
              .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.finance.Price.payables }}
                span.jobs__currency(v-if="row.finance.Price.payables") &euro;
            template(slot="icons" slot-scope="{ row, index }")
              .jobs__icons(v-if="row.status==='Request Sent'")
                img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)")
    .jobs_block
      h3 Open Jobs
      .jobs
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="openedJobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            bodyClass="tbody_height-200"
            @closeErrors="closeErrors"
            @onRowClicked="goToXtmEditor"
          )
            template(slot="headerProjectId" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerProjectName" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerType" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerStatus" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerDeadLine" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerAmount" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="projectId" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectId }}
            template(slot="projectName" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectName }}
            template(slot="type" slot-scope="{ row, index }")
              .jobs__data(v-if="row.name === 'translate1'") Translation
              .jobs__data(v-else) Proofing
            template(slot="status" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.status }}
            template(slot="deadLine" slot-scope="{ row, index }")
              .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.finance.Price.payables }}
                span.jobs__currency(v-if="row.finance.Price.payables") &euro;
            template(slot="icons" slot-scope="{ row, index }")
              .jobs__icons
                //- img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'jobs_opacity': isActive(key, index)}" :title="icon.type ==='approve' ? 'approve' : 'reject'")
</template>

<script>
  import DataTable from "~/components/Tables/DataTable";
  import { mapGetters, mapActions } from "vuex";
  import moment from "moment";

  export default {
    data() {
      return {
        fields: [
          {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "18%", padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: "14%", padding: "0"},
          {label: "Status", headerKey: "headerStatus", key: "status", width: "14%", padding: "0"},
          {label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "14%", padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "14%", padding: "0"},
          {label: "Action", headerKey: "headerIcons", key: "icons", width: "12%", padding: "0"},
        ],
        icons: [
          {icon: require("../../assets/images/Approve-icon.png"), active: true, type: "approve"},
          {icon: require("../../assets/images/Reject-icon.png"), active: true, type: "reject"}
        ],
        isTableDropMenu: true,
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,
        deleteIndex: -1
      }
    },
    methods: {
      ...mapActions({
        alertToggle: "alertToggle",
        getJobs: "getJobs",
        setJobStatus: "setJobStatus"
      }),
      async goToXtmEditor({index}) {
        try {
          const url = await this.$axios.get(`/xtm/editor?jobId=${this.openedJobs[index].xtmJobId}`);
          let link = document.createElement("a");
          link.target = "_blank";
          link.href = url.data;
          link.click();
        } catch(err) {
          this.alertToggle({message: err.response.data, isShow: true, type: "error"});
        }
      },
      closeErrors() {
        this.areErrors = false;
      },
      setDefaults() {
        return true
      },
      formatDeadline(date) {
        return moment(date).format('DD-MMM-YYYY')
      },
      rejectJob() {
        console.log('reject job');
      },
      isActive(key, index) {

        return true;
      },
      async checkErrors(index) {

      },
      async makeAction(index, key) {
        try {
          const status = key === "approve" ? "Accepted" : "Rejected";
          await this.setJobStatus({jobId: this.jobs[index]._id, status});
        } catch(err) {
          this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
        }
      }
    },
    computed: {
      ...mapGetters({
        jobs: "getAllJobs"
      }),
      upcomingJobs() {
        return this.jobs.filter(item => {
          if(item.status === "Request Sent" || item.status === "Created") {
            return item;
          }
        })
      },
      openedJobs() {
        return this.jobs.filter(item => {
          if(item.status === "In Progress" || item.status === "Accepted") {
            return item;
          }
        })
      }
    },
    components: {
      DataTable
    },
    mounted() {
      this.getJobs();
    }
  }
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors.scss';

.vendor_portal_wrapper {
  width: 100%;
  padding: 30px;

  .jobs_block {
    color: $main-color;

    .jobs {
      width: 1041px;
      max-height: 600px;
      background-color: $white;
      box-shadow: 0 0 10px $main-color;
      box-sizing: border-box;
      padding: 3px 0;

      &__table {
        padding-top: 10px;
        width: 1027px;
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
