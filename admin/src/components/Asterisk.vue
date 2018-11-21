<template lang="pug">
    span.red-asterisk(:style="customStyle") *    
</template>

<script>
export default {
    props: {
        customStyle: {
            type: Object
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.red-asterisk {
    position: absolute;
    top: -8px;
    right: -8px;
    color: $red;
    font-size: 14px;
}
</style>
