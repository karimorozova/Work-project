<template lang="pug">
    .copywriting    
        FormWrapper
            RequestForm(:service="service" @showErrors="showErrors")
        OrderInfo(
            :service="service.title"
            :isDuo="false"
            :isCopywriting="true"
        )
        ValidationErrors(v-if="areErrors" :errors="errors" @closeErrors="closeErrors" customClass="client-request-form")
</template>

<script>
import FormWrapper from "@/pages/components/forms/FormWrapper";
import OrderInfo from "@/pages/components/forms/OrderInfo";
import RequestForm from "@/pages/components/forms/copywriting/RequestForm";
import ValidationErrors from "@/components/ValidationErrors";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            requestService: "co",
            service: {title: "Select"},
            areErrors: false,
            errors: []
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetails",
            "setOrderDetail"
        ]),
        showErrors({errors}) {
            this.errors = errors;
            this.areErrors = true;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async setService() {
            try {
                const serv = await this.$axios.get(`/portal/request-service?symbol=${this.requestService}`);
                this.service = serv.data;
            } catch(err) {

            }
        }
    },
    components: {
        FormWrapper,
        OrderInfo,
        RequestForm,
        ValidationErrors
    },
    created() {
        this.setOrderDetails({});
        this.setOrderDetail({prop: 'quoteDecision', value: 'Send'});
        this.setOrderDetail({prop: 'genbrief', value: {}});
        this.setService();
    }
}
</script>

<style lang="scss" scoped>

.copywriting {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

</style>
