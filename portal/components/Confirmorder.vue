<template lang="pug">
    .confirms
        Translationconfirm(v-if="serviceType == 'Translation' || serviceType == 'Graphic Localization'")
        Proofingconfirm(v-if="serviceType == 'Proofing/QA'")
        Copywritingconfirm
</template>

<script>
import Translationconfirm from './requests/orderConfirm/Translationconfirm.vue';
import Copywritingconfirm from './requests/orderConfirm/Copywritingconfirm';
import Proofingconfirm from './requests/orderConfirm/Proofingconfirm.vue';

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
          orderDetails: {}
      }
    },
    methods: {
        serviceDetect() {
            this.serviceType = this.thanksService
        }
    },
    components: {
        Translationconfirm,
        Copywritingconfirm,
        Proofingconfirm
    },
    mounted() {
        this.serviceDetect()
    }
}
</script>

<style lang="scss">

</style>
