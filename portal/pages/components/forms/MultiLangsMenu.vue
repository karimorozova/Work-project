<template lang="pug">
    .multi-langs(v-click-outside="closeMenu")
        .multi-langs__label
        .multi-langs__menu
            .multi-langs__select(@click="toggleMenu") 
                .multi-langs__selected.multi-langs_opacity-07(v-if="!selectedLangs.length") Select
                .multi-langs__selected(v-else)
                    span(v-for="lang in selectedLangs") {{ lang.lang }}; 
                img.multi-langs__arrow(src="../../../assets/images/arrow_open.png" :class="{'multi-langs_rotate-180': isOpen}")
            .multi-langs__drop(v-if="isOpen")
                .multi-langs__item(v-for="language in languages" @click="selectLanguage(language)") 
                    img.multi-langs__flag(v-if="language" :src="domain+language.icon")
                    span.multi-langs__language(:class="{'multi-langs_orange': chosenLangsSymbols.indexOf(language.symbol) !== -1}") {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLangs: {
            type: Array,
            default: () => []
        },
        languages: {
            type: Array
        }
    },
    data() {
        return {
            domain: "",
            isOpen: false
        }
    },
    methods: {
        toggleMenu() {
            this.isOpen = !this.isOpen;
        },
        closeMenu() {
            this.isOpen = false;
        },
        selectLanguage(language) {
            this.$emit("selectLanguage", { language });
        }
    },
    computed: {
        chosenLangsSymbols() {
            return this.selectedLangs.length ? this.selectedLangs.map(item => item.symbol) : []
        }
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.domain = process.env.domain
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.multi-langs {
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 2px 15px $brown-shadow;
    border-radius: 4px;
    position: absolute;
    background-color: $white;
    z-index: 5;
    &__select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        max-height: 36px;
        cursor: pointer;
        box-sizing: border-box;
    }
    &__selected {
        font-size: 14px;
        width: 85%;
        max-height: 32px;
        overflow-y: auto;
        box-sizing: border-box;
    }
    &__arrow {
        transition: all 0.2s;
    }
    &__drop {
        box-sizing: border-box;
        padding: 2px 10px;
        border-top: 1px solid $light-brown;
    }
    &__item {
        padding: 3px 0;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
            border-radius: 4px;
            box-shadow: 0 0 5px $brown-shadow;
            .multi-langs__language {
                padding-left: 3px;
            }
        }
    }
    &__flag {
        width: 28px;
    }
    &__language {
        font-size: 14px;
        transition: all 0.2s;
        margin-left: 5px;
    }
    &_opacity-07 {
        opacity: 0.7;
    }
    &_rotate-180 {
        transform: rotate(180deg)
    }
    &_orange {
        color: $orange;
    }
}

</style>
