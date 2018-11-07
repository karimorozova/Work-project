<template lang="pug">
.sidebar
    span.sidebar__title(v-if="title") {{ title }}
    .sidebar__inner
      .sidebar__item(v-for="(link, index) in links" @click="onLinkClick(index)") {{ link }}
</template>

<script>
export default {
    props: {
        links: {
            type: Array
        },
        title: {
            type: String
        }
    },
    methods: {
        onLinkClick(index) {
            this.$emit("onLinkClick", {index})
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.sidebar {
    height: 100%;
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px $brown-shadow;
    display: flex;
    flex-direction: column;
    color: $main-color;
    font-size: 22px;
    transition: all 1s;
    &__title {
        display: flex;
        justify-content: center;
        padding: 44px 0;
        font-weight: 700;
    }
    &__inner {
        display: flex;
        flex-direction: column;
    }   
    &__item {
        display: flex;
        justify-content: center;
        border-top: 1px solid $beige;
        border-bottom: 1px solid $beige;
        padding: 5px 0;
        cursor: pointer;
        &:nth-child(2) {
            border: none;
        }
    }  
}
</style>
