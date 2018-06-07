<template lang="pug">
    .confirms
        Translationconfirm(v-if="serviceType == 'Translation'")
        Copywritingconfirm
</template>

<script>
import Translationconfirm from './requests/orderConfirm/Translationconfirm.vue';
import Copywritingconfirm from './requests/orderConfirm/Copywritingconfirm';

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
        Copywritingconfirm
    },
    mounted() {
        this.serviceDetect()
    }
}
</script>

<style lang="scss">

</style>
