<template lang="pug">
  .jobs__table
    DataTable(
      :fields="tableFields"
      :tableData="jobs"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      bodyClass="tbody_height-200"
      @closeErrors="closeErrors"
      @onRowClicked="chooseJob"
    )
      template(slot="headerJobId" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerProjectName" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerType" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerStatus" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerProgress" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerDeadLine" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerAmount" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerIcons" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="jobId" slot-scope="{ row, index }")
        .jobs__data {{ row.stepId }}
      template(slot="projectName" slot-scope="{ row, index }")
        .jobs__data {{ row.projectName }}
      template(slot="type" slot-scope="{ row, index }")
        .jobs__data(v-if="row.name === 'translate1'") Translation
        .jobs__data(v-else) Proofing
      template(slot="status" slot-scope="{ row, index }")
        .jobs__data {{ row.status }}
      template(slot="progress" slot-scope="{ row, index }")
        .jobs__data
          ProgressLine(:progress="progress(row.progress)")
      template(slot="deadLine" slot-scope="{ row, index }")
        .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
      template(slot="amount" slot-scope="{ row, index }")
        .jobs__data {{ row.finance.Price.payables }}
          span.jobs__currency(v-if="row.finance.Price.payables") &euro;
      template(slot="icons" slot-scope="{ row, index }")
        .jobs__icons(v-if="!isApproveReject(row)")
          img.jobs__icon(v-if="isCompleteIcon(row)" src="../../../../../assets/images/complete-icon_small.png" @click.stop="showModal(index)")
          img.jobs__icon(v-if="isEnterIcon(row.status)" src="../../../../../assets/images/enter-icon.png")
        .jobs__icons(v-else)
          img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :title="key")
</template>

<script>
  import DataTable from "~/components/Tables/DataTable";
  import ProgressLine from "~/components/ProgressLine";
  import moment from "moment";
  import ClickOutside from "vue-click-outside";
  import { mapGetters, mapActions } from "vuex";
  import tableFields from "~/mixins/tableFields";

  export default {
    mixins: [tableFields],
    props: {
      jobs: {
        type: Array
      },
    },
    data(){
      return {
        fields: [
          {label: "Job ID", headerKey: "headerJobId", key: "jobId", width: Math.floor(1042*0.16), padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: Math.floor(1042*0.18), padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: Math.floor(1042*0.1), padding: "0"},
          {label: "Status", headerKey: "headerStatus", key: "status", width: Math.floor(1042*0.12), padding: "0"},
          {label: "Progress", headerKey: "headerProgress", key: "progress", width: Math.floor(1042*0.1), padding: "0"},
          {label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: Math.floor(1042*0.12), padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: Math.floor(1042*0.12), padding: "0"},
          {label: "Action", headerKey: "headerIcons", key: "icons", width: 0, padding: "0"},
        ],
        tableWidth: 1042,
        areErrors: false,
        errors: [],
        isDeleting: false,
        icons: {
          Approve: {icon: require("../../../../../assets/images/Approve-icon.png"), active: true},
          Reject: {icon: require("../../../../../assets/images/Reject-icon.png"), active: true}
        }
      }
    },
    methods:{
      ...mapActions({
        selectJob: "selectJob",
        alertToggle: "alertToggle"
      }),
      makeAction(index, key) {
        this.$emit('makeAction', {index, key});
      },
      chooseJob({index}) {
        this.selectJob(this.jobs[index]);
        this.$router.push(`/dashboard/project-details/${this.jobs[index]._id}`);
      },
      closeErrors() {
        this.areErrors = false;
      },
      formatDeadline(date) {
        return moment(date).format('DD-MMM-YYYY')
      },
      isApproveReject(row) {
        return row.status === "Request Sent" || row.status === "Created";
      },
      isEnterIcon(status) {
        const statuses = ["Accepted", "Ready to Start", "Started"];
        return statuses.indexOf(status) !== -1;
      },
      isCompleteIcon(row) {
        return this.progress(row.progress) >= 100 && row.status === "Started";
      },
      progress(prog) {
        return ((prog.wordsDone/prog.wordsTotal)*100).toFixed(2);
      },
      showModal(index) {
        this.$emit("showModal", { index });
      }
    },
    components: {
      DataTable,
      ProgressLine
    },
    directives: {
      ClickOutside
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.jobs {
  &__table {
    padding-top: 10px;
    width: 1042px;
    margin: 0 auto;
  }
  &__data {
    height: 32px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
  &__icons {
    padding-top: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  &__icon {
    cursor: pointer;
    margin-right: 8px;
    transition: transform 0.1s ease-out;
    &:hover {
      transform: scale(1.1);
    }
  }
  &_disable {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

</style>

