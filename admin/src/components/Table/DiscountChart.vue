<template lang="pug">
    .discount-chart
        .discount-chart__table
            SettingsTable(
                :fields="fields"
                :tableData="charts"
                :areErrors="areErrors"
                :errors="errors"
                @closeErrors="closeErrors"
            )
                .discount-chart__head-title(slot="headerName" slot-scope="{ field }") {{ field.label }}
                .discount-chart__head-title(slot="headerClient" slot-scope="{ field }") {{ field.label }}
                .discount-chart__head-title(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
                .discount-chart__head-title(slot="headerActive" slot-scope="{ field }") {{ field.label }}
                .discount-chart__data(slot="name" slot-scope="{ row }") {{ row.name }}
                .discount-chart__data.discount-chart_centered(slot="client" slot-scope="{ row, index }")
                    CheckBox(:isChecked="row.isClientDefault" @check="(e) => toggleDefault(e, index, 'isClientDefault')" @uncheck="(e) => toggleDefault(e, index, 'isClientDefault')")
                .discount-chart__data.discount-chart_centered(slot="vendor" slot-scope="{ row, index }")
                    CheckBox(:isChecked="row.isVendorDefault" @check="(e) => toggleDefault(e, index, 'isVendorDefault')" @uncheck="(e) => toggleDefault(e, index, 'isVendorDefault')")
                .discount-chart__data.discount-chart_centered(slot="active" slot-scope="{ row, index }")
                    Toggler(:isActive="row.isActive" :isDisabled="false" @toggle="toggle(index)")
            Add(@add="openNewChart")
        .discount-chart__new(v-if="isCreatingNew")
            NewChart(:charts="charts" @close="closeNewChart" @checkErrors="checkErrors" @saved="saved")
</template>

<script>
import SettingsTable from "./SettingsTable";
import CheckBox from "@/components/CheckBox";
import Toggler from "@/components/Toggler";
import Add from "@/components/Add";
import NewChart from "./charts/NewChart";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "Name", headerKey: "headerName", key: "name", width: "45%", padding: "0"},
                {label: "Default Client", headerKey: "headerClient", key: "client", width: "20%", padding: "0"},
                {label: "Default Vendor", headerKey: "headerVendor", key: "vendor", width: "20%", padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: "15%", padding: "0"},
            ],
            charts: [],
            isCreatingNew: false,
            areErrors: false,
            errors: []
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        openNewChart() {
            this.isCreatingNew = true;
        },
        closeNewChart() {
            this.isCreatingNew = false;
        },
        checkErrors({errors}) {
            this.errors = [...errors];
            this.areErrors = true;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async saved() {
            await this.getCharts();
            this.closeNewChart();
        },
        async toggle(index) {
            if(this.charts.length === 1) return;
            const chart = {...this.charts[index], isActive: !this.charts[index].isActive};
            await this.updateChart(chart);
        },
        async toggleDefault(e, index, prop) {
            if(this.charts[index][prop]) return;
            const defaultChart = this.charts.find(item => item[prop]);
            const newDefaultChart = {...this.charts[index], [prop]: true};
            await this.updateChart({...defaultChart, [prop]: false});
            await this.updateChart(newDefaultChart);
        },
        async updateChart(chart) {
            try {
                await this.$http.post('/settings-update/chart-update', { chart });
                await this.getCharts();
            } catch(err) {
                this.alertToggle({message: "Error on updating chart", isShow: true, type: "error"});
            }
        },
        async getCharts() {
            try {
                const result = await this.$http.get('/api/discount-charts');
                this.charts = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting charts", isShow: true, type: "error"});
            }
        }
    },
    components: {
        SettingsTable,
        CheckBox,
        Toggler,
        NewChart,
        Add
    },
    created() {
        this.getCharts();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.discount-chart {
    position: relative;
    max-width: 800px;
    &__table {
        @extend %setting-table;
    }
    &__data {
        @extend %table-data;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
