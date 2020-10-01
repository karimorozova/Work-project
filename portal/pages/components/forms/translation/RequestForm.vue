<template lang="pug">
    .request-form
        FormWrapper
            form.form
                .form__block
                    .form__name
                        ProjectName
                    .form__deadline
                        Deadline
                .form__block
                    .form__number
                      ProjectNumber
                    .form__industry
                        IndustriesDrop(
                            :selectedIndustry="selectedIndustry"
                            :industries="industries"
                            @setIndustry="setIndustry"
                        )
                .form__block
                    Languages(:clientInfo="clientInfo")
                .form__block
                    ProjectDetails
                .form__block
                    Brief
                .form__block
                    QuoteDecision(:quoteDecision="quoteDecision" @setQuoteDecision="setQuoteDecision")
                .form__block.form_centered
                    Button(value="Submit" @makeAction="checkErrors")
        OrderInfo(
            :service="service.title"
            :industry="selectedIndustry"
        )
</template>

<script>
import Languages from "./Languages";
import ProjectDetails from "./ProjectDetails";
import Brief from "./Brief";
import FormWrapper from "../FormWrapper";
import ProjectName from "../ProjectName";
import ProjectNumber from "../ProjectNumber";
import IndustriesDrop from "./IndustriesDrop";
import Deadline from "../Deadline";
import QuoteDecision from "../QuoteDecision";
import OrderInfo from "../OrderInfo";
import Button from "~/components/buttons/Button";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        service: {type: Object},
        clientInfo: {
          type: Object
        }
    },
    data() {
        return {
            selectedIndustry: "",
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetails",
            "setOrderDetail",
            "alertToggle"
        ]),
        setQuoteDecision({value}) {
            this.setOrderDetail({prop: 'quoteDecision', value});
        },
        setIndustry({option}) {
            this.selectedIndustry = option;
            const industry = this.clientIndustries.find(item => item.name === option);
            this.setOrderDetail({prop: 'industry', value: industry._id});
        },
        checkErrors() {
            this.$emit('checkErrors', {service: this.service});
        },
    },
    computed: {
        ...mapGetters({
            services: "getAllServices",
            orderDetails: "getOrderDetails",
            clientIndustries: "getClientIndustries",
        }),
        industries() {
            return this.clientIndustries ? this.clientIndustries.map(item => item.name) : [];
        },
        formattedDeadline() {
            let result = "";
            if(this.orderDetails.deadline) {
                result = moment(this.orderDetails.deadline).format("DD-MM-YYYY")
            }
            return result;
        },
        quoteDecision() {
            return this.orderDetails.quoteDecision || "Send";
        }
    },
    watch: {
        clientIndustries: function(val) {
            if (val.length === 1) {
                this.selectedIndustry = val[0].name;
                this.setOrderDetail({prop: 'industry', value: val[0]._id})
            }
        }
    },
    components: {
        FormWrapper,
        ProjectName,
        ProjectNumber,
        IndustriesDrop,
        Deadline,
        Languages,
        ProjectDetails,
        Brief,
        QuoteDecision,
        OrderInfo,
        Button
    },
    mounted() {
        this.setOrderDetails({});
        this.setOrderDetail({prop: 'quoteDecision', value: 'Send'});
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.request-form {
    width: 100%;
    display: flex;
    align-items: flex-start;
}

.form {
    &__block {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        box-sizing: border-box;
        &:last-child {
            margin-bottom: 20px;
        }
    }
    &__name {
        width: 220px;
    }
    &__deadline {
        width: 220px;
    }
    &__industry {
        position: relative;
        width: 220px;
        margin-left: 12px;
        z-index: 20;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
