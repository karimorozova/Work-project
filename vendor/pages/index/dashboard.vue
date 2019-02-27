<template lang="pug">
  .vendor_portal_wrapper
    .jobs_block
      h3 Upcoming Jobs
      .jobs
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="jobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            bodyClass="tbody_height-200"
            @closeErrors="closeErrors"
            @approve="rejectJob"
            @notApprove="setDefaults"
            @closeModal="setDefaults"
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
              .jobs__data(v-if="currentActive !== index") {{ row.type }}
            template(slot="status" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.status }}
            template(slot="deadLine" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.deadLine }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.amount }}
            template(slot="icons" slot-scope="{ row, index }")
              .jobs__icons
                img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'jobs_opacity': isActive(key, index)}" :title="icon.type ==='approve' ? 'approve' : 'reject'")
    .jobs_block
      h3 Open Jobs
      .jobs
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="jobs"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            bodyClass="tbody_height-200"
            @closeErrors="closeErrors"
            @approve="rejectJob"
            @notApprove="setDefaults"
            @closeModal="setDefaults"
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
              .jobs__data(v-if="currentActive !== index") {{ row.type }}
            template(slot="status" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.status }}
            template(slot="deadLine" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.deadLine }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.amount }}
            template(slot="icons" slot-scope="{ row, index }")
              .jobs__icons
                img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'jobs_opacity': isActive(key, index)}" :title="icon.type ==='approve' ? 'approve' : 'reject'")
</template>

<script>
  import DataTable from "../components/jobs/Table/DataTable";
  // import SettingsTableOpened from "@/components/Tables/Opened_Jobs/SettingsTable";

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
        jobs: [],
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
      closeErrors() {
        this.areErrors = false;
      },
      setDefaults() {
        return true
      },
      async getJobs() {
        try {
          // const result = await this.$axios.$get("/jobs");
          this.jobs = [{
            "type": "Request Sent",
            "username": "illy.dim",
            "deadLine": "11 Apr 2018",
            "projectId": "2018 04 11 [27]",
            "projectName": "Market resources(Updated)",
            "amount": "1000 €",
            "status": "Translation",
          },
            {
              "type": "Accepted",
              "username": "kriti.chris",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "gender": "FEMALE",
              "amount": "1000 €",
              "status": "QA",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            },
            {
              "type": "Accepted",
              "username": "admin",
              "deadLine": "11 Apr 2018",
              "projectId": "2018 04 11 [27]",
              "projectName": "Market resources(Updated)",
              "amount": "1000 €",
              "status": "Proofing",
            }
          ];
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
