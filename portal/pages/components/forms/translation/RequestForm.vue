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
        )
</template>

<script>
import Languages from "./Languages";
import ProjectDetails from "./ProjectDetails";
import Brief from "./Brief";
import FormWrapper from "../FormWrapper";
import ProjectName from "../ProjectName";
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
        }
    },
    methods: {
        ...mapActions({
            setOrderDetails: "setOrderDetails",
            setOrderDetail: "setOrderDetail",
            submitForm: "submitForm",
            setDefaultSource: "setDefaultSource"
        }),
        setQuoteDecision({value}) {
            this.setOrderDetail({prop: 'quoteDecision', value});
        },
        checkErrors() {
            this.$emit('checkErrors', {service: this.service});
        }
    },
    computed: {
        ...mapGetters({
            services: "getAllServices",
            orderDetails: "getOrderDetails"
        }),
        service() {
            return this.services.length ? this.services.find(item => item.symbol === this.requestService) : {title: 'Select'};
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
    components: {
        FormWrapper,
        ProjectName,
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
        this.setDefaultSource();
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
        width: 48%;
    }
    &__deadline {
        width: fit-content;
    }
    &_centered {
        justify-content: center;
    }
}

</style>