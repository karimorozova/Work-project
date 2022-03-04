<template lang="pug">
.available-pairs(v-click-outside="closeList")
    .available-pairs__main
        .available-pairs__close
                span.available-pairs__close-icon(@click.stop="closeList") +
        .available-pairs__list(v-if="list.length")
            .available-pairs__title Next language pairs will be added: 
            .available-pairs__item(v-for="(pair, index) in list") {{ index + 1 }}. {{ pair.source.lang }} --&#62; {{ pair.target.lang }}
        .available-pairs__empty(v-if="!list.length")
            .available-pairs__message There are no available combinations in chosen pricelist. Please, select another source or target languages.
        .available-pairs__button(v-if="list.length")
            Button(value="Continue" @clicked="addLangs")
</template>

<script>
import ClickOutside from "vue-click-outside";
import Button from "../../Button";

export default {
    props: {
        list: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {

        }
    },
    methods: {
        closeList() {
            this.$emit("closeList")
        },
        addLangs() {
            this.$emit("addLangs");
        }
    },
    components: {
        Button
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.available-pairs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    z-index: 100;
    &__main {
        padding: 35px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      box-shadow: $box-shadow;
        border-radius: 2px;
        background-color: #FFF;
        width: 400px;
    }
    &__close {
        position: relative;
        width: 100%;
    }
    &__close-icon {
        position: absolute;
        transform: rotate(45deg);
        font-weight: 600;
        top: -36px;
        right: -26px;
        font-size: 28px;
        cursor: pointer;
    }
    &__message, &__title {
        color: $orange;
        font-size: 16px;
    }
    &__title {
        margin-bottom: 20px;
    }
    &__button {
        margin-top: 20px;
    }
}

</style>
