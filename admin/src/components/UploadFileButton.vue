<template lang="pug">
.upload-file
    span.upload-file__label(v-if="label") {{ label }}
    .upload-file__button
        .upload-file__button-text {{ text }}
        slot
    span.upload-file__comment(v-if="comment") {{ comment }}
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: ""
        },
        text: {
            type: String
        },
        comment: {
            type: String
        }
    },
    data() {
        return {
            files: []
        }
    }
}
</script>

<style lang="scss" scoped>

.upload-file {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__button {
        overflow: hidden;
        position: relative;
        width: 150px;
        padding: 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        box-shadow: 0 3px 5px rgba(103, 87, 62, 0.5);
        background-color: #d15f45;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);     
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
        @media (max-width: 450px) {
            width: 100px;
        }
        .project-info & {
            width: 186px;
            height: 30px;
            padding: 0;
            margin-bottom: 0;
        }
    }
    &__button-text {
        z-index: 1;
        position: relative;
        color: #fff;
        font-size: 15px;
        font-family: MyriadPro;
        text-align: center;
        .project-info & {
            padding-top: 7px;
        }
    }
    &__input {
        top: 0px;
        right: -25px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 30px;
        font-family: MyriadPro;             
    }
    &__label {
        font-size: 12px;
    }
    &__comment {
        font-size: 12px;
        opacity: 0.6;
    }
    input {
        top: 0px;
        right: -25px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 30px;
        font-family: MyriadPro;  
    }
}
</style>
