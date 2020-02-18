<template lang="pug">
.step-info
    span.step-info__close(@click="closeInfo") +
    .step-info__block Step Id - {{ step.stepId }}
    .step-info__block
        Vendor(
            :step="step"
            :vendors="vendors"
            :vendor="step.vendor"
        )
    .step-info__block
        Finance(
            :step="step"
            :financeData="financeData"
            @refreshFinance="refreshFinance"
        )
    .step-info__block(v-if="step.serviceStep.symbol === 'translation'")
        Matrix(
            :matrixData="matrixData"
            :step="step"
            @toggleMatrixRowActive="toggleMatrixRowActive"
            @updateMatrixValue="updateMatrixValue"
            @refreshMatrix="refreshMatrix"
        )
    .step-info__block
        Files(
            :stepFiles="stepFiles"
            :step="step"
            :xtmJobs="task.xtmJobs"
            :projectId="task.projectId"
        )
</template>

<script>
import Vendor from "../stepinfo/Vendor";
import Finance from "../stepinfo/finance/Finance";
import Matrix from "../stepinfo/Matrix";
import Files from "../stepinfo/Files";
import { mapGetters, mapActions } from 'vuex';

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
        },
        index: {
            type: [Number, String]
        }
    },
    data() {
        return {
            matrixData: [],
        }
    },
    methods: {
        getMatrixData(rateProp, prop) {
            if(this.step.serviceStep.symbol !== "translation") {
                return
            }
            this.matrixData = [];
            const rateValue = this.step[rateProp] ? +this.step[rateProp].value : 0;
            for(let key of Object.keys(this.task.metrics)) {
                if(key !== "totalWords") {
                    this.matrixData.push({
                        key: key,
                        active: false,
                        title: this.task.metrics[key].text,
                        value: this.task.metrics[key][prop]*100,
                        wordcount: this.task.metrics[key].value,
                        rate: rateValue*this.task.metrics[key][prop],
                        total: rateValue*this.task.metrics[key][prop]*this.task.metrics[key].value
                    });
                }
            }
            this.lastMatrixDateRow(rateProp);
        },
        lastMatrixDateRow(rateProp) {
            const totalMatchedWords = this.matrixData.reduce((init, cur) => {
                return init + cur.wordcount;
            }, 0);
            // const wordcount = this.task.metrics.totalWords - totalMatchedWords - this.task.metrics.nonTranslatable;
            // const rateValue = this.step[rateProp] ? +this.step[rateProp].value : 0;
            // const total = wordcount*rateValue;
            // this.matrixData.push({
            //     active: false,
            //     title: "No match",
            //     value: "100",
            //     wordcount: wordcount,
            //     rate: rateValue,
            //     total: total
            // })
        },
        stepFilesFiller(arr, category) {
            let files = [];
            for(let file of arr) {
                const nameArr = file.split('/');
                const filePath =  __WEBPACK__API_URL__ + file.split('./dist')[1];
                const fileName = nameArr[nameArr.length - 1];
                files.push({
                    check: false,
                    fileName: fileName,
                    category: category,
                    source: filePath,
                    target: this.step.targetFile || ""
                })
            }
            return files;
        },
        toggleMatrixRowActive({index}) {
            this.matrixData[index].active = !this.matrixData[index].active;
        },
        async updateMatrixValue({index, prop}) {
            const property = prop === "receivables" ? "client" : "vendor"
            try {
            await this.updateMatrix({
                projectId: this.currentProject._id,
                taskId: this.task.taskId,
                step: this.step,
                key: this.matrixData[index].key,
                value: this.matrixData[index].value,
                prop: property
            });
                this.refreshMatrix({costs: prop});
                this.alertToggle({message: "The matrix has been updated.", isShow: true , type: "success"})
            } catch(err) {
                this.alertToggle({message: "Internal server error / Cannot update matrix.", isShow: true , type: "error"})
            }
            this.matrixData[index].active = false;
        },
        refreshMatrix({costs}) {
            return costs === 'receivables' ? this.getMatrixData('clientRate', 'client')
            : this.getMatrixData('vendorRate', 'vendor')
        },
        refreshFinance({costs}) {
          console.log('refresh finance', costs);
        },
        closeInfo() {
            this.$emit("closeStepInfo");
        },
        ...mapActions({
            alertToggle: "alertToggle",
            updateMatrix: "updateMatrix"
        })
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        }),
        financeData() {
            return Object.keys(this.step.finance).reduce((prev, cur) => {
                let receivables = +this.step.finance[cur].receivables;
                let payables = +this.step.finance[cur].payables;
                if(this.step.finance[cur].halfReceivables >= 0) {
                    receivables = +this.step.finance[cur].halfReceivables;
                    payables = +this.step.finance[cur].halfPayables;
                }
                const margin = (receivables - payables).toFixed(2);
                return [...prev, {
                    title: cur,
                    receivables,
                    payables,
                    margin,
                    clientRate: this.step.clientRate,
                    vendorRate: this.step.vendorRate
                    }
                ]
            },[])
        },
        stepFiles() {
            let result = [];
            if(this.task.sourceFiles) {
                result.push(...this.stepFilesFiller(this.task.sourceFiles, "Source file"));
            }
            if(this.task.refFiles) {
                result.push(...this.stepFilesFiller(this.task.refFiles, "Reference file"));
            }
            return result;
        }
    },
    components: {
        Vendor,
        Finance,
        Matrix,
        Files
    },
    mounted() {
        this.getMatrixData('clientRate', 'client');
    }
}
</script>

<style lang="scss" scoped>
.step-info {
    padding: 25px;
    position: relative;
    &__block {
        margin-bottom: 10px;
    }
    &__close {
        position: absolute;
        top: 3px;
        right: 8px;
        transform: rotate(45deg);
        font-size: 24px;
        font-weight: 600;
        cursor: pointer;
    }
}
</style>
