<template lang="pug">
    .tier
        .tier__table
            DataTable(
                :fields="fields"
                :tableData="reportData"
                bodyClass="height-700"
            )
                .tier__header(slot="headerTarget" slot-scope="{ field }") {{ field.label }}
                .tier__header(slot="headerAll" slot-scope="{ field }") {{ field.label }}
                .tier__header(slot="headerFin" slot-scope="{ field }") {{ field.label }}
                .tier__header(slot="headerGame" slot-scope="{ field }") {{ field.label }}
                .tier__data(slot="target" slot-scope="{ row }") {{ row.target }}
                .tier__data(slot="all" slot-scope="{ row }") {{ row.allTier }}
                .tier__data(slot="fin" slot-scope="{ row }") {{ row.financeTier }}
                .tier__data(slot="game" slot-scope="{ row }") {{ row.gameTier }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    data() {
        return {
            fields: [
                {label: "Target Language", headerKey: "headerTarget", key: "target", width: "40%"},
                {label: "All Industries", headerKey: "headerAll", key: "all", width: "20%"},
                {label: "Financial Industries", headerKey: "headerFin", key: "fin", width: "20%"},
                {label: "Gaming Industries", headerKey: "headerGame", key: "game", width: "20%"}
            ],
            reportData: []
        }
    },
    methods: {
        async getReport() {
            try {
                const result = await this.$http.get("/reportsapi/xtrf-tier-report");
                this.reportData = result.body;
            } catch(err) {

            }
        }
    },
    components: {
        DataTable
    },
    created() {
        this.getReport();
    }
}
</script>

<style lang="scss" scoped>

.tier {
    box-sizing: border-box;
    padding: 40px;
    &__table {
        width: 60%;
    }
}

</style>
