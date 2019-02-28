<template lang="pug">
    .drop-pair
        .drop-pair__name {{ name }}
        .drop-pair__list
            slot
</template>

<script>
export default {
    props: {
        name: {type: String}
    }
}
</script>

<style lang="scss" scoped>

.drop-pair {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__name {
        font-size: 14px;
    }
    &__list {
        position: relative;
        width: 191px;
        height: 30px;;
    }
}

</style>
