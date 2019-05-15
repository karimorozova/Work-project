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
            .tasks-table__status(slot="status" slot-scope="{ row }") {{ row.status }}
                .tasks-table__timestamp(v-if="row.isDelivered")
                    img.tasks-table__time-icon(src="../../../../assets/images/time_icon.png")
                    .tasks-table__time-data {{ getDeliveredTime(row.deliveredTime) }}
            .tasks-table__data.tasks-table__progress(slot="progress" slot-scope="{ row }")
                ProgressLine(:progress="getProgress(row)")
            .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
            .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
                .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
            .tasks-table__data.tasks-table_centered(slot="download" slot-scope="{ row }")
                img.tasks-table__icon(v-if="isDownload(row)" src="../../../../assets/images/download.png" @click="download(row)")

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import ProgressLine from "~/components/ProgressLine";
import moment from "moment";
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
            ],
            domain: ""
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            updateTaskStatus: "updateTaskStatus"
        }),
        getDeliveredTime(date) {
            return date ? moment(date).format("YYYY-MM-DD, HH:mm Z") : "";
        },
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
            return task.status === 'Ready for Delivery' || task.status === 'Delivered'
        },
        async download(task) {
            try {
                const result = await this.$axios.get(`/portal/deliverables?taskId=${task.taskId}`);
                const href = result.data.link;
                let link = document.createElement('a');
                link.href = this.domain + href;
                link.target = "_blank";
                link.click();
                if(task.status === "Ready for Delivery") {
                    await this.updateTaskStatus({task});
                }
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
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
            return (total/taskSteps.length).toFixed(2);
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            clientLanguages: "getCombinations"
        })
    },
    mounted() {
        this.domain = process.env.domain;
    },
    components: {
        DataTable,
        ProgressLine
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.tasks-table {
    &__data, &__status {
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
    &__progress, &__status {
        position: relative;
    }
    &__timestamp {
        cursor: pointer;
        position: absolute;
        right: 3px;
        top: 6px;
        &:hover {
            .tasks-table__time-data {
                opacity: 1;
                z-index: 5;
            }
        }
    }
    &__time-data {
        position: absolute;
        top: -2px;
        width: 150px;
        background-color: $white;
        padding: 3px;
        border-radius: 3px;
        margin-left: 22px;
        box-shadow: 0 0 10px $brown-shadow;
        opacity: 0;
        z-index: -2;
        transition: all 0.2s;
    }
    &_centered {
        justify-content: center;
    }
}

</style>