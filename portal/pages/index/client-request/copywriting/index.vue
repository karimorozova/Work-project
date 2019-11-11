<template lang="pug">
    .copywriting    
        FormWrapper
            RequestForm(:service="service" @checkErrors="checkErrors")
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
import briefParser from "@/mixins/briefParser";
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [briefParser],
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
            "setOrderDetail",
            "createPackagesRequest"
        ]),
        async checkErrors() {
            this.errors = [];
            if(!this.orderDetails.projectName) this.errors.push('Enter Project name');
            if(!this.orderDetails.deadline) this.errors.push('Set Suggested deadline');
            if(!this.orderDetails.targets || !this.orderDetails.targets.length) this.errors.push('Select Target language(s)');
            if(!this.orderDetails.genBrief.Description) this.errors.push('Fill the Description field');
            if(!this.orderDetails.genBrief.isNotSure && !this.orderDetails.genBrief.Topics) this.errors.push('Enter Topics');
            if(!this.orderDetails.tones || !this.orderDetails.tones.length) this.errors.push('Select Tone of Voice');
            if(this.errors.length) {
                return this.areErrors = true;
            }
            try {
                this.setOrderDetail({prop: "brief", value: this.setRequestBrief()});
                await this.createPackagesRequest({service: this.service});
                this.$router.push("/confirm-order");
            } catch(err) { }
        },
        closeErrors() {
            this.areErrors = false;
        },
        async setService() {
            try {
                const serv = await this.$axios.get(`/portal/request-service?symbol=${this.requestService}`);
                this.service = serv.data;
                this.setOrderDetail({prop: 'service', value: this.service._id});
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        })
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
        this.setOrderDetail({prop: 'genBrief', value: {}});
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
