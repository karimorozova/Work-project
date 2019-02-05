<template lang="pug">
.step-info
    .step-info__block
        Vendor(
            :step="step"
            :vendors="vendors"
            :vendor="step.vendor"
            @setStepVendor="setStepVendor"
        )
    .step-info__block
        Finance(
            :financeData="financeData"
            @addRow="addFinanceData"
        )
    .step-info__block(v-if="step.name === 'translate1'")
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
            :projectId="task.projectId"
        )
</template>

<script>
import Vendor from "../stepinfo/Vendor";
import Finance from "../stepinfo/Finance";
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
            stepFiles: [],
            excludeKeys: ["nonTranslatable", "totalWords"]
        }
    },
    methods: {
        addFinanceData() {
            return
        },
        setStepVendor({person}) {
            this.$emit("setStepVendor", { person });
        },
        getMatrixData(rateProp, prop) {
            if(this.step.name !== "translate1") {
                return
            }
            this.matrixData = [];
            for(let key of Object.keys(this.task.metrics)) {
                if(this.excludeKeys.indexOf(key) === -1) {
                    this.matrixData.push({
                        key: key,
                        active: false,
                        title: this.task.metrics[key].text,
                        value: this.task.metrics[key][prop]*100, 
                        wordcount: this.task.metrics[key].value,
                        rate: +this.step[rateProp]*this.task.metrics[key][prop],
                        total: this.step[rateProp]*this.task.metrics[key][prop]*this.task.metrics[key].value
                    });
                }
            }
            this.lastMatrixDateRow(rateProp);
        },
        lastMatrixDateRow(rateProp) {
            const totalMatchedWords = this.matrixData.reduce((init, cur) => {
                return init + cur.wordcount; 
            }, 0);
            const wordcount = this.task.metrics.totalWords - totalMatchedWords - this.task.metrics.nonTranslatable;
            const total = wordcount*this.step[rateProp];
            this.matrixData.push({
                active: false,
                title: "No match",
                value: "100",
                wordcount: wordcount,
                rate: +this.step[rateProp],
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
            return Object.keys(this.step.finance).reduce((init, cur) => {
                const margin = this.step.finance[cur].receivables - this.step.finance[cur].payables;
                return [...init, {
                    title: cur,
                    receivables: +this.step.finance[cur].receivables,
                    payables: +this.step.finance[cur].payables,
                    margin: +margin.toFixed(2)
                    }
                ]
            },[])
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
