<template lang="pug">
    .tasks-table
        DataTable(
            :fields="fields"
            :tableData="project.tasks"
        )
            .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerProgress" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
            .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePairs(row) }}
            .tasks-table__data(slot="status" slot-scope="{ row }") {{ row.status }}
            .tasks-table__data(slot="progress" slot-scope="{ row }")
                .tasks-table__progress-bar
                    .tasks-table__progress-filler(:style="{width: getProgress(row) + '%'}")
                    span.tasks-table__progress-tooltip {{ getProgress(row) }}%
            .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
            .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
                .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
            .tasks-table__data.tasks-table_centered(slot="download" slot-scope="{ row }")
                img.tasks-table__icon(v-if="isDownload(row)" src="../../../../assets/images/download.png" @click="download(row)")

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "44%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "14%", padding: "0"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "12%", padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "13%", padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: "10%", padding: "0"},
                {label: " ", headerKey: "headerDownload", key: "download", width: "7%", padding: "0"}
            ]
        }
    },
    methods: {
        getLanguagePairs(task) {
            let pair = "";
            for(let langPair of this.clientLanguages) {
                if(langPair.source.symbol === task.sourceLanguage && 
                    langPair.target.symbol === task.targetLanguage) {
                        pair = `${langPair.source.lang} => ${langPair.target.lang}`
                }
            }
            return pair;
        },
        isDownload(task) {
            return task.status === 'Ready for Delivery'
        },
        download(row) {
            console.log("downloading...")
        },
        getProgress(task) {
            const { steps } = this.project;
            let total = 0;
            const taskSteps = steps.filter(item => task.taskId === item.taskId);
            for(let step of taskSteps) {
                if(task.taskId === step.taskId) {
                    total+= +(step.progress.wordsDone/step.progress.wordsTotal*100).toFixed(2);
                }
            }
            return total/taskSteps.length;
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
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

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
    &__progress-tooltip {
        position: absolute;
        opacity: 0;
        background-color: $white;
        color: $main-color;
        transition: all 0.2s;
        font-size: 14px;
        top: -1px;
        left: 30%;
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
            .tasks-table__progress-tooltip {
                opacity: 1;
            }
        }
    }
    &__progress-filler {
        background-color: $green;
        height: 100%;
    }
    &_centered {
        justify-content: center;
    }
}

</style>