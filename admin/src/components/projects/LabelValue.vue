<template lang="pug">
.pair
    span.pair__label {{ label }}: 
    span.pair__value {{ value }}
</template>

<script>
export default {
    props: {
        label: {
            type: String
        },
        value: {
            type: String
        }
    }    
}
</script>

<style lang="scss" scoped>
.pair {
    margin-bottom: 10px;
    &__label {
        opacity: 0.67;
        .descriptors & {
            margin-bottom: 8px;
        }
    }
    .descriptors & {
        margin-bottom: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
}
</style>
