<template lang="pug">
    .mark
        .mainWrapper  
            .container
                .mark-option
                    .mark-option__title
                        span.asterisk 1. Package
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
                            span.inner-langs__title Language(s)
                            .inner-langs__select
                                span.select-text.clarify(:class="{ color: langSelect != 'Select' && langSelect != '' }")
                                    <template v-if="selectLang.length > 0" v-for="language in selectLang"> {{ language.lang }} </template> 
                                    <template v-if="selectLang.length == 0">Select</template>
                                    .span-wrapper(@click.self='showLang')
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
                .mark-option
                    .mark-option__title
                        span 3. General Brief
                    .mark-option__inner.genBrief
                        .inner-description.genBrief__item
                            .inner-description__title.innerTitle
                                span.innerTitle__title.asterisk Description
                            .inner-description__textField.textField
                                textarea#grow(rows="1" @keyup="autoGrow()")                       
                        .inner-audience.genBrief__item
                            .inner-audience__title.innerTitle
                                span.innerTitle__title.asterisk Targeted audience
                            .inner-audience__textField.textField
                                textarea(rows="1")
                        .inner-subject.genBrief__item
                            .inner-subject__title
                                span.innerTitle__title.innerTitle.asterisk Subject line
                                .subject-toggle.toggle
                            .inner-subject__title
                                span.innerTitle__title.innerTitle Subject line requirements                               
                            .inner-subject__textField.textField
                                textarea(rows="1")
                        .inner-topics.genBrief__item
                            .inner-topics__title
                                span.innerTitle__title.innerTitle.asterisk Topics to mention or not to mention                                
                            .inner-topics__textField
                                input(type="text")
                                span or
                                button(@click="showTopic" :class="{notSure: topicText}") I am not sure
                            .inner-topics__hiddenText(v-if="topicText")
                                p.asterisk If you are unsure of what points the mailer should cover, you agree to the following:
                                ul
                                    li You give the copywriter freedom to write the mailer as they please.
                                    li You will only receive 
                                        span.strong one round of edits 
                                        | if you think the mailere needs improvement.
                                p 
                                    span.strong Rewriting  
                                    | requests come at a separate cost.
                        .inner-bonus.genBrief__item
                            .inner-bonus__title
                                span.innerTitle__title.innerTitle.asterisk Bonus/Offers
                                .bonus-toggle.toggle                                                                
                            .inner-bonus__title
                                span.innerTitle__title.innerTitle Bonus/Offers details                                
                            .inner-bonus__textField   
                                input(type="text")                         
                        .inner-cta.genBrief__item
                            .inner-cta__title
                                span.innerTitle__title.innerTitle CTA: Yes/No
                                .cta-toggle.toggle
                        .inner-examples.genBrief__item
                            .inner-examples__title
                                span.innerTitle__title.innerTitle Examples
                            .inner-examples__textField
                                .inner-examples__web
                                    input(type="text" placeholder="www.example.com")
                                    span.clarify.under URL
                                .inner-examples__button
                                    .uploadBtn
                                        .uploadBtn__txt Upload
                                        input(name="refFiles" type="file" @change='changeRefFiles')
                                    span.clarify.under Upload Reference File
                                    .loadedList
                                        li.loadedList__item(v-if="refFiles.name" @click="refRemove(file)") {{ refFiles.name }}
                                            i.fa.fa-times.deleteIcon
                .mark-option
                    .mark-option__title
                        span.asterisk 4. Style
                    .mark-option__inner.styleInner
                        .inner-option.style
                            .inner-option__check(@click="styleChoiceUs")
                                .checker(v-if="styleUs")
                            .inner-option__image
                                img(src="../../assets/images/US-icon.png")
                        .inner-option.style
                            .inner-option__check(@click="styleChoiceUk")
                                .checker(v-if="styleUk")
                            .inner-option__image
                                img(src="../../assets/images/UK-icon.png")
                .mark-option
                    .mark-option__title
                        span.asterisk 5. Tone of voice
                    .mark-option__inner.voiceChekers
                        .inner-option(v-for="(voice, i) in voices")
                            .inner-option__check(@click="voiceChoice(i)")
                                .checker(v-if="voice.check")
                            span.voiceTitle {{ voice.title }}
                            input(v-if="voice.input" type="text")
                input.submit(type="submit" value="Submit")
                .mark-footer
                    p.clarify Please note that all copywriting jobs come with one free round of edits. Rewriting requests come at a separate cost.
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
            selectLang: [],
            topicText: false,
            refFiles: [],
            styleUs: true,
            styleUk: false,
            voices: [
                { title: "Promotional", check: false},
                { title: "Formal", check: false},
                { title: "Informal", check: false},
                { title: "Excited", check: false},
                { title: "Straigtforward", check: false},
                { title: "Serious", check: false},
                { title: "Relaxed", check: false},
                { title: "Persuasive", check: false},
                { title: "Payful/Funny", check: false},
                { title: "Other", check: false, input: true}
            ]
        }
    },
    methods: {
        voiceChoice(ind) {
            console.log(ind);
            this.voices[ind].check = !this.voices[ind].check
        },
        refRemove(event) {   
            this.refFiles = [];
        },
        changeRefFiles(event) {
            this.refFiles = event.target.files[0];
            console.log(this.refFiles);
        },
        showTopic() {
            this.topicText = !this.topicText;
        },
        autoGrow() {
            let grow = document.getElementById('grow');
            let row = grow.getAttribute("rows");
            if (grow.clientHeight < grow.scrollHeight)
            {
                grow.style.height = grow.scrollHeight + "px";
                // grow.style.height = 
                //     (grow.scrollHeight * 2 - grow.clientHeight) + "px";
                }
                else {
                    grow.style.height = grow.clientHeight + "px"
                }
                
            
            console.log(grow.style.height)
        },
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
        styleChoiceUs() {
            if (this.styleUs) {
                return true
            } else {
                this.styleUs = true;
                this.styleUk = false
            }
        },
        styleChoiceUk() {
            if (this.styleUk) {
                return true
            } else {
                this.styleUk = true;
                this.styleUs = false
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
    @import "../../assets/styles/clientrequest/marketing.scss";
</style>
