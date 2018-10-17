<template lang="pug">
.step-info
    .step-info__block
        Vendor(
            :vendors="vendors"
            :vendor="step.vendor"
        )
    .step-info__block
        Finance(
            :financeData="financeData"
            @addRow="addFinanceData"
        )
</template>

<script>
import Vendor from "./stepinfo/Vendor";
import Finance from "./stepinfo/Finance";

export default {
    props: {
        vendors: {
            type: Array
        },
        step: {
            type: Object
        },
        task: {
            type: Object
        }
    },
    data() {
        return {
            financeData: [
                {title: "Wordcount", receivables: "", payables: "", margin: ""},
                {title: "Price", receivables: "", payables: "", margin: ""},
                {title: "Discount 10%", receivables: "", payables: "", margin: ""},
            ]
        }
    },
    methods: {
        getFinanceData() {
            for(let obj of this.financeData) {
                const matchedWords = this.wordsCalculation();
                if(obj.title === "Wordcount") {
                    obj.receivables = this.task.metrics.totalWords - this.task.metrics.nonTranslatable;;
                    obj.payables = matchedWords;
                    obj.margin = obj.receivables - obj.payables;
                }
                if(obj.title === "Price") {
                    obj.receivables = this.step.receivables;
                    obj.payables = this.step.payables;
                    obj.margin = this.step.margin;
                }
                if(obj.title === "Discount 10%") {
                    obj.receivables = this.step.discount || "";
                }
            }
        },
        wordsCalculation() {
            const excludeKeys = ["nonTranslatable", "totalWords"];
            const words = Object.keys(this.task.metrics).filter(item => {
                return excludeKeys.indexOf(item) === -1;
            }).reduce((init, cur) => {
                return init + this.task.metrics[cur].value;
            }, 0)
            return words;
        },
        addFinanceData() {
            this.financeData.push({
                title: "", receivables: "", payables: "", margin: ""
            })
        }
    },
    components: {
        Vendor,
        Finance
    },
    mounted() {
        this.getFinanceData();
    }
}
</script>

<style lang="scss" scoped>
.step-info {
    padding: 25px;
    &__block {
        margin-bottom: 10px;
    }
}
</style>
