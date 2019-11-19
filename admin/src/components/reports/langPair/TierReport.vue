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
                    img.tier__icon(
                        :class="{'tier_rotated': isAllSorted}" 
                        src="../../../assets/images/open-arrow_white.png" 
                        @click="sortData('allTier', 'isAllSorted')")
                .tier__header(slot="headerFin" slot-scope="{ field }") {{ field.label }}
                    img.tier__icon(
                        :class="{'tier_rotated': isFinanceSorted}" 
                        src="../../../assets/images/open-arrow_white.png" 
                        @click="sortData('financeTier', 'isFinanceSorted')")
                .tier__header(slot="headerGame" slot-scope="{ field }") {{ field.label }}
                    img.tier__icon(
                        :class="{'tier_rotated': isGamingSorted}" 
                        src="../../../assets/images/open-arrow_white.png" 
                        @click="sortData('gameTier', 'isGamingSorted')")
                .tier__data(slot="target" slot-scope="{ row }") {{ row.target }}
                .tier__data(slot="all" slot-scope="{ row }") Tier {{ row.allTier }}
                .tier__data(slot="fin" slot-scope="{ row }") Tier {{ row.financeTier }}
                .tier__data(slot="game" slot-scope="{ row }") Tier {{ row.gameTier }}
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
            reportData: [],
            isAllSorted: false,
            isFinanceSorted: false,
            isGamingSorted: false
        }
    },
    methods: {
        async getReport() {
            try {
                const result = await this.$http.get("/reportsapi/xtrf-tier-report");
                this.reportData = result.body;
            } catch(err) {

            }
        },
        sortData(tierProp, prop) {
            this[prop] = !this[prop];
            if(this[prop]) {
                this.reportData = this.reportData.sort((a,b) => a[tierProp] > b[tierProp] ? 1 : -1);
            } else {
                this.reportData = this.reportData.sort((a,b) => a[tierProp] < b[tierProp] ? 1 : -1);
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
    &__icon {
        margin-left: 10px;
        cursor: pointer;
    }
    &_rotated {
        transform: rotate(180deg);
    }
}

</style>
