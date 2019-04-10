<template lang="pug">
    .tasks-table
        DataTable(
            :fields="fields"
            :tableData="project.tasks"
        )
            .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
            .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
            .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePairs(row) }}
            .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
            .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
                .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;

</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "60%", padding: "0"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "24%", padding: "0"},
                {label: "Cost", headerKey: "headerCost", key: "cost", width: "16%", padding: "0"}
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
}

</style>
