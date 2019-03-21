<template lang="pug">
  .jobs__table
    DataTable(
      :fields="fields"
      :tableData="jobs"
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
      template(slot="projectId" slot-scope="{ row, index }")
        .jobs__data {{ row.projectId }}
      template(slot="projectName" slot-scope="{ row, index }")
        .jobs__data {{ row.projectName }}
      template(slot="type" slot-scope="{ row, index }")
        .jobs__data(v-if="row.name === 'translate1'") Translation
        .jobs__data(v-else) Proofing
      template(slot="status" slot-scope="{ row, index }")
        .jobs__data {{ row.status }}
      template(slot="progress" slot-scope="{ row, index }")
        .jobs__data
          .jobs__progress-bar(v-if="progress(row.progress)")
            .jobs__progress-filler(:style="{width: progress(row.progress) + '%'}")
            span.jobs__progress-tooltip {{ progress(row.progress) }}%
      template(slot="deadLine" slot-scope="{ row, index }")
        .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
      template(slot="amount" slot-scope="{ row, index }")
        .jobs__data {{ row.finance.Price.payables }}
          span.jobs__currency(v-if="row.finance.Price.payables") &euro;
      template(slot="icons" slot-scope="{ row, index }")
        .jobs__icons(v-if="row.status === 'Started'")
          img.jobs__icon(src="../../../../../assets/images/goto-editor.png" @click.stop="enterEditor(index)" :class="{'jobs_disable': !row.isVendorRead}")
          .jobs__select-popup(v-if="isXtmJobs && index === currentActive" v-click-outside="closePopup")
            span.jobs__job-ids(v-for="(xtmJob, xtmJobIndex) in row.xtmJobIds" @click.stop="goToXtmEditor(index, xtmJobIndex)") {{ xtmJob.fileName }}
        .jobs__icons(v-if="isApproveReject(row)")
          img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :title="key")
        .jobs__icons(v-if="row.status === 'Accepted'")
          img.jobs__icon(src="../../../../../assets/images/enter-icon.png")
</template>

<script>
  import DataTable from "~/components/Tables/DataTable";
  import moment from "moment";
  import ClickOutside from "vue-click-outside";
  import { mapGetters, mapActions } from "vuex";

  export default {
    props: {
      jobs: {
        type: Array
      },
    },
    data(){
      return {
        fields: [
          {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "12%", padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "18%", padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: "14%", padding: "0"},
          {label: "Status", headerKey: "headerStatus", key: "status", width: "12%", padding: "0"},
          {label: "Progress", headerKey: "headerProgress", key: "progress", width: "10%", padding: "0"},
          {label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "11%", padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "11%", padding: "0"},
          {label: "Action", headerKey: "headerIcons", key: "icons", width: "12%", padding: "0"},
        ],
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,
        isXtmJobs: false,
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
      closePopup() {
        this.isXtmJobs = false;
      },
      async enterEditor(index) {
        if(!this.jobs[index].isVendorRead) return;
        if(this.jobs[index].xtmJobIds.length > 1) {
          this.currentActive = index;
          return this.isXtmJobs = true;
        }
        await this.goToXtmEditor(index, 0);
      },
      async goToXtmEditor(index, xtmJobIndex) {
        const { jobId } = this.jobs[index].xtmJobIds[xtmJobIndex];
        try {
          const url = await this.$axios.get(`/xtm/editor?jobId=${jobId}&stepName=${this.jobs[index].name}`);
          let link = document.createElement("a");
          link.target = "_blank";
          link.href = url.data;
          link.click();
          this.currentActive = -1;
          this.closePopup();
        } catch(err) {
          this.alertToggle({message: err.response.data, isShow: true, type: "error"});
        }
      },
      isApproveReject(row) {
        return row.status === "Request Sent" || row.status === "Created";
      },
      progress(prog) {
        return ((prog.wordsDone/prog.wordsTotal)*100).toFixed(2);
      },
    },
    components: {
      DataTable
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
    width: 1027px;
    margin: 0 auto;
  }
  &__data {
    height: 32px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
  &__progress-tooltip {
    position: absolute;
    opacity: 0;
    background-color: $white;
    color: $main-color;
    transition: all 0.2s;
    font-size: 14px;
    top: -1px;
    left: 25%;
    padding: 0 3px;
  }
  &__progress-bar {
    width: 100%;
    height: 15px;
    border: 1px solid $brown-border;
    position: relative;
    box-sizing: border-box;
    padding: 1px;
    &:hover {
      .jobs__progress-tooltip {
        opacity: 1;
      }
    }
  }
  &__progress-filler {
    background-color: $green-success;
    height: 100%;
  }
  &__icons {
    padding-top: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  &__select-popup {
    position: absolute;
    z-index: 10;
    background-color: $white;
    display: flex;
    padding: 8px;
    box-shadow: 0 0 10px $main-color;
    box-sizing: border-box;
    border-radius: 5px;
    right: 70%;
  }
  &__job-ids {
    font-size: 16px;
    text-decoration: underline;
    margin: 0 5px;
    &:hover {
      font-weight: 600;
    }
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

