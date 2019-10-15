<template lang="pug">
    .data-table
        DataTable(
            :fields="tableFields"
            :tableData="projects"
            :bodyClass="projects.length < 7 ? 'tbody_visible-overflow tbody_height-200' : 'tbody_height-200'"
            :tableHeadRowClass="projects.length < 7 ? 'tbody_visible-overflow' : ''"
            @onRowClicked="getDetails"
        )
            .data-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
            .data-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.startDate) }}
            .data-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId || row.requestId }}
            .data-table__data(slot="projectName" slot-scope="{ row, index }" :class="{'data-table_break-word': row.projectName.length > 30}") {{ row.projectName }}
            .data-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
            .data-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
            .data-table__data(slot="totalCost" slot-scope="{ row, index }")
                .data-table__payment(v-if="row.status !== 'Requested'") {{ row.finance.Price.receivables }}
                    span.data-table__currency(v-if="row.finance.Price.receivables") &euro;
            .data-table__data.data-table_centered(slot="icons" slot-scope="{ row, index }")
                img.data-table__icon(v-if="row.status === 'Quote sent'" v-for="(icon, key) in icons" :src="icon.src" @click.stop="makeAction(index, key)")
            .data-table__data.data-table__progress(slot="progress" slot-scope="{ row, index }")
                ProgressLine(:progress="progress(row.steps)")
</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import ProgressLine from "~/components/ProgressLine";
import moment from "moment";
import tableFields from "~/mixins/tableFields";

export default {
    mixins: [tableFields],
    props: {
        projects: {
            type: Array,
            default: () => []
        },
        isOpenProjects: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            fields: [
                {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: Math.floor(1010*0.14), padding: "0"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: Math.floor(1010*0.2), padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: Math.floor(1010*0.16), padding: "0"},
                {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: Math.floor(1010*0.16), padding: "0"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: Math.floor(1010*0.12), padding: "0"},
                {label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: Math.floor(1010*0.12), padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: 0, padding: "0"}
            ],
            tableWidth: 1010,
            icons: {
                approve: {src: require("../../../assets/images/Approve-icon.png")},
                reject: {src: require("../../../assets/images/Reject-icon.png")}
            }
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
        },
        makeAction(index, key) {
            this.$emit("iconClicked", { index, key })
        },
        getDetails({index}) {
            this.$emit("getDetails", { index });
        },
        progress(steps) {
            let total = 0;
            for(let step of steps) {
                const progress = isNaN(step.progress) ? +(step.progress.wordsDone/step.progress.wordsTotal*100).toFixed(2) : step.progress;
                total+= progress;
            }
            return (total/steps.length).toFixed(2);
        },
        setFields() {
            if(this.isOpenProjects) {
                let progressElement = {...this.fields[this.fields.length-1], label: 'Progress', key: 'progress', width: Math.floor(1010*0.14)};
                this.fields.pop();
                this.fields.splice(3, 0, progressElement);
            }
        }
    },
    created() {
        this.setFields()
    },
    components: {
        DataTable,
        ProgressLine
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.data-table {
    &__data {
        height: 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 0 5px;
    }
    &__currency {
        margin-left: 3px;
    }
    &__icon {
        margin: 0 5px;
        transition: all 0.2s;
        &:hover {
            transform: scale(1.1);
        }
    }
    &__progress {
        position: relative;
    }
    &_centered {
        justify-content: center;
    }
    &_break-word {
        word-break: break-all;
        overflow-y: auto;
        align-items: baseline;
    }
}

</style>
