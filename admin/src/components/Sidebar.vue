<template lang="pug">
.sidebar
    .sidebar__links(v-if="!isMultiLinks")
        span.sidebar__title(v-if="title") {{ title }}
        .sidebar__inner
        .sidebar__item(v-for="(link, index) in links" @click="onLinkClick(index)" :class="{linkClass, 'sidebar_active-link': activeIndex === index}")
            .sidebar__link {{ link.title }}
            .sidebar__counter(v-if="link.counter" :class="counterClass") 
                span.sidebar__ {{ link.counter }}

    .sidebar__links(v-if="isMultiLinks" v-for="item in multiLinks")
        span.sidebar__title {{ item.title }}
        .sidebar__inner
        .sidebar__item(v-for="(link, index) in item.links" @click="onLinkClickMulti(link.arrayIndex, index)" :class="{linkClass, 'sidebar_active-link': multiActiveIndex[0] === link.arrayIndex && multiActiveIndex[1] === index}")
            .sidebar__link() {{ link.title }}
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
        },
        isMultiLinks:{
            type: Boolean,
            default: false
        },
        multiLinks:{
            type: Array,
        },
        multiActiveIndex:{
            type: [Array, Number]
        }
    },
    methods: {
        onLinkClick(index) {
            this.$emit("onLinkClick", {index})
        },
        onLinkClickMulti(arrayIndex, index) {
            this.$emit("onLinkClickMulti", {arrayIndex, index})
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.sidebar {
    background-color: #fff;
    width: 170px;
    min-width: 170px;
    display: flex;
    flex-direction: column;
    color: $main-color;
    font-size: 18px;
    transition: all 1s;
    position: relative;
    &__links {
        width: 170px;
    }
    &__title {
        display: flex;
        justify-content: center;
        padding: 40px 5px;
        font-family: Myriad900;
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
        padding: 5.2px 5px;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
        letter-spacing: -0.2px;

        &:last-child {
            border-bottom: 1px solid $beige;
        }
        &:hover{
          background: #f2efeb;
        }
    }
    &__link {
        margin: 0;
        text-align: center;
        font-size: 14px;
        font-family: Myriad600;
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
