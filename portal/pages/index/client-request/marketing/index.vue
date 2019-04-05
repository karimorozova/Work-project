<template lang="pug">
  .mark
    .mainWrapper
      .container
        form.marketingForm(@submit.prevent="checkForm")
          .mark-option
            .nwrap
              .lblockm
                .mark-option__title1
                  span.asterisk PROJECT NAME:
                .mark-option__inner
                  input.proj(type="text" v-model="projectName" maxlength="50" placeholder='50 characters maximum')
              .rblockm
                .mark-option__title1
                  span.asterisk SUGGESTED DEADLINE:
                .deadline
                  .picker
                    datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                  .datepick(@click='openPicker')
                    img(src='../../../../assets/images/calendar.png')
          .mark-option
            .mark-option__title2
              span.asterisk SELECT A LANGUAGE
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
          .mark-option
            .mark-option__title2
              span.asterisk PACKAGE
            .mark-option__inner
              .inner-option
                .inner-option__check(@click="packageChoice200")
                  .checker(v-if="packageCheck200")
                .inner-option__amount
                  p 0-200
                .inner-option__image
                  img(src="../../../../assets/images/0-200.png")
              .inner-option
                .inner-option__check(@click="packageChoice400")
                  .checker(v-if="packageCheck400")
                .inner-option__amount
                  p 0-400
                .inner-option__image
                  img(src="../../../../assets/images/200-400.png")
          .mark-option
            .mark-option__title2
              span GENERAL BRIEF
            .mark-option__inner.genBrief
              .inner-description.genBrief__item
                .inner-description__title.innerTitle
                  span.innerTitle__title.asterisk Description
                    span.tooltip(v-if="descrTip") Please give a brief description of the project in as much detail as possible.
                  img(src="../../../../assets/images/info-icon.png" @click="descrTipShow")
                .inner-description__textField.textField
                  textarea#grow(rows="1" @keyup="autoGrow()" v-model="genBrief.briefDescr") {{ genBrief.briefDescr }}
              .inner-audience.genBrief__item
                .inner-audience__title.innerTitle
                  span.innerTitle__title.asterisk Targeted audience
                    span.tooltip(v-if="audienceTip") Who will receive this mailer?
                  img(src="../../../../assets/images/info-icon.png" @click="audienceTipShow")
                .inner-audience__textField.textField
                  textarea(rows="1" v-model="genBrief.briefAudience") {{ genBrief.briefAudience }}
              .inner-subject.genBrief__item
                .inner-subject__title.switching
                  span.innerTitle__title.innerTitle Subject line
                  .subject-toggle.toggle(@click="toggleSub" :class="{positive: subjectToggle}")
                    .toggler
                    .yes
                      span YES
                    .no
                      span NO
                .inner-subject__title
                  span.innerTitle__title.innerTitle(v-if="subjectToggle") Any specific words/themes to include/not include in the subject line?
                .inner-subject__textField.textField(v-if="subjectToggle")
                  textarea(rows="1" v-model="genBrief.briefTitle") {{ genBrief.briefTitle }}
              .inner-topics.genBrief__item
                .inner-topics__title.innerTitle(:class="{disable: topicText}")
                  span.innerTitle__title.asterisk Topics to mention or not to mention
                    span.tooltip(v-if="topicsTip") What main topics should or should not be covered in the mailer? Please be as detailed as possible
                  img(src="../../../../assets/images/info-icon.png" @click="topicsTipShow")
                .inner-topics__textField
                  input(type="text" :readonly="topicText" :class="{disable: topicText}" v-model="genBrief.briefTopics")
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
                  span.innerTitle__title.innerTitle Bonus/Offers
                  .bonus-toggle.toggle(@click="toggleBon" :class="{positive: bonusToggle}")
                    .toggler
                    .yes
                      span YES
                    .no
                      span NO
                .inner-bonus__title.innerTitle(v-if="bonusToggle")
                  span.innerTitle__title Bonus/Offers details
                    span.tooltip(v-if="bonusTip") Please list key info about promotion
                  img(src="../../../../assets/images/info-icon.png" @click="bonusTipShow")
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
            .mark-option__title2
              span.asterisk STYLE
            .mark-option__inner.styleInner
              .inner-option.style
                .inner-option__check(@click="styleChoiceUs")
                  .checker(v-if="styleUs")
                .inner-option__image
                  span US
                  img(src="../../../../assets/images/US-icon.png")
              .inner-option.style
                .inner-option__check(@click="styleChoiceUk")
                  .checker(v-if="styleUk")
                .inner-option__image
                  span UK
                  img(src="../../../../assets/images/UK-icon.png")
          .mark-option
            .mark-option__title2
              span.asterisk TONE OF VOICE
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
                p.innerText I approve for the project to begin immediately and I'll review the quote later.
            .start(:class="{markoptionChecked: markstartOption}" @click="markchooseStart")
              .start__check
                .checker(:class="{checkerChecked: markstartOption}")
              .start__text
                p.head Start Immediately
                p.innerText I approve for the project to begin immediately and to receive the quote just for reference.
          input.submit(type="submit" value="Submit")
          .mark-footer
            p.clarify Please note that all copywriting jobs come with one free round of edits. Rewriting requests come at a separate cost.
        .warning(v-if="error")
          .message
            .closeWarning(@click="closeWarning")
              i.fa.fa-times
            p(v-for="err in errors") {{ err }}
      .orderInfo
        .orderInfo__title
          h3 YOUR ORDER
        .orderInfo__summary
          .orderInfo__summary-service
            span 1
            label SERVICE:
            p.choice Marketing
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
            p.choice {{ deadlineDate }}
</template>

<script>
  import moment from "moment";
  import Datepicker from "~/components/Datepicker.vue";
  import ClickOutside from 'vue-click-outside';

  export default {
    data() {
      return {
        descrTip: false,
        audienceTip: false,
        topicsTip: false,
        toneDrop: false,
        bonusTip: false,
        projectName: "",
        packageCheck200: true,
        packageCheck400: false,
        langDrop: false,
        languages: [],
        copyLangs: [],
        langSelect: "Select",
        error: false,
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
        markstartOption: false,
        state: {
          highlighted: {
            days: [6, 0]
          },
          disabled: {
            to: moment()
              .add(-1, "day")
              .endOf("day")
              .toDate()
          }
        },
        deadlineDate: '',
        deadlineSelect: '',
        format: 'dd-MM-yyyy'
      };
    },
    methods: {
      descrTipShow() {
        this.descrTip = !this.descrTip;
      },
      audienceTipShow() {
        this.audienceTip = !this.audienceTip;
      },
      topicsTipShow() {
        this.topicsTip = !this.topicsTip;
      },
      bonusTipShow() {
        this.bonusTip = !this.bonusTip;
      },
      showTone() {
        this.toneDrop = !this.toneDrop;
      },
      closeWarning() {
        this.error = false;
      },
      outsideLangs() {
        this.langDrop = false;
      },
      outsideTones() {
        this.toneDrop = false;
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
        this.voices[ind].check = !this.voices[ind].check;
        this.genBrief.tone = this.toneSelect;
        if(this.voices[ind].input) {
          if(!this.voices[ind].check) {
            this.voices[ind].inputText = "";
          }
        }
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
          this.genBrief.briefTopics = "Not sure"
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
          this.genBrief.package = "0-400";
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
            event.check = true;
            this.selectLang.push(event);
            this.langSelect = event.lang;
          } else {
            event.check = false;
            this.selectLang.splice(pos, 1);
          }
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
          item.check = false
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
          package: "0-200",
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
        if(!this.genBrief.briefDescr) this.errors.push("Please, enter description of Brief");
        if(!this.genBrief.briefAudience) this.errors.push("Please, enter targeted audience");
        if(!this.genBrief.briefTopics) this.errors.push("Please, enter topics of brief");
        if(!this.toneSelect.length) this.errors.push("Please, chooose Tone of voice");
        if(!this.errors.length){
          this.sendForm();
          console.log("sent")
          // window.top.location.href = "https://www.pangea.global/thank-you";
          var uniqueMark = {
            projectName: this.projName,
            date: this.deadlineDate,
            type: this.typeSelect,
            targetLanguages: this.selectLang,
            package: this.genBrief.package,
            description: this.genBrief.briefDescr,
            audience: this.genBrief.briefAudience,
            title: this.genBrief.briefTitle,
            topics: this.genBrief.briefTopics,
            sure: this.genBrief.briefSure,
            example: this.genBrief.briefExample,
            structure: this.structureSelect,
            style: this.genBrief.style,
            tone: this.toneSelect
          };
          this.$store.dispatch('loadOrderDetails', uniqueCopywr);
          this.$store.dispatch('referFiles', this.refFiles);
          this.$emit('thankMark', this.service);
        } else {
          this.showError();
          event.preventDefault();
        }
      },
      showError() {
        this.error = true;
        setTimeout( () => {
          this.error = false;
        },4000)
      },
      getServices() {
        this.services = this.$store.state.services;
      },
      openPicker() {
        this.$refs.programaticOpen.showCalendar();
      }
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
    components: {
      Datepicker
    },
    directives: {
      ClickOutside
    },
    watch: {
      deadlineSelect() {
        const date = moment(this.deadlineSelect);
        if(this.deadlineSelect) {
          this.deadlineDate = date.format('DD-MM-YYYY');
        }
      }
    },
    mounted() {
      this.getLanguages();
      this.getServiceLangs();
      this.getServices();
    }
  };
</script>


<style lang="scss">
  .marketingForm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 520px;
  }

  .markdetails {
    padding-bottom: 0;
    flex-direction: column;
    margin-bottom: 38px;
    &__quote {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 30px;
      margin-bottom: 60px;
      .send, .start {
        display: flex;
        align-items: center;
        border: 1px solid rgba(102, 86, 61, 0.38);
        padding-left: 10px;
        padding-right: 10px;
        margin: 10px;
        margin-right: 0;
        cursor: pointer;
        flex-direction: column;
        width: 236px;
        height: 105px;
        &__check {
          width: 16px;
          height: 16px;
          margin-top: 5px;
          border: 1px solid #66563D;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          .checker {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }
          .checkerChecked {
            background-color: #66563D;
          }
        }
        &__text {
          width: 88%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          .head {
            margin-bottom: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          .innerText {
            text-align: center;
            font-size: 12px;
            margin-top: 0;
          }
        }
      }
      .markoptionChecked {
        box-shadow: 0 0 7px rgba(102, 86, 61, 0.6);
        border: 1px solid #66563D;
      }

    }
  }


  .mark-option {
    margin-bottom: 35px;
    .nwrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .lblockm {
        display: flex;
        flex-direction: column;
        width: 50%;
        .mark-option__title1 {
          font-size: 22px;
          margin-bottom: 5px;
          .asterisk {
            font-size: 22px;
          }
        }
        input.proj {
          width: 280px;
          height: 28px;
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 7px;
          border: 1px solid rgba(102, 86, 61, .5);
          outline: none;
          font-family: MyriadPro;
          transition: all 0.3s;
          &:focus {
            box-shadow: 0 0 3px rgba(102, 86, 61, 0.6);
          }
        }
        ::-webkit-input-placeholder {
          opacity: 0.6;
        }
      }
      .rblockm {
        display: flex;
        flex-direction: column;
        width: 44%;
        .mark-option__title1 {
          font-size: 22px;
          margin-bottom: 5px;
          .asterisk {
            font-size: 22px;
          }
        }
        .deadline {
          display: flex;
          align-items: center;
          .picker {
            input {
              font-size: 14px;
              text-align: center;
              opacity: 0.7;
              border-radius: 10px;
              border: none;
              padding: 8px;
              width: 190px;
              border: 1px solid rgba(102, 86, 61, .5);

            }
          }
          .datepick {
            img {
              cursor: pointer;
              padding-left: 5px;
              padding-top: 7px;
              width: 20px;
              height: 20px;;
            }
          }
        }
      }
    }
    &__title2 {
      font-size: 22px;
    }
    &__inner {
      padding-left: 10px;
      display: flex;
      align-items: center;
      .inner-option {
        font-size: 14px;
        margin-top: 10px;
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        &__image {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
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
      .style {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 0;
        .inner-option__check {
          margin-bottom: 5px;
        }
      }
      .inner-langs {
        margin-top: 10px;
        margin-left: 10px;
        margin-bottom: 45px;
        &__title {
          font-size: 14px;
        }
        &__select {
          position: absolute;
          left: 10px;
          margin-top: 5px;
          max-height: 490px;
          width: 510px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 10px rgba(102, 86, 61, 0.6);
          border-radius: 10px;
          background-color: #fff;
          z-index: 10;
          .select-text {
            position: relative;
            display: flex;
            justify-content: space-between;
            padding: 8px;
            align-items: center;
            min-height: 22px;
            .span-wrapper {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 10;
              color: rgba(0, 0, 0, 0);
            }
            .icon {
              padding-right: 15px;
              font-size: 20px;
            }
            .reverse {
              transform: rotate(180deg);
              padding-right: 0;
              padding-left: 15px;
            }
          }
          .clarify {
            color: #66563D;
            opacity: 0.38;
            font-size: 14px;
            .icon {
              opacity: 1;
            }
          }
          .color{
            opacity: 1;
          }
          .select__drop {
            padding: 5px;
            border-top: 1px solid #66563D;
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
                .list-item {
                  font-size: 12px;
                }
                .toneSpan {
                  font-size: 14px
                }
                .toneInput {
                  font-family: MyriadPro;
                  outline: none;
                  width: 100px;
                  margin-left: 10px;
                  padding: 2px;
                  border-radius: 10px;
                  border: 1px solid #66563D;
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
      .toneSelect {
        width: 177px;
      }
    }
    .styleInner {
      margin-top: 30px;
    }
    .genBrief {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      .innerTitle {
        font-size: 14px;
        display: flex;
        align-items: center;
      }
      &__item {
        width: 100%;
        margin-bottom: 25px;
        input {
          outline: none;
          width: 97%;
          border: 1px solid #66563D;
          border-radius: 7px;
          height: 17px;
          padding: 6px;
          font-family: MyriadPro;
        }
        textarea {
          outline: none;
          width: 97%;
          border: 1px solid #66563D;
          border-radius: 7px;
          height: 17px;
          padding: 6px;
          overflow: hidden;
          transition: all 0.3s;
          resize: none;
          font-family: MyriadPro;
        }
        .inner-topics {
          &__textField {
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            input {
              width: 55%;
              padding: 6px;
              height: 17px;
              border: 1px solid #66563D;
              border-radius: 7px;
              font-family: MyriadPro;
            }
            button {
              font-size: 16px;
              width: 114px;
              height: 40px;
              border-radius: 14px;
              border: none;
              box-shadow: 0 2.5px 7px rgba(0,0,0,0.5);
              color: #FFF;
              background-color: #D15F45;
              cursor: pointer;
              outline: none;
              font-size: 14px;
            }
            .notSure {
              color: #66563D;
              background-color: #FFF;
            }
          }
          &__hiddenText {
            margin-top: 25px;
            font-size: 14px;
            p {
              margin-top: 5px;
              .strong {
                font-weight: bold;
              }
            }
            p.asterisk {
              margin-bottom: 5px;
            }
            ul {
              width: 100%;
              margin: 3px 0;
              padding-left: 15px;
              li {
                margin-bottom: 5px;
                padding-left: 7px;
                .strong {
                  font-weight: bold;
                }
              }
            }
          }
        }
        .inner-examples {
          &__textField {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
          }
          &__web {
            display: flex;
            flex-direction: column;
            align-items: center;
            input {
              width: 150px;
              height: 40px;
              padding: 0 10px;
              border-radius: 10px;
              border: none;
              outline: none;
              border: 1px solid rgba(102, 86, 61, 0.7);
              font-family: MyriadPro;
            }
            ::-webkit-input-placeholder {
              text-align: center;
              opacity: 0.5;
            }
            .under {
              padding-top: 12px;
              font-size: 12px;
            }
          }

          &__button {
            position: relative;
            width: 170px;
            display: flex;
            flex-direction: column;
            align-items: center;
            span {
              font-size: 14px;
            }
            .uploadBtn {
              overflow: hidden;
              position: relative;
              width: 86%;
              padding: 12px;
              border-radius: 12px;
              box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
              background-color: #D15F45;
              cursor: pointer;
              &:hover {
                box-shadow: 0 0px 15px rgba(0, 0, 0, 0.4);
              }
              &__txt {
                z-index: 1;
                position: relative;
                color: #fff;
                font-size: 15px;
                font-family: MyriadPro;
                text-align: center;
              }
              input {
                top: 1px;
                right: 0;
                z-index: 2;
                position: absolute;
                cursor: pointer;
                opacity: 0;
                filter: alpha(opacity=0);
                font-size: 50px;
                font-family: MyriadPro;
              }
            }
            .under {
              padding-top: 12px;
              font-size: 12px;
            }
          }
        }
      }
    }
    .voiceChekers {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      width: 100%;
      padding-left: 10px;
      margin-top: 20px;
      max-height: 165px;
      .inner-option {
        width: 36.5%;
        flex-direction: row;
        margin-bottom: 20px;
        align-items: center;
        .voiceTitle {
          padding-left: 10px;
        }
        input {
          width: 54px;
          height: 28px;
          margin-left: 10px;
          border: 1px solid rgba(102, 86, 61, 0.7);
          border-radius: 5px;
          font-family: MyriadPro;
        }
        &__check {
          border-radius: 0;
          width: 18px;
          height: 18px;
          border: 1px solid #66563D;
          .checker {
            background-color: #FFF;
            position: relative;
            &::before {
              content: "";
              position: absolute;
              width: 10px;
              height: 4px;
              background-color: #66563D;
              bottom: 2px;
              left: -2px;
              transform: rotate(40deg);
            }
            &::after {
              content: "";
              position: absolute;
              width: 4px;
              height: 13px;
              background-color: #66563D;
              bottom: 0;
              right: 1px;
              transform: rotate(40deg);
            }
          }
        }
      }
    }
  }
  .mark-footer {
    width: 100%;
    position: relative;
    margin-top: 50px;
    .clarify {
      position: absolute;
      width: 100%;
      font-size: 12px;
      text-align: center;
      bottom: 110px;
    }
  }
  .submit {
    background-color: #D15F45;
    outline: none;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    color: #fff;
    width: 164px;
    height: 40px;
    border: none;
    border-radius: 10px;
    margin-top: 15px;
    cursor: pointer;
    margin: 0 auto;
  }
  .active {
    color: #D15F45;
  }

  .innerTitle {
    &__title {
      position: relative;
      .tooltip {
        position: absolute;
        color: #F4866E;
        width: 500px;
        top: -15px;
        transition: all 0.3s;
        .inner-topics__title & {
          left: 10px;
          width: 570px;
        }
        .inner-subject__title & {
          top: -3px;
          left: 160px;
        }
        .inner-bonus__title & {
          top: -2px;
          left: 140px;
        }
      }
    }
    img {
      padding-bottom: 2px;
      cursor: pointer;
    }
  }

  .toggle {
    width: 76px;
    height: 28px;
    display: flex;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;
    .toggler {
      position: absolute;
      width: 46%;
      height: 100%;
      left: 0;
      top: 0;
      background: rgb(155, 155, 155);
      background: -moz-linear-gradient(top, rgba(185, 185, 185, 0.699) 11%, rgba(170, 170, 170,1) 100%);
      background: -webkit-linear-gradient(top, rgba(238, 238, 238, 0.76) 11%,rgba(170, 170, 170,1) 100%);
      background: linear-gradient(to bottom, rgb(238, 238, 238) 11%,rgba(170, 170, 170,1) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#eeeeee', endColorstr='#cccccc',GradientType=0 );
      box-shadow: 0 0 3px rgba(0,0,0,0.5);
      z-index: 2;
      transition: all 0.3s;
    }
    .yes, .no {
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      transition: all 0.3s;
      span {
        padding-top: 3px;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
      }
    }
    .yes {
      width: 45%;
      box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
      background-color: #82CD8F;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }
    .no {
      width: 55%;
      box-shadow: inset -2px 2px 5px rgba(0,0,0,0.5);
      background-color: #978D7E;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
  .positive {
    .toggler {
      transform: translateX(41px);
    }
    .yes {
      width: 55%;
    }
    .no {
      width: 45%;
    }
  }

  .switching {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 170px;
    margin-bottom: 15px;
  }

  .asterisk {
    .warning & {
      font-size: 20px;
      position: relative;
      padding-right: 15px;
    }
    &:after {
      content: '*';
      color: #F00;
      .warning & {
        position: absolute;
        font-size: 30px;
        right: -1px;
      }
    }
  }

  .vdp-datepicker__calendar {
    div {
      .day-header {
        font-weight: bold;
        font-size: 16px;
      }
      .cell {
        background-color: #eaeaea;
      }
    }
  }

  .disable {
    opacity: 0.5;
  }
  .mainWrapper {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    margin-bottom: 30px;

    .container {
      position: relative;
      font-family: MyriadPro;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 80px 0 80px;
      border: 1px solid #67563D;
      border-radius: 15px;;
      color: #67563D;
      position: relative;
    }
    .orderInfo {
      font-family: MyriadPro;
      color: #66563D;
      transition: all 0.7s;
      margin-left: 30px;
      padding-bottom: 20px;
      border: 1px solid #66563D;
      border-radius: 15px;
      position: sticky;
      top: calc(6vh + 7px);
      right: 20px;
      width: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      @media (max-width: 1024px) {
        margin-left: 0;
      }
      @media (max-width: 1023px) {
        display: none;
      }
      &__title {
        width: 100%;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        h3 {
          font-size: 22px;
          margin-bottom: 5px;
          margin-top: 15px;
          text-align: center;
          font-weight: normal;
        }
      }
      &__summary {
        padding: 10px 20px 0;
        p {
          padding-left: 20px;
        }
        span {
          font-size: 30px;
          padding-right: 5px;
          font-family: MyriadBold;
        }
        label {
          font-size: 18px;
          font-family: MyriadBold;
        }
        .check {
          margin-top: 5px;
          color: #D15F45;
          font-family: MyriadPro;
        }
        &-languages {
          p {
            .check {
              font-size: 16px;
              color: #D15F45;
            }
          }
        }
        &-deadline {
          p {
            .check {
              font-size: 16px;
              color: #D15F45;
            }
          }
        }
      }
    }
  }

</style>

