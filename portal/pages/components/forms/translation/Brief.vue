<template lang="pug">
    .project-brief
        span.project-brief__label Enter a short brief
        .project-brief__text
            textarea.project-brief__textarea(rows="6" @input="setBrief")
</template>

<script>
import { mapActions } from "vuex";

export default {
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail"
        }),
        setBrief(e) {
            const value = e.target.value;
            this.setOrderDetail({prop: 'brief', value});
        }
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.project-brief {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-left: 12px;
    box-sizing: border-box;
    &__label {
        font-size: 12px;
        color: $main-color;
        margin-bottom: 5px;
    }
    &__text {
        border: 1px solid $main-color;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
    }
    &__textarea {
        width: 100%;
        border: none;
        padding: 5px 10px;
        outline: none;
        resize: none;
        box-sizing: border-box;
        font-size: 14px;
    }
}

</style>
