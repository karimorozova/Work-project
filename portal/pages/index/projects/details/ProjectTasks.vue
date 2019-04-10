<template lang="pug">
    .tasks-table
        DataTable(
            :fields="fields"
            :tableData="project.tasks"
        )
            .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
            .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePairs(row) }}
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

export default {
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "50%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "15%", padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "15%", padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: "12%", padding: "0"},
                {label: " ", headerKey: "headerDownload", key: "download", width: "8%", padding: "0"}
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