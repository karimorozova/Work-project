<template lang="pug">
    .tasks-table
        DataTable(
            :fields="tableFields"
            :tableData="tableData"
            :bodyClass="tableData.length < 10 ? 'tbody_visible-overflow' : ''"
            :tableHeadRowClass="tableData.length < 10 ? 'tbody_visible-overflow' : ''"
        )
            .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
            .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePairs(row) }}
            .tasks-table__data(slot="wordcount" slot-scope="{ row }")
                .tasks-table__finance(v-if="project.status !== 'Requested'") {{ row.finance.Wordcount.receivables }}
                .tasks-table__finance(v-else) -
            .tasks-table__data(slot="cost" slot-scope="{ row }")
                .tasks-table__finance(v-if="project.status !== 'Requested'") {{ row.finance.Price.receivables }}
                    span.tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
                .tasks-table__finance(v-else) -

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import { mapGetters, mapActions } from "vuex";
import tableFields from "~/mixins/tableFields";

export default {
    mixins: [tableFields],
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: Math.floor(735*0.64), padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: Math.floor(735*0.20), padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: 0, padding: "0"}
            ],
            tableWidth: 735
        }
    },
    methods: {
        getLanguagePairs(row) {
            if(this.project.status === "Requested") {
                return `${this.project.sourceLanguage.lang} => ${row.lang}`
            }
            return this.getQuotePairs(row);
        },
        getQuotePairs(task) {
            let pair = "";
            for(let langPair of this.clientLanguages) {
                if(langPair.source.symbol === task.sourceLanguage && 
                    langPair.target.symbol === task.targetLanguage) {
                        pair = `${langPair.source.lang} => ${langPair.target.lang}`
                }
            }
            return pair;
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            clientLanguages: "getCombinations"
        }),
        tableData() {
            if(this.project.status !== 'Requested') {
                return this.project.tasks;
            }
            return this.project.targetLanguages;
        }
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
}

</style>
