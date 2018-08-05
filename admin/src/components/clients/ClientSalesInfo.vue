<template lang="pug">
    .sales-info
        .lead-info
            label Lead Source:
            .lead-info__data
                span Adwords
        .status-info
            label Sales comission status:
            .status-info__data    
                span Passed threshold
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

.sales-info {
    font-size: 14px;
    display: flex;
    flex-direction: column;
}

.lead-info, .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 280px;
    label {
        margin-bottom: 0;
    }
    &__data {
        display: flex;
        justify-content: flex-start;
        width: 40%;
        opacity: 0.4;
    }
}
.lead-info {
    margin-bottom: 30px;
}

</style>
