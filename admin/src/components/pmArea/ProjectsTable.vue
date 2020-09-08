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
        template(slot="headerProjectId" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerClientName" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerProjectName" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerLanguages" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerReceivables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerRoi" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerStartDate" slot-scope="{ field }") 
            span.projects-table__label {{ field.label }}
        template(slot="headerDeadline" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerProjectManager" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerTest" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="projectId" slot-scope="{ row }")
            span {{ getId(row) }}
        template(slot="clientName" slot-scope="{ row }")
            span {{ clientName(row.customer) }}
        template(slot="projectName" slot-scope="{ row }")
            span {{ row.projectName }}
        template(slot="languages" slot-scope="{ row }")
            span {{ projectLangs(row) }}
        template(slot="status" slot-scope="{ row }")
            span {{ row.status }}
        template(slot="receivables" slot-scope="{ row }")
            span(v-if="row.finance && row.finance.Price.receivables") &euro;
                span {{ row.finance.Price.receivables }}
        template(slot="payables" slot-scope="{ row }")
            span(v-if="row.finance && row.finance.Price.payables") &euro;
                span {{ row.finance.Price.payables }}
        template(slot="roi" slot-scope="{ row }")
            span {{ row.roi }}
        template(slot="startDate" slot-scope="{ row }") 
            span {{ row.startDate.split('T')[0].split('-').reverse().join('-') }}
        template(slot="deadline" slot-scope="{ row }")
            span {{ row.deadline.split('T')[0].split('-').reverse().join('-') }}              
        template(slot="projectManager" slot-scope="{ row }")
            span {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}
        template(slot="projectTest" slot-scope="{ row, index }")
            .checkbox(@click.stop="")
                input(type="checkbox" class="test" :id="'test' + (index + 1)"  :checked="row.isTest"  @click.stop="setTest(row._id)")
                label(:for="'test' + (index + 1)")

</template>

<script>
import DataTable from "../DataTable";
import { mapActions } from "vuex";

export default {
    props: {
        allProjects: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "ID", headerKey: "headerProjectId", key: "projectId", width: "9%"},
                {label: "Client Name", headerKey: "headerClientName", key: "clientName", width: "10%"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "12%"},
                {label: "Languages", headerKey: "headerLanguages", key: "languages", width: "12%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "8%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "7%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "6%"},
                {label: "ROI", headerKey: "headerRoi", key: "roi", width: "6%"},
                {label: "Start date", headerKey: "headerStartDate", key: "startDate", width: "7%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "7%"},
                {label: "Project Manager", headerKey: "headerProjectManager", key: "projectManager", width: "11%"},
                {label: "Test", headerKey: "headerTest", key: "projectTest", width: "5%"},
            ],
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "setCurrentProject"
        ]),
        async setTest(projectId){
            await this.setProjectProp({
                projectId: projectId, 
                prop: 'isTest', 
                value: event.target.checked
            });
        },
        async setProjectProp({projectId, prop, value}) {
            try {
                const result = await this.$http.put("/pm-manage/project-prop", {projectId, prop, value});
                this.alertToggle({message: "Project type changed", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Server Error / Cannot update status Project", isShow: true, type: "error"})
            }
        },
        async onRowClicked({index}) {
	        const curProject = await this.$http.get(`/pm-manage/project?id=${this.allProjects[index]._id}`);
          this.$emit("selectProject", {project: curProject.body})
        },
        getId(row) {
            return row.projectId || row.requestId;
        },
        clientName(elem) {
            return elem.name;
        },
        projectLangs(row) {
            const pairs = row.tasks.map(item => {
                return item.packageSize ? `${item.targetLanguage} / ${item.packageSize}` : `${item.sourceLanguage} >> ${item.targetLanguage}`;
            }).filter((elem, index, self) => self.indexOf(elem) === index);
            return pairs.reduce((prev, cur) => prev + cur + '; ', "");
        },
        bottomScrolled() {
            this.$emit("bottomScrolled");
        }
    },
    components: {
        DataTable
    }
}
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
    .table-chekbox{
       height: 22px;
       width: 18px;
       position: absolute;
       z-index: 500;
    }
    .test{
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
