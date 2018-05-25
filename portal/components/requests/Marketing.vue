<template lang="pug">
    .mark
        .mainWrapper  
            .container
                .mark-option
                    .mark-option__title
                        span 1. Package
                    .mark-option__inner
                        .inner-option
                            .inner-option__check(@click="packageChoice200")
                                .checker(v-if="packageCheck200")
                            .inner-option__amount
                                p 0-200
                            .inner-option__image
                                img(src="../../assets/images/0-200.png")
                        .inner-option
                            .inner-option__check(@click="packageChoice400")
                                .checker(v-if="packageCheck400")
                            .inner-option__amount
                                p 0-400
                            .inner-option__image
                                img(src="../../assets/images/200-400.png")                            
                .mark-option
                    .mark-option__title
                        span 2. Select Language
                    .mark-option__inner
                        .inner-langs
                            span Language(s)
                            .inner-langs__select
                                span.select-text.clarify(:class="{ color: langSelect.lang != 'Select' }")
                                    <template v-if="selectLang.length > 0" v-for="language in selectLang"> {{ language.lang }} </template> 
                                    <template v-if="selectLang.length == 0">Select</template>
                                    .span-wrapper(v-on:click.self='showLang')
                                    .icon(:class="{ reverse: langDrop }")
                                        i.fas.fa-caret-down
                                .select__drop(v-if='langDrop')
                                    .select__drop-list(v-for='language in sortedLanguages')
                                        .pair(@click='chooseLang(language)')
                                            img(:src="'/flags/' + language.symbol + '.png'")
                                            span.list-item(:class="{ active: language.check }") {{ language.lang }}
                                        .select__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == langSelect }")
                                            template(v-for='dialect in language.dialects')
                                                .pair.pair_dialect(@click="chooseDialect(dialect)")
                                                    img(:src="'/flags/' + dialect.symbol + '.png'")                  
                                                    span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}

</template>

<script>
export default {
    data() {
        return {
            packageCheck200: true,
            packageCheck400: false,
            langDrop: false,
            languages: [],
            langSelect: 'Select',
            errors: [],
            selectLang: []
        }
    },
    methods: {
        packageChoice200() {
            if (this.packageCheck200) {
                return true
            } else {
                this.packageCheck200 = true;
                this.packageCheck400 = false
            }
        },
        packageChoice400() {
            if (this.packageCheck400) {
                return true
            } else {
                this.packageCheck400 = true;
                this.packageCheck200 = false
            }
        },
        showLang() {
            this.langDrop = !this.langDrop;
        },
        async getLanguages() {
            await this.$axios.$get('api/languages')
            .then(response => {
                this.languages = response;
            })
            .catch(e => {
                this.errors.push(e)
            })
        },
        chooseLang(event) {
            if(event.lang == this.langSelect) {
                this.langSelect = ''        
            } else {
                this.langSelect = '';
                const pos = this.selectLang.indexOf(event);
                if(pos === -1) {
                    if(!event.dialects.length) {
                        event.check = true;
                        this.selectLang.push(event);
                    } else {
                        this.langSelect = event.lang;            
                    }
                }
                else{
                    event.check = false;
                    this.selectLang.splice(pos,1);
                }   
            }
        },
        chooseDialect(event) {
            const pos = this.selectLang.indexOf(event);
            if(pos === -1){
                event.check = true;
                this.selectLang.push(event);
            }
            else{
                event.check = false;
                this.selectLang.splice(pos,1);
            }
        },
    },
    computed: {
        sortedLanguages() {
            let result = [];
            if (this.languages.length) {
                result = this.languages;
                return result.sort((a, b) => {
                        if (a.lang > b.lang) return 1;
                        if (a.lang < b.lang) return -1;
                    })
            } else {
                return result    
            }
        }
    },
    mounted() {
        this.getLanguages();
    }
}
</script>


<style lang="scss">
    .mark-option {
        width: 80%;
        margin-bottom: 20px;
        &__title {
            font-size: 22px;
        }
        &__inner {
            display: flex;
            justify-content: center;
            align-items: center;
            .inner-option {
                font-size: 14px;
                margin-top: 10px;
                width: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                &__check {
                    width: 16px;
                    height: 16px;
                    border: 1px solid #BFB09D;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    .checker {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background-color: #66563D;
                    }
                }
            }
            .inner-langs {
                &__select {
                    max-height: 490px;
                    width: 490px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 10px rgba(0,0,0,0.6);
                    border-radius: 10px;
                    padding: 10px;
                    .select-text {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        .span-wrapper {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                        }
                    }
                    .select__drop {
                        padding-top: 30px;
                        display: flex;
                        flex-direction: column;
                        flex-wrap: wrap;
                        &-list {
                            .dialect {
                                padding-left: 18px;
                                position: absolute;
                                opacity: 0;
                                transform: translateY(-50px);
                                transition: all .3s;
                                z-index: -5;
                                &_active{
                                    position: static;
                                    opacity: 1;
                                    transform: translateY(0px);
                                }
                            }
                            .pair {
                                padding: 2px;
                                display: flex;
                                align-items: center;
                                cursor: pointer;
                                transition: all 0.3s;
                                position: relative;
                                &_dialect {  
                                    &:before, &:after {
                                        content: "";
                                        display: block;
                                        position: absolute;
                                        background-color: #66563D;
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
                                img {
                                    width: 23px;
                                    margin-right: 3px;
                                }
                                span {
                                    font-size: 12px;
                                }
                                .openIcon {
                                    width: 8px;
                                    padding-left: 5px;
                                }
                                .reverseOpenIcon {
                                    transform: rotate(180deg);
                                    padding-left: 0;
                                    padding-right: 5px;
                                }
                                &:hover {
                                    box-shadow: 0px 0 15px rgba(102, 86, 61, 0.3);
                                    border-radius: 5px;
                                    span {
                                        transition: all 0.4s;
                                        transform: translateX(3px);
                                    }     
                                }
                            }
                        }
                    }
                }
            }
        }
    }
.active {
    color: #FF876C;
}
</style>
