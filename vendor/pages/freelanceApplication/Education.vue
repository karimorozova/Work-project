<template lang="pug">
.education
    .education__main-title EDUCATION
    span.education__comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
    EduTable(
        :fields="fields"
        :tableData="tableData"
        :tbodyHasScroll="tbodyHasScroll"
        )
        template(slot="study" slot-scope="{ row, main }")
            SelectSingle(
                :selectedOption="row.study"
                :options="options"
                :activeObject="row"
                @toggleDropMenu="toggleDropMenu"
                @chooseOption="(e) => chooseOption(e, main)"
                )
        template(slot="field" slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.field")
        template(slot="insitute"  slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.institute")
        template(slot="grade"  slot-scope="{ row }")
            input.education__input(@change="setEducation" type="text" v-model="row.grade")
    .education__button
        Add(@makeAction="addEducation")
        .education__button-label Add more Education information
</template>

<script>
import EduTable from "./education/EduTable";
import SelectSingle from "@/components/dropdowns/tableDrops/SelectSingle"
import Add from "@/components/buttons/Add"

export default {
    data() {
        return {
            options: ["Diploma", "BA", "MA/MSc", "PhD", "Course"],
            selectedOption: "",
            fields: [
                {label: "Study Level", key: "study", width: "25%"},
                {label: "Field", key: "field", width: "25%"},
                {label: "Institution", key: "insitute", width: "30%"},
                {label: "Overall Grade", key: "grade", width: "20%"},
            ],
            tableData: [
                {study: "", field: "", institute: "", grade: ""}
            ],
            informations: [{level: "PHD", field: "Translation with Languages", instruction: "University of Harvard", grade: "98/100"}],
            isDropped: false
        }
    },
    methods: {
        chooseOption({option, activeObject}, index) {
            this.tableData[index].study = option;
            this.$emit("setValue", {property: 'education', value: this.tableData})
        },
        setEducation() {
            this.$emit("setValue", {property: 'education', value: this.tableData})
        },
        addEducation() {
            this.tableData.push({
                study: "", field: "", institute: "", grade: ""
                })
        },
        toggleDropMenu({isDropped}) {
            this.isDropped = isDropped;
        }
    },
    computed: {
        tbodyHasScroll() {
            if(process.browser && this.tableData.length > 3 || this.isDropped) {
                let body = document.getElementsByTagName("body")[0];
                if(body.offsetWidth > 1024) {
                    let tbody = document.getElementsByClassName("table__tbody")[0];
                    return tbody.scrollHeight >= tbody.clientHeight;
                }
            }
        }
    },
    components: {
        EduTable,
        SelectSingle,
        Add
    }
}
</script>

<style lang="scss" scoped>

.education {
    width: 100%;
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
            @media (max-width: 320px) {
                font-size: 24px;
            }
        }
        @media (max-width: 320px) {
            font-size: 20px;
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
    &__button {
        margin-top: 10px;
        opacity: 0.7;
        display: flex;
        align-items: center;
    }
    &__button-label {
        font-size: 12px;
        margin-left: 5px;
    }
}

</style>
