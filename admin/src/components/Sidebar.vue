<template lang="pug">
.sidebar
    .sidebar__links
        span.sidebar__title(v-if="title") {{ title }}
        .sidebar__inner
        .sidebar__item(v-for="(link, index) in links" @click="onLinkClick(index)" :class="{linkClass, 'sidebar_active-link': activeIndex === index}")
            .sidebar__link {{ link.title }}
            .sidebar__counter(v-if="link.counter" :class="counterClass") 
                span.sidebar__ {{ link.counter }}
</template>

<script>
export default {
    props: {
        links: {
            type: Array
        },
        title: {
            type: String
        },
        linkClass: {
            type: String
        },
        counterClass: {
            type: String
        },
        activeIndex: {
            type: Number,
            default: -1
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
    min-height: 100%;
    background-color: #fff;
    width: 175px;
    min-width: 175px;
    box-shadow: 7px 1px 10px $brown-shadow;
    display: flex;
    flex-direction: column;
    color: $main-color;
    font-size: 18px;
    transition: all 1s;
    position: relative;
    &__links {
        position: fixed;
        width: 175px;
    }
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
        align-items: center;        
        border-top: 1px solid $beige;
        padding: 5px 0;
        box-sizing: border-box;
        max-height: 27px;
        position: relative;
        cursor: pointer;
        &:last-child {
            border-bottom: 1px solid $beige;
        }
    }
    &__link {
        margin: 0;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
    }
    &_active-link {
        background-color: $active-background;
    }
    &__counter {
        font-size: 14px;
        padding: 2px;
        margin-left: 5px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: $orange;
        color: $white; 
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .client-details {
        font-size: 16px;
    }
}

</style>
