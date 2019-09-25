<template lang="pug">
    .copywriting-type
        TitleInput(title="TYPE:" :isAsterisk="true")
            .types
                .types__item(v-for="(type, index) in types" :class="{'types_active': type.isChecked}" @click="setType(index)")
                    span.types__name {{ type.name }}
                    img.types__icon(:src="type.icon")
</template>

<script>
import TitleInput from "../TitleInput";

export default {
    data() {
        return {
            types: [
                {name: "Article", icon: require("../../../../assets/images/article-icon-selected.png"), isChecked: true},
                {name: "Blog Post", icon: require("../../../../assets/images/blog-icon-selected.png"), isChecked: false},
                {name: "Review", icon: require("../../../../assets/images/reviews-icon-selected.png"), isChecked: false},
            ]
        }
    },
    methods: {
        setType(index) {
            this.types = this.types.map((item, ind) => {
                item.isChecked = ind === index;
                return item;
            })
        }
    },
    components: {
        TitleInput
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.types {
    width: calc(100%-12px);
    padding-left: 12px;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    &__item {
        width: 26%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        border: 1px solid $main-color;
        border-radius: 15px;
        padding: 5px;
        box-sizing: border-box;
        cursor: pointer;
    }
    &_active {
        background-color: $main-color;
        color: $white;
    }
}

</style>
