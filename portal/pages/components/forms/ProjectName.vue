<template lang="pug">
    .project-name
        TitleInput(title="PROJECT NAME:" :isAsterisk="true")
            input.project-name__input(type="text" placeholder="Project Name")
</template>

<script>
import TitleInput from "./TitleInput";

export default {
    components: {
        TitleInput
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.project-name {
    &__input {
        box-sizing: border-box;
        height: 30px;
        width: 90%;
        padding: 0 5px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        font-size: 14px;
        margin-left: 12px;
        margin-top: 5px;
        &::-webkit-input-placeholder {
            opacity: 0.6; 
        }
    }
}

</style>
