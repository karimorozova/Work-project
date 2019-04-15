<template lang="pug">
  .confirms
    p.confirms__header THANK YOU FOR YOUR ORDER!
    p.confirms__summary-text SUMMARY BELOW:
    Translationconfirm(v-if="serviceType == 'Translation' || serviceType == 'Localization'")
    //- Proofingconfirm(v-if="serviceType == 'Proofing'")
    //- Copywritingconfirm(v-if="serviceType == 'Copywriting'")
    //- Marketingconfirm(v-if="serviceType == 'Marketing'")
</template>

<script>
  import Translationconfirm from '~/components/requests/orderConfirm/Translationconfirm.vue';
  import Copywritingconfirm from '~/components/requests/orderConfirm/Copywritingconfirm';
  import Marketingconfirm from '~/components/requests/orderConfirm/Marketingconfirm';
  import Proofingconfirm from '~/components/requests/orderConfirm/Proofingconfirm.vue';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {
        serviceType: "Translation",
      }
    },
    methods: {
      serviceDetect() {
        if(this.orderDetails.service) {
          let service = this.services.find(item => this.orderDetails.service === item._id);
          this.serviceType = service.title;
        }
      }
    },
    computed: {
      ...mapGetters({
        orderDetails: "getOrderDetails",
        services: 'getAllServices'
      })
    },
    components: {
      Translationconfirm,
      Copywritingconfirm,
      Proofingconfirm,
      Marketingconfirm
    },
    mounted() {
      this.serviceDetect()
    }
  }
</script>

<style lang="scss">
@import "../../../assets/scss/colors.scss";

.confirms {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: $main-color;
  box-sizing: border-box;
  &__header {
    font-size: 22px;
    margin-bottom: 0;
  }
  &__summary-text {
    font-size: 14px;
  }
}

</style>
