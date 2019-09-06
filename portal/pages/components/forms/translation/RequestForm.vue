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
                    .form__industry
                        IndustriesDrop(
                            :selectedIndustry="selectedIndustry"
                            :industries="industries"
                            @setIndustry="setIndustry"
                        )
                    .form__number
                        ProjectNumber
                .form__block
                    Languages
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
        requestService: {type: String, default: "tr"}
    },
    data() {
        return {
            selectedIndustry: "",
            service: {title: "Select"}
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetails",
            "setOrderDetail",
            "setDefaultSource",
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
        setDefaultIndustry() {
            if(this.clientIndustries.length === 1) {
                this.setOrderDetail({prop: 'industry', value: this.clientIndustries[0]._id})
            }
        },
        async setDefaultRequestSource() {
            try {
                const serv = await this.$axios.get(`/portal/request-service?symbol=${this.requestService}`);
                this.service = serv.data;
                const unit = this.service.calculationUnit ? this.service.calculationUnit.toLowerCase() : "";
                const ratesProp = unit ? `${unit}Rates` : 'wordsRates'
                await this.setDefaultSource({ratesProp});
            } catch(err) { 
                this.alertToggle({message: "Error on getting service and default source", isShow: true, type: "error"})
            }
        }
    },
    computed: {
        ...mapGetters({
            services: "getAllServices",
            orderDetails: "getOrderDetails",
            clientIndustries: "getClientIndustries"
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
        this.setDefaultRequestSource();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.request-form {
    width: 100%;
    display: flex;
    justify-content: center;
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
        width: 247px;
    }
    &__deadline {
        width: fit-content;
    }
    &__industry {
        position: relative;
        width: 247px;
        margin-left: 12px;
        z-index: 20;
    }
    &_centered {
        justify-content: center;
    }
}

</style>