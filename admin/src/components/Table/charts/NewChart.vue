<template lang="pug">
    .new-chart-wrapper
        .new-chart(:class="{'new-chart_relative': charts.length < 3}")
            .new-chart__title Add new Discount Chart
            .new-chart__row
                .new-chart__col
                    .new-chart__item
                        LabelVal(text="Name" customClass="new-chart-label")
                            input.new-chart__text(type="text" v-model="chartName")
                    .new-chart__item
                        LabelVal(text="Copy from" customClass="new-chart-label")
                            .new-chart__drop-menu
                                SelectSingle(:options="charts" :selectedOption="selectedChart.name" @chooseOption="setChart")
                .new-chart__col.new-chart_width-120
                    .new-chart__item
                        LabelVal(text="Default Client" customClass="new-chart-label")
                            CheckBox(:isChecked="isClientDefault" @check="(e) => toggleProp(e, 'isClientDefault')" @uncheck="(e) => toggleProp(e, 'isClientDefault')")
                    .new-chart__item
                        LabelVal(text="Default Vendor" customClass="new-chart-label")
                            CheckBox(:isChecked="isVendorDefault" @check="(e) => toggleProp(e, 'isVendorDefault')" @uncheck="(e) => toggleProp(e, 'isVendorDefault')")
                    .new-chart__item
                        LabelVal(text="Active" customClass="new-chart-label")
                            CheckBox(:isChecked="isActive" @check="(e) => toggleProp(e, 'isActive')" @uncheck="(e) => toggleProp(e, 'isActive')")
            .new-chart__buttons
                .new-chart__button
                    Button(value="Save" @clicked="checkErrors")
                .new-chart__button
                    Button(value="Cancel" @clicked="close")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import CheckBox from "@/components/CheckBox";
import Button from "@/components/Button";
import SelectSingle from "@/components/SelectSingle";
import { mapActions } from "vuex";

export default {
    props: {
        charts: {type: Array}
    },
    data() {
        return {
            selectedChart: {name: ""},
            chartName: "",
            isClientDefault: false,
            isVendorDefault: false,
            isActive: false
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        setChart({option}) {
            this.selectedChart = option;
        },
        close() {
            this.$emit("close");
        },
        toggleProp(e, prop) {
            this[prop] = !this[prop];
        },
        async checkErrors() {
            let errors = [];
            if(!this.chartName || this.isNotUniqueName()) errors.push("Name should be unique and not empty.");
            if(errors.length) {
                return this.$emit("checkErrors", { errors });
            }
            await this.saveChart();
        },
        isNotUniqueName() {
            const sameNameChart = this.charts.find(item => item.name === this.chartName);
            return sameNameChart;
        },
        async saveChart() {
            const chart = {
                name: this.chartName,
                isClientDefault: this.isClientDefault,
                isVendorDefault: this.isVendorDefault,
                isActive: this.isActive,
                matrixes: {...this.selectedChart.matrixes}
            }
            try {
                
                await this.$http.post('/settings-update/chart-update', { chart });
                await this.updateDefaultCharts();
                this.$emit('saved');
            } catch(err) {
                this.alertToggle({message: "Error on adding new Discount Chart", isShow: true, type: "error"});
            }
        },
        async updateDefaultCharts() {
            try {
                if(this.isClientDefault) {
                    let defaultClientChart = this.charts.find(item => item.isClientDefault);
                    defaultClientChart.isClientDefault = false;
                    await this.$http.post('/settings-update/chart-update', { chart: {...defaultClientChart} });
                }
                if(this.isVendorDefault) {
                    let defaultVendorChart = this.charts.find(item => item.isVendorDefault);
                    defaultVendorChart.isVendorDefault = false;
                    await this.$http.post('/settings-update/chart-update', { chart: {...defaultVendorChart} });
                }
            } catch(err) {
                this.alertToggle({message: "Error on updating Discount Chart", isShow: true, type: "error"});
            }
        }
    },
    components: {
        LabelVal,
        SelectSingle,
        CheckBox,
        Button
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.new-chart-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.1);
}

.new-chart {
    width: 60%;
    background-color: $white;
    padding: 20px;
    box-shadow: 0 0 10px $brown-shadow;
    z-index: 20;
    &_relative {
        position: relative;
        top: 50px;
    }
    &__title {
        margin-bottom: 20px;
    }
    &__row {
        display: flex;
        justify-content: space-between;
    }
    &__col {
        width: 270px;
    }
    &_width-120 {
        width: 120px;
    }
    &__item {
        margin-bottom: 20px;
    }
    &__text {
        width: 191px;
        height: 30px;
        box-sizing: border-box;
        padding: 0 5px;
        border: 1px solid $main-color;
        border-radius: 5px;
        outline: none;
        color: $main-color;
        transition: all 0.2s;
        &:focus {
            box-shadow: 0 0 5px $brown-shadow;
        }
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 30px;
    }
    &__buttons {
        display: flex;
        justify-content: flex-end;
    }
    &__button {
        margin-left: 15px;
    }
}

</style>
