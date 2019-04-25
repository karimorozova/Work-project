<template lang="pug">
    .order
        .order__data
            .order__item
                DetailValuePair(title="PROJECT NAME:" :value="projectName")
            .order__item
                DetailValuePair(title="SUGGESTED DEADLINE:" :value="deadline")
        .order__data
            .order__item
                DetailValuePair(title="SOURCE LANGUAGE:" :value="sourceLang")
            .order__item
                DetailValuePair(title="TARGET LANGUAGE(S):" :value="targetLangs")
        .order__data
            .order__item
                DetailValuePair(title="PROJECT FILE(S):" :value="detailFilesList")
            .order__item
                DetailValuePair(title="REFERENCE FILE(S):" :value="refFilesList")
        .order__data
            .order__item.order_width-100
                DetailValuePair(title="BRIEF:" :value="briefText")
        .order__footer
            p.footText(v-if="orderDetails.quoteDecision == 'Send'")
                | A QUOTE WILL BE SENT SHORTLY
            p.footText(v-else)
                | THE PROJECT WILL BEGIN SHORTLY
</template>

<script>
import moment from 'moment';
import DetailValuePair from "./DetailValuePair";
import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        projectName() {
            return this.orderDetails.projectName || ""
        },
        deadline() {
            return this.orderDetails.deadline ? moment(this.orderDetails.deadline).format('DD/MM/YYYY') : "";
        },
        sourceLang() {
            return this.orderDetails.source ? this.orderDetails.source.lang : "";
        },
        targetLangs() {
            let result = "";
            if(this.orderDetails.targets && this.orderDetails.targets.length) {
                result = this.orderDetails.targets.reduce((init, cur) => {
                    return init + `${cur.lang}; `
                },"") 
            }
            return result;
        },
        detailFilesList() {
            let files = "";
            if(this.orderDetails.detailFiles && this.orderDetails.detailFiles.length) {
                files = this.orderDetails.detailFiles.reduce((init, cur) => {
                    return init + `${cur.name}; `
                },"")
            }
            return files;
        },
        refFilesList() {
            let files = "";
            if(this.orderDetails.refFiles && this.orderDetails.refFiles.length) {
                files = this.orderDetails.refFiles.reduce((init, cur) => {
                    return init + `${cur.name}; `
                },"")
            }
            return files;
        },
        briefText() {
            return this.orderDetails.brief || "";
        }
    },
    components: {
        DetailValuePair
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.order {
    width: 40%;
    margin-top: 40px;
    &__data {
        display: flex;
        justify-content: space-between;
        margin-bottom: 50px;
    }
    &__item {
        width: 35%;
        word-break: break-word;
    }
    &__footer {
        display: flex;
        justify-content: center;
        margin-top: 60px;
        font-size: 12px;
    }
    &_width-100 {
        width: 100%;
    }
}

</style>
