<template lang="pug">
    Translationconfirm(v-if="serviceType == 'Translation'")
</template>

<script>
import Translationconfirm from './requests/orderConfirm/Translationconfirm.vue';

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
        Translationconfirm
    },
    mounted() {
        this.serviceDetect()
    }
}
</script>

<style lang="scss">

</style>
