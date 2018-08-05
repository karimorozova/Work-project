<template lang="pug">
    .billing-info
        .names-info
            .names-info__item
                label Official Company Name:
                input(type="text" v-model="billInfo.officialName")
            .names-info__item
                label Contact Name:
                input(type="text" v-model="billInfo.contactName")
            .names-info__item
                label Email:
                input(type="text" v-model="billInfo.email")
            .names-info__item
                label VAT:
                input(type="text" v-model="billInfo.vat")
        .address
            label Address
            textarea(type="text" placeholder="Text here" v-model="billInfo.address")
</template>

<script>
export default {
    data() {
        return {
            billInfo: {
                officialName: 'Official Company Name',
                contactName: 'Contact name',
                email: 'Email',
                vat: 'VAT',
                address: ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>

.billing-info {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.names-info {
    width: 44%;
    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 0;
        }
        label {
            margin-bottom: 0;
        }
        input {
            color: rgba(103, 87, 62, 0.5);
            border: 1px solid #67573e;
            border-radius: 5px;
            padding: 0 3px;
            outline: none;
            width: 185px;
            height: 28px;
            &:focus {
                color: #67573e;
            }
        }
    }
}

.address {
    width: 33%;
    display: flex;
    justify-content: space-between;
    label {
        padding-top: 6px;
        margin-bottom: 0;
    }
    textarea {
        color: rgba(103, 87, 62, 0.5);
        height: 172px;
        width: 185px;
        border: 1px solid #67573e;
        border-radius: 5px;
        padding: 3px;
        outline: none;
        resize: none;
        &:focus {
            color: #67573E;
        }
    }
}

</style>
