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
    .step-info__block
        Matrix(
            :matrixData="matrixData"
        )
    .step-info__block
        Files(
            :stepFiles="stepFiles"
            :step="step"
            :projectId="task.projectId"
        )
</template>

<script>
import Vendor from "./stepinfo/Vendor";
import Finance from "./stepinfo/Finance";
import Matrix from "./stepinfo/Matrix";
import Files from "./stepinfo/Files";
import { mapGetters } from 'vuex';

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
            ],
            matrixData: [],
            stepFiles: [],
            excludeKeys: ["nonTranslatable", "totalWords"]
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
            const words = Object.keys(this.task.metrics).filter(item => {
                return this.excludeKeys.indexOf(item) === -1;
            }).reduce((init, cur) => {
                return init + this.task.metrics[cur].value;
            }, 0)
            return words;
        },
        addFinanceData() {
            this.financeData.push({
                title: "", receivables: "", payables: "", margin: ""
            })
        },
        getMatrixData() {
            for(let key of Object.keys(this.task.metrics)) {
                if(this.excludeKeys.indexOf(key) === -1) {
                    this.matrixData.push({
                        title: this.task.metrics[key].text,
                        value: this.task.metrics[key].client*100, 
                        wordcount: this.task.metrics[key].value,
                        rate: this.step.clientRate*this.task.metrics[key].client,
                        total: this.step.clientRate*this.task.metrics[key].client*this.task.metrics[key].value
                    });
                }
            }
            this.lastMatrixDateRow();
        },
        lastMatrixDateRow() {
            const totalMatchedWords = this.matrixData.reduce((init, cur) => {
                return init + cur.wordcount; 
            }, 0);
            const wordcount = this.task.metrics.totalWords - totalMatchedWords;
            const total = wordcount*this.step.clientRate;
            this.matrixData.push({
                title: "No match",
                value: "100",
                wordcount: wordcount,
                rate: this.step.clientRate,
                total: total
            })
        },
        getStepFiles() {
            this.stepFilesFiller(this.currentProject.sourceFiles, "Source file");
            this.stepFilesFiller(this.currentProject.refFiles, "Reference file");
        },
        stepFilesFiller(arr, category) {
            for(let file of arr) {
                const nameArr = file.split('/');
                const filePath =  __WEBPACK__API_URL__ + file.split('./dist')[1];
                const fileName = nameArr[nameArr.length - 1];
                this.stepFiles.push({
                    check: false,
                    fileName: fileName,
                    category: category,
                    source: filePath,
                    target: this.step.targetFile || ""
                })
            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        })
    },
    components: {
        Vendor,
        Finance,
        Matrix,
        Files
    },
    mounted() {
        this.getFinanceData();
        this.getMatrixData();
        this.getStepFiles();
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
