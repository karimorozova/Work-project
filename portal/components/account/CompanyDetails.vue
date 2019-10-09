<template lang="pug">
    .company-details
        .title Company Details
        .details
            .details__item
                p.details__title Company Name
                p {{ client.name }}
            .details__item
                p.details__title Website
                p {{ client.website }}
</template>

<script>
export default {
    props: {
        client: {type: Object}
    }
}
</script>

<style lang="scss" scoped>

.company-details {
    margin-top: 20px;
    margin-bottom: 40px;
}

.details {
    padding-top: 35px;
    display: flex;
    padding-left: 20px;
    display: flex;
    justify-content: space-around;
    &__item {
        width: 270px;
    }
    &__title {
        font-size: 12px;
    }
}

.title {
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 20px;
    border-bottom: 2px solid rgba(153, 142, 126, 0.5);
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

</style>
