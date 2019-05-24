<template lang="pug">
    .tasks-table
        DataTable(
            :fields="tableFields"
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
                .tasks-table__timestamp(v-if="row.isDelivered && row.status === 'Delivered'")
                    img.tasks-table__time-icon(src="../../../../assets/images/time_icon.png")
                    .tasks-table__time-data {{ getDeliveredTime(row.deliveredTime) }}
            .tasks-table__data.tasks-table__progress(slot="progress" slot-scope="{ row }")
                ProgressLine(:progress="getProgress(row)")
            .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
            .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
                .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
            .tasks-table__data.tasks-table_centered(slot="icons" slot-scope="{ row }")
                .tasks-table__icons(v-if="isApproveReject(row)")
                    img.tasks-table__icon(v-for="(icon, key) in icons" :src="icon.src" @click="makeDecision(row, key)")
                img.tasks-table__download(v-if="isDownload(row)" src="../../../../assets/images/download.png" @click="download(row)")

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import ProgressLine from "~/components/ProgressLine";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";
import tableFields from "~/mixins/tableFields";

export default {
    mixins: [tableFields],
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: Math.floor(735*0.42), padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: Math.floor(735*0.14), padding: "0"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: Math.floor(735*0.12), padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: Math.floor(735*0.12), padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: Math.floor(735*0.1), padding: "0"},
                {label: " ", headerKey: "headerDownload", key: "icons", width: 0, padding: "0"}
            ],
            domain: "",
            tableWidth: 735,
            icons: {
                approve: {src: require("../../../../assets/images/Approve-icon.png")},
                reject: {src: require("../../../../assets/images/Reject-icon.png")}
            }
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
        isApproveReject(task) {
            return task.status === 'Created'
        },
        isDownload(task) {
            return task.status === 'Ready for Delivery' || task.status === 'Delivered'
        },
        async makeDecision(task, key) {
            const status = key === 'approve' ? 'Approved' : 'Rejected'
            try {
                await this.updateTaskStatus({task, status});
            } catch(err) { }
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
                    await this.updateTaskStatus({task, status: 'Delivered'});
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
    &__icons {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
    &__icon {
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
            transform: scale(1.1);
        }
    }
    &__download {
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