<template lang="pug">
    .billing-info
        .names-info
            .names-info__item
                label.names-info__label Official Company Name:
                input(type="text" :value="client.officialName" @change="(e) => changeProperty(e, 'officialName')")
            .names-info__item
                label.names-info__label Contact Name:
                input(type="text" :value="client.contactName" @change="(e) => changeProperty(e, 'contactName')")
            .names-info__item
                label.names-info__label.names-info_asterisk Email:
                input(type="text" :value="client.email" @change="(e) => changeProperty(e, 'email')" :class="{'names-info_error-shadow': errorFields.indexOf('email') !== -1}")
            .names-info__item
                label.names-info__label VAT:
                input(type="text" :value="client.vat" @change="(e) => changeProperty(e, 'vat')")
        .address
            label.names-info__label Address
            textarea(type="text" placeholder="Text here" :value="client.address" @change="(e) => changeProperty(e, 'address')")
</template>

<script>
export default {
    props: {
        client: {
            type: Object
        },
        errorFields: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
        
        }
    },
    methods: {
        changeProperty(e, prop) {
            this.$emit("changeProperty", {prop, value: e.target.value})
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
            padding: 0 5px;
            outline: none;
            width: 191px;
            height: 30px;
            box-sizing: border-box;
            &:focus {
                color: #67573e;
            }
        }
    }
    &_error-shadow {
        box-shadow: 0 0 5px red;
    }
    &_asterisk {
        position: relative;
        &:after {
            position: absolute;
            content: "*";
            top: -3px;
            right: -8px;
            color: red;
            font-size: 14px;
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
        padding: 5px;
        outline: none;
        resize: none;
        &:focus {
            color: #67573E;
        }
        &::-webkit-input-placeholder {
            opacity: 0.5;
        }
    }    
}

</style>
