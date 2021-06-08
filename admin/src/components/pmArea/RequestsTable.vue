<template lang="pug">
  .requests-table
    DataTable(
      :fields="fields"
      :tableData="allProjects"
      :bodyClass="['all-projects', {'tbody_visible-overflow': allProjects.length < 17}]"
      :tableheadRowClass="allProjects.length < 17 ? 'tbody_visible-overflow' : ''"
      @onRowClicked="onRowClicked"
      @bottomScrolled="bottomScrolled"
    )
      template(slot="headerProjectId" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerProjectName" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerClientName" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerService" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerLanguages" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerStatus" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerStartDate" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerDeadline" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerProjectManager" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      template(slot="headerAccountManager" slot-scope="{ field }")
        span.requests-table__label {{ field.label }}
      //template(slot="headerEdit" slot-scope="{ field }")
      //    span.requests-table__label

      template(slot="projectId" slot-scope="{ row }")
        span {{ getId(row) }}
      template(slot="clientName" slot-scope="{ row }")
        span {{ clientName(row.customer) }}
      template(slot="projectName" slot-scope="{ row }")
        span {{ row.projectName }}
      template(slot="status" slot-scope="{ row }")
        span {{ row.status }}
      template(slot="service" slot-scope="{ row }")
        span {{ row.requestForm.service.title }}
      template(slot="languages" slot-scope="{ row }")
        span {{ getRequestLangs(row) }}
      template(slot="startDate" slot-scope="{ row }")
        span {{ row.startDate.split('T')[0].split('-').reverse().join('-') }}
      template(slot="deadline" slot-scope="{ row }")
        span {{ row.deadline.split('T')[0].split('-').reverse().join('-') }}
      template(slot="projectManager" slot-scope="{ row }")
        span(v-if="row.projectManager") {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}
      template(slot="accountManager" slot-scope="{ row }")
        span(v-if="row.accountManager") {{ row.accountManager.firstName }} {{ row.accountManager.lastName }}
      //template(slot="edit" slot-scope="{ row }" style="{'z-index': 100}")
        span.requests-table__icon(@click.stop="edit")
          img.requests-table__edit(src="../../assets/images/edit-icon-qa.png")
</template>

<script>
	import DataTable from "../DataTable"

	export default {
		props: {
			allProjects: {
				type: Array
			}
		},
		data() {
			return {
				fields: [
					{ label: "ID", headerKey: "headerProjectId", key: "projectId", width: "11%" },
					{ label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "10%" },
					{ label: "Client Name", headerKey: "headerClientName", key: "clientName", width: "12%" },
					{ label: "Service", headerKey: "headerService", key: "service", width: "11%" },
					{ label: "Languages", headerKey: "headerLanguages", key: "languages", width: "9%" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "11%" },
					{ label: "Start date", headerKey: "headerStartDate", key: "startDate", width: "7%" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "7%" },
					{ label: "Project Manager", headerKey: "headerProjectManager", key: "projectManager", width: "11%" },
					{ label: "Account Manager", headerKey: "headerAccountManager", key: "accountManager", width: "11%" },
					// {label: "Edit", headerKey: "headerEdit", key: "edit", width: "5%"},
				]
			}
		},
		methods: {
			async onRowClicked({ index }) {
				this.$emit("selectProject", { project: this.allProjects[index] })
			},
			getId(row) {
				return row.projectId
			},
			clientName(elem) {
				return elem.name
			},
			getRequestLangs(row) {
				return row.requestForm.targetLanguages.reduce((prev, cur) => {
					return prev + `${ row.requestForm.sourceLanguage.symbol } >> ${ cur.symbol }; `
				}, "")
			},
			edit() {
				console.log("edit")
			},
			bottomScrolled() {
				this.$emit("bottomScrolled")
			}
		},
		components: {
			DataTable
		}
	}
</script>

<style lang="scss" scoped>
  .requests-table {
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
