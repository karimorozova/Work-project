<template lang="pug">
    .translation
        RequestForm(:service="service" @checkErrors="checkErrors" :clientInfo="clientInfo")
        ValidationErrors(v-if="areErrors" :isAbsolute="true" :errors="errors" @closeErrors="closeErrors")
</template>

<script>
import RequestForm from "../../../components/forms/translation/RequestForm";
import ValidationErrors from "~/components/ValidationErrors";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            requestService: "tr",
            service: {title: "Select"},
            areErrors: false,
            errors: []
        }
    },
    methods: {
        ...mapActions({
            submitForm: "createWordsRequest",
            setOrderDetail: "setOrderDetails",
        }),
        closeErrors() {
            this.areErrors = false;
        },
        async checkErrors({service}) {
            this.errors = [];
            if(!this.orderDetails.projectName) this.errors.push('Enter Project name');
            if(!this.orderDetails.deadline) this.errors.push('Set Suggested deadline');
            if(!this.orderDetails.industry) this.errors.push('Select Industry');
            if(!this.orderDetails.source) this.errors.push('Select Source language');
            if(!this.orderDetails.targets || !this.orderDetails.targets.length) this.errors.push('Select Target language(s)');
            if(!this.orderDetails.detailFiles || !this.orderDetails.detailFiles.length) this.errors.push('Upload source file');
            if(this.errors.length) {
                return this.areErrors = true;
            }
            try {
                await this.submitForm({service});
                this.$router.push("/confirm-order");
            } catch(err) {

            }
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
            orderDetails: "getOrderDetails",
            clientInfo: "getClientInfo"
        })
    },
    components: {
        RequestForm,
        ValidationErrors
    },
  created() {
    this.setService();
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

</style>
