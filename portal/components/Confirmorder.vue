<template lang="pug">
    .confirms
        Translationconfirm(v-if="serviceType == 'Translation' || serviceType == 'Graphic Localization'")
        Proofingconfirm(v-if="serviceType == 'Proofing/QA'")
</template>

<script>
import Translationconfirm from './requests/orderConfirm/Translationconfirm.vue';
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
        Proofingconfirm
    },
    mounted() {
        this.serviceDetect()
    }
}
</script>

<style lang="scss">

</style>
