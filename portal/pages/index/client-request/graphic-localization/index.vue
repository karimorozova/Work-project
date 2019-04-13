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
            quoteDecision: "Send"
        }
    },
    methods: {
        setQuoteDecision({value}) {
            this.quoteDecision = value;
        },
    },
    components: {
        RequestForm,
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

</style>
