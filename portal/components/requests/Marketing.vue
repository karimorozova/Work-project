<template lang="pug">
    .mark
        .mainWrapper  
            .container
              form.marketingForm(@submit.prevent="checkForm")
                .mark-option
                    .mark-option__title
                        span.asterisk Project name
                    .mark-option__inner
                        input.proj(type="text" v-model="projectName" maxlength="50" placeholder='50 characters maximum')                            
                .mark-option
                    .mark-option__title
                        span 1. Select Language
                    .mark-option__inner
                        .inner-langs
                            span.inner-langs__title Language(s)
                            .inner-langs__select
                                span.select-text.clarify(:class="{ color: selectLang.length }")
                                    template(v-if="selectLang.length > 0" v-for="language in selectLang") {{ language.lang }}; 
                                    template(v-if="selectLang.length == 0") Select
                                    .span-wrapper(@click.self='showLang')
                                    .icon(:class="{ reverse: langDrop }")
                                        i.fas.fa-caret-down
                                .select__drop(v-if='langDrop' v-click-outside="outsideLangs")
                                    .select__drop-list(v-for='language in sortedLanguages')
                                        .pair(v-if="copyLangs.indexOf(language.symbol) != -1" @click='chooseLang(language)')
                                            img(:src="'/flags/' + language.symbol + '.png'")
                                            span.list-item(:class="{ active: language.check }") {{ language.lang }}
                                        .select__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == langSelect }")
                                            template(v-for='dialect in language.dialects')
                                                .pair.pair_dialect(v-if="copyLangs.indexOf(dialect.symbol) != -1" @click="chooseDialect(dialect)")
                                                    img(:src="'/flags/' + dialect.symbol + '.png'")                  
                                                    span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}
                .mark-option
                    .mark-option__title
                        span.asterisk 2. Package
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
                        span 3. General Brief
                    .mark-option__inner.genBrief
                        .inner-description.genBrief__item
                            .inner-description__title.innerTitle
                                span.innerTitle__title.asterisk Description
                                    span.tooltip Please give a brief description of the project in as much detail as possible.
                            .inner-description__textField.textField
                                textarea#grow(rows="1" @keyup="autoGrow()" v-model="genBrief.briefDescr") {{ genBrief.briefDescr }}                    
                        .inner-audience.genBrief__item
                            .inner-audience__title.innerTitle
                                span.innerTitle__title.asterisk Targeted audience
                                    span.tooltip Who will receive this mailer?
                            .inner-audience__textField.textField
                                textarea(rows="1" v-model="genBrief.briefAudience") {{ genBrief.briefAudience }}
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
                                span.innerTitle__title.innerTitle(v-if="subjectToggle") Any specific words/themes to include/not include in the subject line?
                                    //- span.tooltip Any specific words/themes to include/not include in the subject line?
                            .inner-subject__textField.textField(v-if="subjectToggle")
                                textarea(rows="1" v-model="genBrief.briefTitle") {{ genBrief.briefTitle }}
                        .inner-topics.genBrief__item
                            .inner-topics__title
                                span.innerTitle__title.innerTitle.asterisk Topics to mention or not to mention
                                    span.tooltip What main topics should or should not be covered in the mailer? Please be as detailed as possible.                        
                            .inner-topics__textField
                                input(type="text")
                                span or
                                button(@click.prevent="showTopic" :class="{notSure: topicText}") I am not sure
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
                                input(type="text" v-model="genBrief.briefBonus" value="genBrief.briefBonus")                         
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
                                    input(type="text" placeholder="www.example.com" v-model="genBrief.briefExample" value="genBrief.briefExample")
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
                            input(v-if="voice.input" type="text" v-model="voice.inputText")
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
                        p.choice Marketing
                    //- .orderInfo__summary-industry
                    //-     span 2
                    //-     label TYPE: 
                    //-     p.choice Marketing
                    .orderInfo__summary-languages
                        span 2
                        label LANGUAGE:
                        p.choice &nbsp; 
                          template(v-for="language of selectLang") {{ language.lang }}; 
                          template(v-if="selectLang == 0") Select
                    .orderInfo__summary-industry
                        span 3
                        label PACKAGE: 
                        p.choice {{ genBrief.package }}
                    .orderInfo__summary-deadline
                        label SUGGESTED DEADLINE
                        p.choice
</template>

<script>
import ClickOutside from 'vue-click-outside';

export default {
  data() {
    return {
      projectName: "",
      packageCheck200: true,
      packageCheck400: false,
      langDrop: false,
      languages: [],
      copyLangs: [],
      langSelect: "Select",
      errors: [],
      service: "Copywriting",
      services: [],
      selectLang: [],
      topicText: false,
      detailFiles: [],
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
        { title: "Other", check: false, input: true, inputText: "" }
      ],
      genBrief: {
        briefDescr: "",
        briefAudience: "",
        briefTitle: "",
        briefTopics: "",
        briefSure: "",
        briefBonus: "",
        briefExample: "",
        briefRef: [],
        package: "0-200",
        structure: [],
        style: "US",
        tone: [],
        design: "",
        seo: [],
        cta: 'No'
      },
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
    outsideLangs() {
      this.langDrop = false;
    },
    toggleSub() {
      this.subjectToggle = !this.subjectToggle;
    },
    toggleBon() {
      this.bonusToggle = !this.bonusToggle;
    },
    toggleCta() {
      this.ctaToggle = !this.ctaToggle;
      if(this.ctaToggle) {
        this.genBrief.cta = "Yes";
      } else {
        this.genBrief.cta = "No";        
      }
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
      if(this.topicText) {
        this.genBrief.briefSure = "I am not sure";
      } else {
        this.genBrief.briefSure = "";
      }
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
        this.genBrief.package = "0-200";
      }
    },
    packageChoice400() {
      if (this.packageCheck400) {
        return true;
      } else {
        this.packageCheck400 = true;
        this.packageCheck200 = false;
        this.genBrief.package = "200-400";
      }
    },
    styleChoiceUs() {
      this.genBrief.style = 'US';
      if (this.styleUs) {        
        return true;
      } else {
        this.styleUs = true;
        this.styleUk = false;
        
      }
    },
    styleChoiceUk() {
      this.genBrief.style = 'UK';
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
    async getServiceLangs() {
      const result = await this.$axios.$get('api/services')
      result.sort((a, b) => {return a.sortIndex - b.sortIndex});
      for (let i = 0; i < result.length; i++) {
        if(result[i].title == 'Copywriting') {
          this.copyLangs = result[i].languages[0].target;
        }
      }
    },
    chooseLang(event) {
      if (event.lang == this.langSelect) {
        this.langSelect = "";
      } else {
        this.langSelect = "";
        const pos = this.selectLang.indexOf(event);
        if (pos === -1) {
          if (!event.dialects.length || event.lang == 'German') {
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
    },
    clearForm() {
      this.projectName = "";
      this.refFiles = [];
      this.detailFiles = [];
      this.request = [];
      this.deadlineDate = '';
      this.deadlineSelect = '';
      this.sourceSelect = {name : 'English (United Kingdom)', id: '73', xtrf: '73', symbol: 'EN-GB', lang: 'English (United Kingdom)'};
      this.selectLang = [];
      this.targetDrop = false;
      this.targetSelect = [];
      this.brief = '';
      this.languages.map(item => {
        if(!item.dialects) {
          item.check = false
        } else {
          item.dialects.map(ditem => {
            ditem.check = false
          })
        }
      });
      this.voices.forEach(item => {
        item.check = false;
        if(item.input) item.input = "";
      });
      this.voices[0].check = true; 
      this.genBrief = {
        briefDescr: "",
        briefAudience: "",
        briefTitle: "",
        briefTopics: "",
        briefSure: "",
        briefExample: "",
        briefRef: [],
        package: "200-399",
        structure: [],
        style: "US",
        tone: [],
        design: [],
        seo: [],
        cta: "No"
      };
      this.sure = false;
      this.topicText = false;
      this.subjectToggle = false;
      this.bonusToggle = false;
      this.ctaToggle = false;
    },
    async sendForm() {
        var serviceFull;
        for(let i = 0; i < this.services.length; i++) {
          if(this.request.service == this.services[i].title)
            serviceFull = this.services[i];
            console.log(serviceFull);
        }
        var typeOfRequest = "quote";
        if (this.copystartOption) {
          typeOfRequest = "project";
        }

        this.genBrief.tone = this.toneSelect;

        var sendForm = new FormData();

        sendForm.append("typeOfRequest", typeOfRequest);        
        sendForm.append("projectName", this.request.projectName);
        sendForm.append("date", this.request.date);
        sendForm.append("contactName", this.request.contactName);
        sendForm.append("contactEmail", this.request.contactEmail);
        sendForm.append("service", JSON.stringify(serviceFull));
        sendForm.append("industry", this.request.industry); 
        sendForm.append("status", "New");
        sendForm.append("sourceLanguage", JSON.stringify(this.request.sourceLanguage));
        sendForm.append("targetLanguages", JSON.stringify(this.request.targetLanguages)); 
        sendForm.append("web", this.request.web);
        sendForm.append("skype", this.request.skype);
        sendForm.append("phone", this.request.phone);
        sendForm.append("companyName", this.request.companyName);
        sendForm.append("accountManager", "None selected");
        sendForm.append("brief", this.request.brief);
        sendForm.append("createdAt", this.request.createdAt);
        sendForm.append("jsession", this.$store.state.session);
        sendForm.append('genBrief', JSON.stringify(this.genBrief));
        for(var i = 0; i < this.detailFiles.length; i++){
          console.log(this.detailFiles[i]);
          sendForm.append("detailFiles", this.detailFiles[i]);
        }
        sendForm.append("refFiles", this.refFiles, this.refFiles.name);
        /*`for(var i = 0; i < this.refFiles.length; i++){
          console.log(this.refFiles[i]);
          sendForm.append("refFiles", this.refFiles[i]);
        }*/
        if(this.marksendOption) {
          const result = await this.$axios.$post('api/request', sendForm);          
        }
        if(this.markstartOption) {
          const result = await this.$axios.$post('api/project-request', sendForm);
        }
        this.clearForm();
    },
    async checkForm(event) {
        this.request = {
          projectName: this.projectName,
          date: "", 
          contactName: this.$store.state.clientInfo.name, 
          contactEmail: this.$store.state.clientInfo.email,
          service: this.service, 
          industry: this.$store.state.clientInfo.industry, 
          status: 'New',
          sourceLanguage: {name : 'English (United Kingdom)', id: '73', xtrf: '73', symbol: 'EN-GB', lang: 'English (United Kingdom)'}, 
          targetLanguages: this.selectLang, 
          web: this.$store.state.clientInfo.web,
          skype: this.$store.state.clientInfo.skype, 
          phone: this.$store.state.clientInfo.phone, 
          companyName: this.$store.state.clientInfo.companyName,
          accountManager: "None selected",
          brief: "",
          files: this.files,
          createdAt: Date.now    
      }

      this.errors = [];
      if(!this.projectName) this.errors.push("Project name required!");
      if(!this.request.targetLanguages.length) this.errors.push("Target language(s) required!");
      if(!this.toneSelect.length) errors.push("Please, chooose Tone of voice");
      if(!this.genBrief.briefDescr) errors.push("Please, enter description of Brief");
      if(!this.genBrief.briefAudience) errors.push("Please, enter targeted audience");
      if(!this.errors.length){
        this.sendForm();         
        console.log("sent")
        // window.top.location.href = "https://www.pangea.global/thank-you"; 
      } else {
        this.showError();
        event.preventDefault();
      }
    },
    showError() {
      console.log('Errors occured');
    },
    getServices() {
      this.services = this.$store.state.services;     
    },
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    toneSelect() {
      let result = [];
      this.voices.forEach((item) => {
        if(item.check) {
          if (item.title == "Other") {
            result.push(item.inputText)
          } else {
            result.push(item.title);
          }
        }
      })
      return result;
    },
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
    }
  },
  directives: {
    ClickOutside
  },
  mounted() {
    this.getLanguages();
    this.getServiceLangs();
    this.getServices();
  }
};
</script>


<style lang="scss">
@import "../../assets/styles/clientrequest/marketing.scss";

.markdetails {
    padding-bottom: 0;
    flex-direction: column;
    &__quote {
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

  .marketingForm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
