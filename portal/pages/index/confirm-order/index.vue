<template lang="pug">
  .confirms
    p.confirms__message Thank you for request!
    //- Translationconfirm(v-if="serviceType == 'Translation' || serviceType == 'Graphic Localization'")
    //- Proofingconfirm(v-if="serviceType == 'Proofing/QA'")
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
    props: {
      thanksService: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        translation: false,
        serviceType: "",
      }
    },
    methods: {
      serviceDetect() {
        let service = this.services.find(item => this.orderDetails.service === item._id);
        this.serviceType === service ? service.title : 'Translation';
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

.confirms__message {
  margin-left: 80px;
  color: #67573E;
  font-size: 20px;
}

</style>
