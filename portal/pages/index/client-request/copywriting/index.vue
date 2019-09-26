<template lang="pug">
    .copywriting    
        FormWrapper
            RequestForm
        OrderInfo(
            :service="service.title"
            :isDuo="false"
            :isCoptwriting="true"
        )
</template>

<script>
import FormWrapper from "@/pages/components/forms/FormWrapper";
import OrderInfo from "@/pages/components/forms/OrderInfo";
import RequestForm from "@/pages/components/forms/copywriting/RequestForm";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            requestService: "co",
            service: {title: "Select"}
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetails"
        ]),
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
        RequestForm
    },
    created() {
        this.setOrderDetails({});
        this.setOrderDetails({prop: 'quoteDecision', value: 'Send'});
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
