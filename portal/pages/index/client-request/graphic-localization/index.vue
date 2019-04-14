<template lang="pug">
    .localization
        RequestForm(
            requestService="lo"
        )
</template>

<script>
import RequestForm from "../../../components/forms/translation/RequestForm";

export default {
    data() {
        return {
            
        }
    },
    methods: {
        
    },
    components: {
        RequestForm,
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

</style>
