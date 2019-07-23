<template lang="pug">
    .chart-table
        .chart-table__title Discount Chart {{ chart.name }}
        .chart-table__tabs
            Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
        .chart-table__table
            SettingsTable(
                :fields="fields"
                :tableData="matrixData"
            )
                template(slot="headerText" slot-scope="{ field }")
                    span.chart-table__text {{ field.label }}
                template(slot="headerDiscount" slot-scope="{ field }")
                    span.chart-table__text {{ field.label }}
                template(slot="text" slot-scope="{ row }")
                    span.chart-table__text {{ row.text }}
                template(slot="discount" slot-scope="{ row }")
                    input.chart-table__discount(type="number" min="0" max ="100" :value="(row.value*100).toFixed()"
                        @change="(e) => setMatrixData(e, row.key)"
                        @keyup="blur")
                    span.chart-table__percent %
</template>

<script>
import Tabs from "@/components/Tabs";
import SettingsTable from "../SettingsTable";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            tabs: ["Client", "Vendor"],
            selectedTab: "Client",
            chart: {},
            fields: [
                {label: "Translation match", headerKey: "headerText", key: "text", width: "60%"},
                {label: "Discount %", headerKey: "headerDiscount", key: "discount", width: "40%"}
            ],
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        blur(e) {
            if(e.keyCode === 13) {
                e.target.blur();
            }
        },
        async setMatrixData(e, key) {
            const value = e.target.value || "0";
            const prop = this.selectedTab.toLowerCase();
            try {
                this.chart.matrixes[prop][key].value = +(value/100).toFixed(2); 
                await this.$http.post('/settings-update/chart-update', { chart: this.chart });
                this.alertToggle({message: "Updated", isShow: true, type: "success"});
            } catch(err) {
                console.log(err);
                this.alertToggle({message: "Error on updating matrix of the chart", isShow: true, type: "error"});
            }
        },
        setTab({index}) {
            this.selectedTab = this.tabs[index];
        },
        async getChartInfo() {
            try {
                const result = await this.$http.get(`/api/chart?name=${this.$route.params.name}`);
                this.chart = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting chart", isShow: true, type: "error"});
            }
        },
        getTableData(matrix) {
            return Object.keys(matrix).map(key => {
                return {...matrix[key], key}
            });
        }
    },
    computed: {
        matrixData() {
            if(this.chart.matrixes) {
                const { matrixes } = this.chart;
                if(this.selectedTab === "Client") {
                    return this.getTableData(matrixes.client);
                } else {
                    return this.getTableData(matrixes.vendor);
                }
            }
            return [];
        }
    },
    components: {
        Tabs,
        SettingsTable
    },
    created() {
        this.getChartInfo();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.chart-table {
    width: 600px;
    &__title {
        margin-bottom: 40px;
        font-size: 20px;
        font-weight: 600;
    }
    &__discount {
        width: 22px;
        padding-left: 2px;
        color: $main-color;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button, {
            -webkit-appearance: none;
            margin: 0;
        }
    }
    &__percent {
        margin-left: 3px;
    }
}

</style>
