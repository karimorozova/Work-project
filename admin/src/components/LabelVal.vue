<template lang="pug">
.pair(:class="customClass")
    label.pair__label {{ text }}
        Asterisk(v-if="isRequired" :customStyle="{top: '-4px'}")
    .pair__value
        slot    
</template>

<script>
import Asterisk from "./Asterisk";

export default {
    props: {
        text: {
            type: String
        },
        customClass: {
            type: String
        },
        isRequired: {
            type: Boolean,
            default: false
        }
    },
    components: {
        Asterisk
    }
}
</script>

<style lang="scss" scoped>
.pair {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    &__label {
        position: relative;
        margin: 0;
    }
}

.finance-details {
    justify-content: flex-start;
    .pair__label {
        width: 50%;
        font-weight: bold;
    }
}
</style>
