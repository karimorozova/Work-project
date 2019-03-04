<template lang="pug">
  .jobs__table
    DataTable(
      :fields="fields"
      :tableData="tableData"
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
        .jobs__icons
          //- img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'jobs_opacity': isActive(key, index)}" :title="icon.type ==='approve' ? 'approve' : 'reject'")
</template>

<script>
  import DataTable from "~/components/Tables/DataTable";
  import moment from "moment";

  export default {
    props: {
      fields: {
        type: Array
      },
      tableData: {
        type: Array
      },
    },
    data(){
      return {
        currentActive: -1,
        areErrors: false,
        errors: [],
        isDeleting: false,

      }
    },
    methods:{
      closeErrors() {
        this.areErrors = false;
      },
      formatDeadline(date) {
        return moment(date).format('DD-MMM-YYYY')
      },
    },
    components: {
      DataTable
    }

  }
</script>

<style lang="scss" scoped>
  .jobs__table {
    padding-top: 10px;
    width: 1027px;
    margin: 0 auto;
  }

  .jobs__data {
    height: 32px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  .jobs__icons {
    padding-top: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .jobs__icon {
    cursor: pointer;
    margin-right: 8px;
    transition: transform 0.1s ease-out;

    &:hover {
      transform: scale(1.2);
    }
  }

</style>

