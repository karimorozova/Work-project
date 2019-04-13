<template lang="pug">
    .quote-decision
        TextRadio(
            :isChecked="quoteDecision === 'Send'"
            title="Send a Quote"
            text="I approve for the project to begin immediately and I'll review the quote later."
            @check="(e) => setQuoteDecision('Send')")
        TextRadio(
            :isChecked="quoteDecision === 'Start'"
            title="Start Immediately"
            text="I approve for the project to begin immediately and to receive the quote just for reference."
            @check="(e) => setQuoteDecision('Start')")
</template>

<script>
import TextRadio from "./TextRadio";

export default {
    props: {
        isChecked: {type: Boolean},
        quoteDecision: {type: String}
    },
    methods: {
        setQuoteDecision(value) {
            this.$emit('setQuoteDecision', { value })
        }
    },
    components: {
        TextRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.quote-decision {
   display: flex;
   justify-content: space-between;
   align-items: center;
   box-sizing: border-box;
}

</style>
