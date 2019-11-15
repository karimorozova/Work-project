<template lang="pug">
    .lqa
        .lqa__filters
            Filters
        .lqa__table
            Table(:reportData="reportData")
</template>

<script>
import Filters from "./Filters";
import Table from "./Table";

export default {
    data() {
        return {
            reportData: null
        }
    },
    methods: {
        async getReport() {
            try {
                const result = await this.$http.get("/reportsapi/tier-report?type=lqa");
                this.reportData = result.body;
            } catch(err) {
                console.log(err);
            }
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
