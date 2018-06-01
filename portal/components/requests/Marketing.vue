<template lang="pug">
    .mark
        .mainWrapper  
            .container
                .mark-option
                    .mark-option__title
                        span.asterisk Project name
                    .mark-option__inner
                        input.proj(type="text" v-model="projectName" maxlength="50" placeholder='50 characters maximum')
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
                                span.select-text.clarify(:class="{ color: selectLang.length }")
                                    template(v-if="selectLang.length > 0" v-for="language in selectLang") {{ language.lang }} 
                                    template(v-if="selectLang.length == 0") Select
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
                                    span.tooltip Please give a brief description of the project in as much detail as possible.
                            .inner-description__textField.textField
                                textarea#grow(rows="1" @keyup="autoGrow()")                       
                        .inner-audience.genBrief__item
                            .inner-audience__title.innerTitle
                                span.innerTitle__title.asterisk Targeted audience
                                    span.tooltip Who will receive this mailer?
                            .inner-audience__textField.textField
                                textarea(rows="1")
                        .inner-subject.genBrief__item
                            .inner-subject__title.switching
                                span.innerTitle__title.innerTitle.asterisk Subject line
                                .subject-toggle.toggle(@click="toggleSub" :class="{positive: subjectToggle}")
                                    .toggler
                                    .yes 
                                        span YES
                                    .no 
                                        span NO
                            .inner-subject__title
                                span.innerTitle__title.innerTitle(v-if="subjectToggle") Subject line requirements
                                    span.tooltip Any specific words/themes to include/not include in the subject line?
                            .inner-subject__textField.textField(v-if="subjectToggle")
                                textarea(rows="1")
                        .inner-topics.genBrief__item
                            .inner-topics__title
                                span.innerTitle__title.innerTitle.asterisk Topics to mention or not to mention
                                    span.tooltip What main topics should or should not be covered in the mailer? Please be as detailed as possible.                        
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
                            .inner-bonus__title.switching
                                span.innerTitle__title.innerTitle.asterisk Bonus/Offers
                                .bonus-toggle.toggle(@click="toggleBon" :class="{positive: bonusToggle}")
                                    .toggler
                                    .yes 
                                        span YES
                                    .no 
                                        span NO                                                       
                            .inner-bonus__title(v-if="bonusToggle")
                                span.innerTitle__title.innerTitle Bonus/Offers details                                
                                    span.tooltip Please list key info about promotion
                            .inner-bonus__textField(v-if="bonusToggle")
                                input(type="text")                         
                        .inner-cta.genBrief__item
                            .inner-cta__title.switching
                                span.innerTitle__title.innerTitle CTA: Yes/No
                                .cta-toggle.toggle(@click="toggleCta" :class="{positive: ctaToggle}")
                                    .toggler
                                    .yes 
                                        span YES
                                    .no 
                                        span NO
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
                .markdetails__quote
                      .send(:class="{markoptionChecked: marksendOption}" @click="markchooseBegin")
                        .send__check
                          .checker(:class="{checkerChecked: marksendOption}")
                        .send__text
                          p.head Send a Quote
                          p.insideText I approve for the project to begin immediately and I'll review the quote later.
                      .start(:class="{markoptionChecked: markstartOption}" @click="markchooseStart")
                        .start__check
                          .checker(:class="{checkerChecked: markstartOption}")
                        .start__text
                          p.head Start Immediately
                          p.insideText I approve for the project to begin immediately and to receive the quote just for reference.
                input.submit(type="submit" value="Submit")
                .mark-footer
                    p.clarify Please note that all copywriting jobs come with one free round of edits. Rewriting requests come at a separate cost.
            .orderInfo(:style="{transform: slide}")
                .orderInfo__title
                    h3 YOUR ORDER
                .orderInfo__summary
                    .orderInfo__summary-service
                        span 1
                        label SERVICE: 
                        p.choice {{ service }}
                    //- .orderInfo__summary-industry
                    //-     span 2
                    //-     label TYPE: 
                    //-     p.choice Marketing
                    .orderInfo__summary-languages
                        span 2
                        label LANGUAGE:
                        p.choice &nbsp; <template v-for="language of selectLang" >{{ language.lang }},  </template> <template v-if="selectLang == 0">Select</template>
                    .orderInfo__summary-industry
                        span 3
                        label PACKAGE: 
                        p.choice {{ packageSelect }}
                    .orderInfo__summary-deadline
                        label SUGGESTED DEADLINE
                        p.choice
</template>

<script>
export default {
  data() {
    return {
      projectName: "",
      packageCheck200: true,
      packageCheck400: false,
      packageSelect: "0-200",
      langDrop: false,
      languages: [],
      langSelect: "Select",
      errors: [],
      selectLang: [],
      topicText: false,
      refFiles: [],
      styleUs: true,
      styleUk: false,
      voices: [
        { title: "Promotional", check: false },
        { title: "Formal", check: false },
        { title: "Informal", check: false },
        { title: "Excited", check: false },
        { title: "Straigtforward", check: false },
        { title: "Serious", check: false },
        { title: "Relaxed", check: false },
        { title: "Persuasive", check: false },
        { title: "Payful/Funny", check: false },
        { title: "Other", check: false, input: true }
      ],
      subjectToggle: false,
      bonusToggle: false,
      ctaToggle: false,
      scrolled: false,
      slide: "0px",
      marksendOption: true,
      markstartOption: false
    };
  },
  methods: {
    toggleSub() {
      this.subjectToggle = !this.subjectToggle;
    },
    toggleBon() {
      this.bonusToggle = !this.bonusToggle;
    },
    toggleCta() {
      this.ctaToggle = !this.ctaToggle;
    },
    voiceChoice(ind) {
      console.log(ind);
      this.voices[ind].check = !this.voices[ind].check;
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
      let grow = document.getElementById("grow");
      let row = grow.getAttribute("rows");
      if (grow.clientHeight < grow.scrollHeight) {
        grow.style.height = grow.scrollHeight * 2 - grow.clientHeight + "px";
      }
    },
    packageChoice200() {
      if (this.packageCheck200) {
        return true;
      } else {
        this.packageCheck200 = true;
        this.packageCheck400 = false;
        this.packageSelect = "0-200";
      }
    },
    packageChoice400() {
      if (this.packageCheck400) {
        return true;
      } else {
        this.packageCheck400 = true;
        this.packageCheck200 = false;
        this.packageSelect = "200-400";
      }
    },
    styleChoiceUs() {
      if (this.styleUs) {
        return true;
      } else {
        this.styleUs = true;
        this.styleUk = false;
      }
    },
    styleChoiceUk() {
      if (this.styleUk) {
        return true;
      } else {
        this.styleUk = true;
        this.styleUs = false;
      }
    },
    showLang() {
      this.langDrop = !this.langDrop;
    },
    async getLanguages() {
      await this.$axios
        .$get("api/languages")
        .then(response => {
          this.languages = response;
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    chooseLang(event) {
      if (event.lang == this.langSelect) {
        this.langSelect = "";
      } else {
        this.langSelect = "";
        const pos = this.selectLang.indexOf(event);
        if (pos === -1) {
          if (!event.dialects.length) {
            event.check = true;
            this.selectLang.push(event);
          } else {
            this.langSelect = event.lang;
          }
        } else {
          event.check = false;
          this.selectLang.splice(pos, 1);
        }
      }
    },
    chooseDialect(event) {
      const pos = this.selectLang.indexOf(event);
      if (pos === -1) {
        event.check = true;
        this.selectLang.push(event);
      } else {
        event.check = false;
        this.selectLang.splice(pos, 1);
      }
    },
    handleScroll() {
      let offSet = window.pageYOffset;
      let downSlide = offSet - 80;
      if (offSet > 100) {
        this.slide = "translateY(" + downSlide + "px" + ")";
      } else {
        this.slide = "translateY(0)";
      }
    },
    markchooseBegin() {
      this.marksendOption = true;
      this.markstartOption = false;
    },
    markchooseStart() {
      this.marksendOption = false;
      this.markstartOption = true;
    }
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    sortedLanguages() {
      let result = [];
      if (this.languages.length) {
        result = this.languages;
        return result.sort((a, b) => {
          if (a.lang > b.lang) return 1;
          if (a.lang < b.lang) return -1;
        });
      } else {
        return result;
      }
    },
    service() {
      return this.$store.state.clientInfo.service;
    }
  },
  mounted() {
    this.getLanguages();
  }
};
</script>


<style lang="scss">
@import "../../assets/styles/clientrequest/marketing.scss";

.markdetails {
    padding-bottom: 0;
    flex-direction: column;
    &__quote {
      margin-top: 30px;
      width: 100%;
      .send, .start {
        display: flex;
        align-items: center;
        border: 1px solid #66563D;        
        padding-left: 10px;
        padding-right: 10px;
        margin: 10px;
        margin-right: 0;
        cursor: pointer;
        &__check {
          width: 18px;
          height: 18px;
          margin-right: 20px;
          border: 1px solid #66563D;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          .checker {
            width: 78%;
            height: 78%;
            border-radius: 50%;
          }
          .checkerChecked {
            background-color: #66563D;
          }
        }
        &__text {
          width: 88%;
          .head {
            margin-bottom: 5px;
          }
          .insideText {
            font-size: 12px;
            margin-top: 0;
          }
        }
      }
      .markoptionChecked {
        box-shadow: 0 0 7px rgba(0, 0, 0, .6);
      }

    }
  }
</style>
