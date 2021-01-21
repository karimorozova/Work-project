<template lang="pug">
.upload-file(:class="customClass")
    span.upload-file__label {{ label }}
    .upload-file__button
        .upload-file__button-text {{ buttonTitle}}
        input.upload-file__input(type="file" @change='uploadFile' :multiple="isMultiple" :name="inputName")
    span.upload-file__comment {{ comment }}
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: ""
        },
        buttonTitle : {
            type: String,
            default: "Upload"
        },
        comment: {
            type: String,
            default: "Drag & Drop"
        },
        inputName: {
            type: String
        },
        isMultiple: {
            type: Boolean,
            default: true
        },
        customClass: { type: String }
    },
    data() {
        return {
            
        }
    },
    methods: {
        uploadFile(event) {
            this.$emit("uploadedFile", {files: event.target.files});
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.upload-file {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $main-color;
    &__button {
        overflow: hidden;
        position: relative;
        width: 150px;
        padding: 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        box-shadow: 0 3px 5px rgba(103, 87, 62, 0.5);
        background-color: $orange;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);     
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
        @media (max-width: 550px) {
            width: 120px;
        }
        @media (max-width: 450px) {
            width: 100px;
        }
    }
    &__button-text {
        z-index: 1;
        position: relative;
        color: $white;
        font-size: 15px;
        font-family: Myriad400;
        text-align: center;
    }
    &__input {
        top: 0px;
        right: -25px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 0;
        width: 195px;
        height: 38px;
        font-family: Myriad400;
        @media (max-width: 550px) {
            width: 140px;
            right: 0;
        }         
    }
    &__label {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__comment {
        font-size: 12px;
        opacity: 0.6;
    }
    .personal__item & {
        @media (max-width: 450px) {
            margin-top: 40px;
        }
    }
}
</style>
