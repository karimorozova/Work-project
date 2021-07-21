<template lang="pug">
.preview(v-click-outside="closePreview")
    span.preview__close(@click="closePreview") +
    .preview__title Quote Preview
    .preview__details
        .preview__message
    .preview__button
        Button(value="Send" @clicked="send")
</template>

<script>
import ClickOutside from "vue-click-outside";
import Button from "../Button";

export default {
    props: {
        message: {
            type: String
        }
    },
    methods: {
        closePreview() {
            this.$emit("closePreview");
        },
        send() {
            const element = document.querySelector(".preview__message");
            const message = element.innerHTML;
            this.$emit("send", { message });
        },
    },
    computed: {
        projectLanguages() {
            let result = this.project.tasks.reduce((init, cur) => {
                return `${init}${cur.sourceLanguage}${cur.targetLanguage}; `
            }, "")
        }
    },
    components: {
        Button
    },
    directives: {
        ClickOutside
    },
    mounted() {
        let element = document.querySelector(".preview__message");
        element.insertAdjacentHTML('beforeend', this.message);
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.preview {
    position: relative;
    background-color: $white;
    width: max-content;
    top: 10%;
    left: 20%;
    padding: 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    &__close {
        position: absolute;
        top: 5px;
        right: 10px;
        transform: rotate(45deg);
        font-weight: 600;
        font-size: 24px;
        cursor: pointer;
    }
    &__details {
        width: 100%;
        box-sizing: border-box;
        overflow-y: auto;
    }
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
    &__message {
        max-height: 600px;
        width: 100%;
    }
    &__button {
        margin-top: 20px;
    }
}

</style>
