<template lang="pug">
.pair
    span.pair__label {{ label }}:
    slot 
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__label {
        .descriptors & {
            margin-bottom: 8px;
            opacity: 0.67;
        }
        .filters__date &, .filters_flex-end & {
            margin-right: 10px;
        }
    }
    .descriptors & {
        margin-bottom: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .project__textarea & {
        flex-direction: column;
        align-items: flex-start;
    }
    .filters__date &, .filters_flex-end & {
        justify-content: flex-end;
    }
}
</style>
