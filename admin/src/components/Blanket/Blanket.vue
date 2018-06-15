<template lang="pug">
    .blanket
        .blanket__title
            p {{ title }}
        .blanket__description Coming soon ...
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ''
        }
    },
    data() {
        return {

        }
    },
    methods: {

    }
}
</script>

<style lang="scss">
    @import "../../assets/styles/blanket/blanket.scss";
</style>
