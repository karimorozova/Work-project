<template lang="pug">
    .requests
        .requests__table Here should be a table with all requests
</template>

<script>

export default {
    data() {
        return {};
    },
    methods: {

    }
};

</script>

<style lang="scss" scoped>

.requests {
    display: flex;
    width: 100%;
    &__table {
        max-width: calc(100% - 150px);
    }
}

</style>
