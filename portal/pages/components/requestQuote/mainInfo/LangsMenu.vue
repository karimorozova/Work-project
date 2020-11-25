<template lang="pug">
    .langs-menu
        .langs-menu__title(@click="toggle" :class="{'langs-menu_opacity-07': isOpacity}") {{ languagesNames }}
            img.service-menu__arrow(src="../../../../assets/images/arrow_open.png" :class="{'langs-menu_rotate': isOpen}")
        .langs-menu__drop(v-if="isOpen")
            .langs-menu__item(v-for="language in languages" @click="setLanguages(language)") 
                .langs-menu__language
                    img.langs-menu__flag(:src="domain + language.icon")
                    span.langs-menu__name(:class="{'langs-menu_active': chosenLangs.indexOf(language.lang) !== -1}") {{ language.lang }}
                        img.langs-menu__dialects-open(src="../../../../assets/images/open-icon.png" v-if="language.dialects" :class="{'langs-menu_rotate': dialectLang === language.lang}")
                .langs-menu__dialects(v-if="language.dialects" :class="{'langs-menu_translate-0': dialectLang === language.lang}")
                    .langs-menu__item(v-for="dialect in language.dialects" @click="setLanguages(dialect)")
                        .langs-menu__language.langs-menu__lines
                            img.langs-menu__flag(:src="domain + dialect.icon")
                            span.langs-menu__name(:class="{'langs-menu_active': chosenLangs.indexOf(dialect.lang) !== -1}") {{ dialect.lang }}
</template>

<script>
import setDomain from "@/mixins/setDomain";

export default {
    mixins: [setDomain],
    props: {
        selectedLanguages: {type: Array},
        languages: {type: Array}
    },
    data() {
        return {
            isOpen: false,
            dialectLang: ""
        }
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        },
        setLanguages(language) {
            if(language.dialects) {
                return this.toggleDialects(language);
            }
            this.$emit('setLanguages', { language });
            this.dialectLang = "";
        },
        toggleDialects(language) {
            if(this.dialectLang && this.dialectLang === language.lang) {
                return this.dialectLang = "";
            }
            this.dialectLang = language.lang;
        }
    },
    computed: {
        isOpacity() {
            return !this.selectedLanguages.length || this.selectedLanguages[0].lang === 'Select';
        },
        languagesNames() {
            let result = "Select";
            if(!this.isOpacity) {
                result = this.selectedLanguages.reduce((prev, cur) => {
                    return `${prev}${cur.lang}; `
                }, "")
            }
            return result;
        },
        chosenLangs() {
            return this.selectedLanguages.map(item => item.lang);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.langs-menu {
    width: 100%;
    box-shadow: 0 2px 10px $deep-brown;
    border-radius: 12px;
    overflow: hidden;
    &:hover {
        box-shadow: 0 1px 10px $deep-brown;
    }
    &__title {
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        cursor: pointer;
    }
    &_opacity-07 {
        opacity: 0.7;
    }
    &_rotate {
        transform: rotate(180deg);
    }
    &__drop {
        padding: 15px 10px 5px;
        box-sizing: border-box;
        border-top: 1px solid $light-brown;
        display: flex;
        flex-direction: column;
        max-height: 465px;
        flex-wrap: wrap;
        @media (max-width: 680px) {
            flex-wrap: nowrap;
            max-height: 250px;
            overflow-y: scroll; 
        }
    }
    &__item {
        border-radius: 3px;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.2s;
    }
    &__language {
        padding: 2px;
        display: flex;
        align-items: center;
        font-size: 12px;
        &:hover {
            box-shadow: 0 0 5px $light-brown;
            .langs-menu__name {
                opacity: 0.8;
            }
        }
    }
    &__flag {
        width: 23px;
        margin-right: 3px;
    }
    &__name {
        padding-top: 2px;
        transition: all 0.2s;
    }
    &__dialects {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: absolute;
        transform: translateY(-40px);
        padding-left: 20px;
        opacity: 0;
        z-index: -5;
        transition: all 0.2s;
    }
    &_translate-0 {
        transform: translateY(0);
        opacity: 1;
        z-index: 1;
        position: static;
    }
    &__dialects-open {
        margin-left: 3px;
    }
    &__lines {
        position: relative;
        &:after, &:before {
            content: "";
            display: block;
            position: absolute;
            background-color: $deep-brown;
            left: -8px;
        }
        &:before {
            width: 10px;
            height: 1px;
            top: 10px;
        }
        &:after {
            width: 1px;
            height: 11px;
            top: 0;
        }
    }
    &_active {
        color: $orange;
    }
}

</style>
