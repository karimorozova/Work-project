<template lang="pug">
    .lqa
        .lqa__filters
            Filters(
                :targetFilter="targetFilter"
                @setNameFilter="setFilter"
                @setTargetFilter="setTargetFilter"
            )
        .lqa__table
            Table(:reportData="reportData")
</template>

<script>
import Filters from "./Filters";
import Table from "./Table";

export default {
    data() {
        return {
            reportData: null,
            nameFilter: "",
            targetFilter: [{symbol: "All"}]
        }
    },
    methods: {
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/tier-report" ,{ type: "lqa", filters: this.filters});
                this.reportData = result.body;
            } catch(err) {
                console.log(err);
            }
        },
        async setFilter({value}) {
            this.nameFilter = value;
            await this.getReport();
        },
        async setTargetFilter({lang}) {
            if(lang.symbol !== 'All') {
                this.targetFilter = this.targetFilter.filter(item => item.symbol !== 'All');
                const position = this.targetFilterSymbols.indexOf(lang.symbol);
                if(position === -1) {
                    return this.targetFilter.push(lang);
                }
                this.targetFilter.splice(position, 1);
            }
            this.targetFilter = !this.targetFilter.length || lang.symbol === 'All' ? [{symbol: "All"}] : this.targetFilter;
        }
    },
    computed: {
        filters() {
            return {
                nameFilter: this.nameFilter,
                targets: this.targetFilterSymbols
            }
        },
        targetFilterSymbols() {
            return this.targetFilter.map(item => item.symbol);
        }
    },
    components: {
        Filters,
        Table
    },
    mounted() {
        this.getReport();
    }
}
</script>

<style lang="scss" scoped>

.lqa {
    box-sizing: border-box;
    padding: 40px;
}

</style>
