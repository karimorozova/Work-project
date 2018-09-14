<template lang="pug">
    .education
        .education__main-title EDUCATION
        span.education__comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
        EduTable(:heads="heads" :informations="informations")
            thead(slot="header")
                th(slot="headDeck" v-for="head in heads") {{ head }}
            tbody(slot="tableBody")
                tr(slot="row" v-for="info in informations")
                    td(slot="rowDeck") {{ info.level }}
                    td(slot="rowDeck") {{ info.field }}
                    td(slot="rowDeck") {{ info.instruction }}
                    td(slot="rowDeck") {{ info.grade }}
</template>

<script>
import EduTable from "./education/EduTable";

export default {
    data() {
        return {
            heads: ["Study level", "Field", "Instruction", "Overall Grade"],
            informations: [{level: "PHD", field: "Translation with Languages", instruction: "University of Harvard", grade: "98/100"}]
        }
    },
    methods: {

    },
    components: {
        EduTable
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

.education-table {
    &__table {
        td {
            border: 1px solid #66563D;
            padding: 5px;
        }
        th {
            border-right: 1px solid #FFF;
            background-color: #66563D;
            color: #FFF;
            padding: 5px;
            font-weight: 400;
            &:last-child {
                border-right: 1px solid #66563D;
            }
        }
    }
}

</style>
