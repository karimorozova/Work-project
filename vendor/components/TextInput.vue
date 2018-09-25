<template lang="pug">
.text-input
    .text-input__label {{ label }}:
    input.text-input__input(type="text" :name="name" @change="setValue")
    span.text-input__example(v-if="example") {{ example }}

</template>

<script>
export default {
    props: {
        label: {
            type: String
        },
        name: {
            type: String
        },
        example: {
            type: String
        }
    },
    methods: {
        setValue({target: {value, name}}) {
            this.$emit("setValue", {property: name, value: value})
        }
    }
}
</script>

<style lang="scss" scoped>

.text-input {
    display: flex;
    flex-direction: column;
    &__label {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__input {
        padding: 5px;
        width: 258px;
        height: 30px;
        outline: none;
        border: 1px solid #67573E;
        border-radius: 15px;
        color: #67573E;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        &:focus {
            box-shadow: 0 0 15px rgba(103, 87, 62, 0.8);
        }
        @media (max-width: 1600px) {
            width: 96%;
        }
        .personal_contacts-height & {
            @media (max-width: 450px) {
                margin-bottom: 15px;
                width: 97%;
            }
        }
        
    }
    &__example {
        position: absolute;
        left: 0;
        bottom: -24px;
        font-size: 12px;
        opacity: 0.5;
        .personal_contacts-height & {
            @media (max-width: 450px) {
                display: none;
            }
        }
    }
}

</style>
