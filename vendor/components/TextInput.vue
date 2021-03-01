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
        font-size: 14px;
        margin-bottom: 5px;
    }
    &__input {
        padding: 5px;
        height: 30px;
        outline: none;
        border: 1px solid #67573E;
        border-radius: 7px;
        color: #67573E;
        &:focus {
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
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
        font-size: 14px;
        opacity: 0.5;
        margin-top: 5px;
        .personal_contacts-height & {
            @media (max-width: 450px) {
                display: none;
            }
        }
    }
}

</style>
