<template lang="pug">
  .projects-table
    DataTable(
     :fields="fields"
     :tableData="allFiles"
     :hasScroll="hasScroll"
     bodyClass="all-projects"
     @onRowClicked="onRowClicked"
    )
      template(slot="headerFile" slot-scope="{ field }")
        span.projects-table__label {{ field.label }}
      template(slot="headerFileName" slot-scope="{ field }")
        span.projects-table__label {{ field.label }}
      template(slot="headerType" slot-scope="{ field }")
        span.projects-table__label {{ field.label }}
      template(slot="headerActions" slot-scope="{ field }")
        span.projects-table__label {{ field.label }}
</template>

<script>
  import DataTable from "../../DataTable";
  import { mapGetters, mapActions } from "vuex";

  export default {
    props: {
      allFiles: {
        type: Array
      }
    },
    data() {
      return {
        fields: [
          {label: "", headerKey: "headerFile", key: "fileId", width: "25%"},
          {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "25%"},
          {label: "Type", headerKey: "headerType", key: "type", width: "25%"},
          {label: "", headerKey: "headerActions", key: "actions", width: "25%"},
        ],
      }
    },
    methods: {
      async onRowClicked({index}) {
        this.$emit("selectProject", {project: this.allProjects[index]})
      },
      clientName(elem) {
        return elem.name;
      },
      projectLangs(arr) {
        return arr.reduce((init, cur) => {
          return init + cur.sourceLanguage + ' >> ' + cur.targetLanguage + '; '
        }, "")
      },
      edit() {
        console.log("edit");
      }
    },
    computed: {
      hasScroll() {
        return document.body.offsetWidth > 1024 && this.allFiles.length >= 3;
      }
    },
    components: {
      DataTable
    }
  }
</script>

<style lang="scss" scoped>
  .projects-table {
    min-height: 106px;
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
