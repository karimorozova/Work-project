<template lang="pug">
  .projects-table
    DataTable(
      :fields="fields"
      :tableData="allProjects"
      :bodyClass="['other-all-projects', {'tbody_visible-overflow': allProjects.length < 9}]"
      :tableheadRowClass="allProjects.length < 9 ? 'tbody_visible-overflow' : ''"
      @onRowClicked="onRowClicked"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        span.projects-table__label {{ field.label }}

      template(slot="projectId" slot-scope="{ row }")
        span {{ getProjectIdName(row, 'id') }}
      template(slot="projectName" slot-scope="{ row }")
        span {{ getProjectIdName(row, "name") }}
      template(slot="clientName" slot-scope="{ row }")
        span {{ row.client }}
      template(slot="languages" slot-scope="{ row }")
        span(v-html="projectLangs(row)")
      template(slot="status" slot-scope="{ row }")
        span {{ row.status }}
      template(slot="receivables" slot-scope="{ row }")
        span(v-if="row.finance && row.finance.Price.receivables") &euro;
          span {{ row.finance.Price.receivables }}
      template(slot="payables" slot-scope="{ row }")
        span(v-if="row.finance && row.finance.Price.payables") &euro;
          span {{ row.finance.Price.payables }}
      template(slot="roi" slot-scope="{ row }")
         span(v-if="row.finance && row.finance.ROI") {{ row.finance.ROI }}
         span(v-else)
      template(slot="startDate" slot-scope="{ row }")
        span {{formateDate(row.creationTime)}}
      template(slot="deadline" slot-scope="{ row }")
        span {{formateDate(row.deadline)}}
      template(slot="projectManager" slot-scope="{ row }")
        span {{nameOfProjectManager(row)}}
      template(slot="projectTest" slot-scope="{ row, index }")
        .checkbox(@click.stop="")
          input(type="checkbox" class="test" :id="'test' + (index + 1)" :checked="row.isTest" @click.stop="setTest(row._id)")
          label(:for="'test' + (index + 1)")
</template>

<script>
  import DataTable from "../../DataTable";
  import moment from "moment";
  import { mapActions } from "vuex";

  export default {
    props: {
      allProjects: {
        type: Array
      }
    },
    data () {
      return {
        fields: [
          {
            label: "ID",
            headerKey: "headerProjectId",
            key: "projectId",
            width: "10%"
          },
          {
            label: "Project Name",
            headerKey: "headerProjectId",
            key: "projectName",
            width: "14%"
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
            width: "11%"
          },
          {
            label: "Status",
            headerKey: "headerStatus",
            key: "status",
            width: "7%"
          },
          {
            label: "Receivables",
            headerKey: "headerReceivables",
            key: "receivables",
            width: "6%"
          },
          {
            label: "Payables",
            headerKey: "headerPayables",
            key: "payables",
            width: "6%"
          },
          {
            label: "ROI",
            headerKey: "headerRoi",
            key: "roi",
            width: "6%"
          },
          {
            label: "Start date",
            headerKey: "headerStartDate",
            key: "startDate",
            width: "8%"
          },
          {
            label: "Deadline",
            headerKey: "headerDeadline",
            key: "deadline",
            width: "8%"
          },
          {
            label: "Project Manager",
            headerKey: "headerProjectManager",
            key: "projectManager",
            width: "10%"
          },
          {
            label: "Test",
            headerKey: "headerTest",
            key: "projectTest",
            width: "4%"
          }
        ]
      };
    },
    methods: {
      ...mapActions(["alertToggle"]),
      async setTest (projectId) {
        await this.setProjectProp({
          projectId: projectId,
          prop: "isTest",
          value: event.target.checked
        });
      },
      async setProjectProp ({ projectId, prop, value }) {
        try {
          const result = await this.$http.put("/pm-manage/other-project-prop", {
            projectId,
            prop,
            value
          });
          this.alertToggle({
            message: "Project type changed",
            isShow: true,
            type: "success"
          });
        } catch (err) {
          this.alertToggle({
            message: "Server Error / Cannot update status Project",
            isShow: true,
            type: "error"
          });
        }
      },
      getProjectIdName (row, type) {
        let id = /(.*])\s- /gm.exec(row.name);
        let clientName = / - (.*)/gm.exec(row.name);
        if (type === "id") {
          if (id !== null) {
            return id[1];
          }
        } else {
          if (clientName !== null) {
            return clientName[1];
          }else{
          	return row.name;
          }
        }
      },
      async onRowClicked ({ index }) {
        this.$router.push(`/other-project-details/${this.allProjects[index]._id}`);
      },
      formateDate: time => moment(time).format("DD-MM-YYYY"),
      projectLangs (row) {
        const targets = row.targetLanguages
          .filter(item => item)
          .map(item => item.symbol);
        let languages = "";
        targets.forEach(element => {
          languages += `${row.sourceLanguage.symbol} >> ${element}<br>`;
        });
        return languages;
      },
      nameOfProjectManager (row) {
        return row.users
          .filter(item => item.ProjectRoles.isPm === true)
          .map(item => item.User.FullName)
          .reduce((prev, cur) => prev + cur + "; ", "");
      },
      bottomScrolled () {
        this.$emit("bottomScrolled");
      }
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

    .test {
      width: 0;
    }

    .checkbox {
      display: flex;
      margin-top: -5px;
      justify-content: center;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 4px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
  }
</style>
