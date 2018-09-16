<template lang="pug">
    .education
        .education__main-title EDUCATION
        span.education__comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
        EduTable(:fields="fields" 
            :tableData="tableData"
            )
            template(v-for="field of fields")
                SelectSingle(v-if="field.key == 1"
                    :slot="field.key"
                    :selectedOption="selectedOption"
                    :options="options"
                )

            
</template>

<script>
import EduTable from "./education/EduTable";
import SelectSingle from "@/components/dropdowns/SelectSingle" 

export default {
    data() {
        return {
            options: ["asd", "afdaf", "fgbrev"],
            selectedOption: "",
            fields: [
                {label: "Study Level", key: 1, width: "25%"},
                {label: "Field", key: 2, width: "25%"},
                {label: "Institution", key: 3, width: "30%"},
                {label: "Overall Grade", key: 4, width: "20%"},
            ],
            tableData: [
                {1: "iod o idjs fos", 2: "Vasya", 3: "asdads", 4: "dfbdfbr"},
                {1: "iod o idjs fos", 2: "Petya", 3: "asdads", 4: "dfbdfbr"},
                {1: "iod o idjs fos", 2: "Kolya", 3: "asdads", 4: "dfbdfbr"},
            ],
            informations: [{level: "PHD", field: "Translation with Languages", instruction: "University of Harvard", grade: "98/100"}]
        }
    },
    methods: {

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
}


</style>
