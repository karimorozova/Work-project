<template lang="pug">
    .tasks-table
        DataTable(
            :fields="tableFields"
            :tableData="project.tasks"
            :bodyClass="project.tasks.length < 10 ? 'tbody_visible-overflow' : ''"
            :tableHeadRowClass="project.tasks.length < 10 ? 'tbody_visible-overflow' : ''"
        )
            .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
            .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePair(row) }}
            .tasks-table__data(slot="status" slot-scope="{ row }") {{ row.status }}
            .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
            .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
                .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
            .tasks-table__data.tasks-table_centered(slot="download" slot-scope="{ row }")
                img.tasks-table__icon(v-if="isDownload(row)" src="../../../../assets/images/download.png" @click="download(row)")

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import { mapGetters, mapActions } from "vuex";
import tableFields from "~/mixins/tableFields";
import taskPair from "~/mixins/taskPair";

export default {
    mixins: [tableFields, taskPair],
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: Math.floor(735*0.50), padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: Math.floor(735*0.16), padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: Math.floor(735*0.14), padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: Math.floor(735*0.12), padding: "0"},
                {label: " ", headerKey: "headerDownload", key: "download", width: 0, padding: "0"}
            ],
            tableWidth: 735,
            domain: "",
        }
    },
    methods: {
        isDownload(task) {
            const statuses = ['Ready for Delivery', 'Delivered'];
            return statuses.indexOf(task.status) !== -1;
        },
        async download(task) {
            try {
                let href = task.deliverables;
                if(!href) {
                    const result = await this.$axios.get(`/portal/deliverables?taskId=${task.taskId}`);
                    href = result.data.link;
                }
                let link = document.createElement('a');
                link.href = this.domain + href;
                link.target = "_blank";
                link.click();
                if(task.status === "Ready for Delivery") {
                    await this.updateTaskStatus({task, status: 'Delivered'});
                }
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            clientLanguages: "getCombinations"
        })
    },
    components: {
        DataTable
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>

.tasks-table {
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
        cursor: pointer;
    }
    &_centered {
        justify-content: center;
    }
}

</style>