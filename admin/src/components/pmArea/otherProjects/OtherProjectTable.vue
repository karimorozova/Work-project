<template lang="pug">
.projects-table
    DataTable(
        :fields="fields"
        :tableData="allProjects"
        :bodyClass="['all-projects', {'tbody_visible-overflow': allProjects.length < 17}]"
        :tableheadRowClass="allProjects.length < 17 ? 'tbody_visible-overflow' : ''"
        @onRowClicked="onRowClicked"
        @bottomScrolled="bottomScrolled"
    )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}

        template(slot="projectId" slot-scope="{ row }")
            span {{ row.name }}
        template(slot="clientName" slot-scope="{ row }")
            span {{ row.client }}
        template(slot="languages" slot-scope="{ row }")
            span {{ projectLangs(row) }}
        template(slot="receivables" slot-scope="{ row }")
            //- span(v-if="row.finance && row.finance.Price.receivables") &euro;
            //-     span {{ row.finance.Price.receivables }}
        template(slot="payables" slot-scope="{ row }")
            //- span(v-if="row.finance && row.finance.Price.payables") &euro;
            //-     span {{ row.finance.Price.payables }}
        template(slot="roi" slot-scope="{ row }")
            //- span {{ row.roi }}
        template(slot="startDate" slot-scope="{ row }") 
            span {{formateDate(row.creationTime)}}
        template(slot="deadline" slot-scope="{ row }")
            span {{formateDate(row.deadline)}}
        template(slot="projectManager" slot-scope="{ row }")
            span --              
        
</template>

<script>
import DataTable from "../../DataTable";
import moment from "moment";

export default {
  props: {
    allProjects: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "ID - Project Name",
          headerKey: "headerProjectId",
          key: "projectId",
          width: "26%"
        },
        {
          label: "Client Name",
          headerKey: "headerClientName",
          key: "clientName",
          width: "10%"
        },
        {
          label: "Languages",
          headerKey: "headerLanguages",
          key: "languages",
          width: "19%"
        },

        {
          label: "Receivables",
          headerKey: "headerReceivables",
          key: "receivables",
          width: "7%"
        },
        {
          label: "Payables",
          headerKey: "headerPayables",
          key: "payables",
          width: "7%"
        },
        {
          label: "ROI",
          headerKey: "headerRoi",
          key: "roi",
          width: "7%"
        },
        {
          label: "Start date",
          headerKey: "headerStartDate",
          key: "startDate",
          width: "7%"
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          width: "7%"
        },
        {
          label: "Project Manager",
          headerKey: "headerProjectManager",
          key: "projectManager",
          width: "10%"
        }
      ]
    };
  },
  methods: {
    async onRowClicked({ index }) {
      this.$router.push(
        `/other-project-details/${this.allProjects[index]._id}`
      );
    },
    formateDate: time => moment(time).format("DD-MM-YYYY"),
    projectLangs(row) {
      const targetLanguage = row.targetLanguages.map(item => item.memoq);
      return `${row.sourceLanguage.memoq} >> ${targetLanguage.reduce(
        (prev, cur) => prev + cur + "; ",
        ""
      )}`;
    },
    // bottomScrolled() {
    //   this.$emit("bottomScrolled");
    // }
  },
  components: {
    DataTable
  }
};
</script>

<style lang="scss" scoped>
.projects-table {
  &__label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__icon {
    height: 100%;
    width: 100%;
    z-index: 100;
  }
  &__edit {
    cursor: pointer;
  }
}
</style>
