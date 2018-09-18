<template lang="pug">
.education
    .education__main-title EDUCATION
    span.education__comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
    EduTable(:fields="fields" 
        :tableData="tableData"
        )
        template(slot="study" slot-scope="{ row, index }")
            SelectSingle(
                :selectedOption="row.study"
                :options="options"
                :activeObject="row"
                @chooseOption="(e) => chooseOption(e, index)"
                )
        template(slot="field" slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.field")
        template(slot="insitute"  slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.insitute")
        template(slot="grade"  slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.grade")  
</template>

<script>
import EduTable from "./education/EduTable";
import SelectSingle from "@/components/dropdowns/tableDrops/SelectSingle" 

export default {
    data() {
        return {
            options: ["asd", "afdaf", "fgbrev"],
            selectedOption: "",
            fields: [
                {label: "Study Level", key: "study", width: "25%"},
                {label: "Field", key: "field", width: "25%"},
                {label: "Institution", key: "insitute", width: "30%"},
                {label: "Overall Grade", key: "grade", width: "20%"},
            ],
            tableData: [
                {study: "", field: "Vasya", insitute: "asdads", grade: "dfbdfbr"},
                {study: "", field: "Petya", insitute: "asdads", grade: "dfbdfbr"},
                {study: "", field: "Kolya", insitute: "asdads", grade: "dfbdfbr"},
            ],
            informations: [{level: "PHD", field: "Translation with Languages", instruction: "University of Harvard", grade: "98/100"}]
        }
    },
    methods: {
        chooseOption({option, activeObject}, index) {
            console.log(option, index);
            this.tableData[index].study = option;
            this.$emit("setValue", {property: 'education', value: this.tableData})
        },
        setEducation() {
            this.$emit("setValue", {property: 'education', value: this.tableData})
        }
    },
    components: {
        EduTable,
        SelectSingle
    }
}
</script>

<style lang="scss" scoped>

.education {
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "2";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
        }   
    }
    &__comment {
        font-size: 12px;
    }
    &__input {
        box-sizing: border-box; 
        border: none;
        outline: none;
        width: 99%;
        color: #67573E;
    }
}

</style>
