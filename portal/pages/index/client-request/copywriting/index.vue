<template lang="pug">
  .copywritingWrapper
    .container
      form.copywriting-form(@submit.prevent="checkForm")
        .col-1
          .col-1__block0
            .lblock
              .name
                label.asterisk PROJECT NAME:
                input(:class="classes('projectName')" type="text" placeholder="50 characters maximum" v-model="projectName")
            .rblock
              .name
                label.asterisk SUGGESTED DEADLINE:
              .deadline
                .picker
                  datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                .datepick(@click='openPicker')
                  img(src='../../../../assets/images/calendar.png')
        .col-2
          .col-2__block1
            label.asterisk SELECT A LANGUAGE:
          .col-2__block2
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
        .col-3
          .col-3__block1
            span.block1 PACKAGE
          .col-3__block2
            .col-3__block2-sub(v-for="(item, index) in col3_block2" @click="switchcheck(index)" :class="{check: item.check}")
              .checkTitle
                .selected
                  .empty-check
                    .check-sel(v-if="item.check")
                span.sub1 {{ item.title }}
              img(:src="item.image")
          .col-1__block1
            span.block1 TYPE
          .col-1__block2
            .col-1__block2-sub1(v-for="(item, index) in col1_block2" @click="switchBg(index)" :class="{activeType: item.active}")
              span.sub1 {{ item.title }}
              img(v-if="item.active" :src="item.imageN")
              img(v-else :src="item.imageW")
        .col-4
          .col-4__block1
            span.block1 GENERAL BRIEF
          .col-4__block2
            .descr
              .head
                span.block2 Description
                span.star *
                img.inform-icon(src="../../../../assets/images/info-icon.png" @click="descrTooltip")
                span.notice(:class="{notice_vis: boolForDescrTool}") {{ descriptionToolTip }}
            .inner-ta
              textarea.ta-block2(rows="1" @keyup="autoGrow()" v-model="genBrief.briefDescr") {{ genBrief.briefDescr }}
          .col-4__block3
            .descr-1
              .head-1
                span.block3 Targeted Audience
                span.notice-1(:class="{notice_1_vis: boolForTargTool}") {{ targetAudienceToolTip }}
                img.inform-icon(src="../../../../assets/images/info-icon.png" @click="targTooltip")
            .in-block3
              input(v-model="genBrief.briefAudience" value="genBrief.briefAudience")
          .col-4__block4
            span.block4 Suggested title
            .in-block4
              input(v-model="genBrief.briefTitle" value="genBrief.briefTitle")
          .col-4__block5
            .descr-2
              .head-2
                span.block5(:class="{in_block5_opac: inblock5}") Topics to mention or not mention
                span.notice-2(:class="{notice_2_vis: boolForTopicsTool}") {{ topicsToolTip }}
                span.star *
                img.inform-icon(src="../../../../assets/images/info-icon.png" @click="topicsTooltip")
            .wrap
              .in-block5
                textarea.tarcl(v-model="genBrief.briefTopics" :class="{in_block5_opac: inblock5}" :readonly="sure") {{ genBrief.briefTopics }}
              .block5-delim
                span.delim or
              .block5-but
                button(@click.prevent="iamNotSure" :class="{notSure: sure}") I am not sure
          .col-4__block6(v-if="sure")
            .col-4__block6-header
              span.block6 If you are unsure of what points the article should cover, please select one of the following:
              span.star *
              .sureOptions
                .col-4__block6-main
                  .main-outer(:class="{copyoptionChecked: topicsOption}" @click="topicsSure")
                    .selected
                      .empty-check
                        .check-sel(v-if="topicsOption")
                    .descr-3
                      .head-3
                        span.normsp Give the copywriter freedom
                        img.inform-icon(src="../../../../assets/images/info-icon.png")
                        span.rsp(:class="{rspSecond: true}") You give the copywriter freedom to write article as they please. You will only receive one round of edits if you think the article needs improvement.
                  .main-outer(:class="{copyoptionChecked: requestOption}" @click="topicsRequest")
                    .selected
                      .empty-check
                        .check-sel(v-if="requestOption")
                    .descr-3
                      .head-3
                        span.normsp Request an outline from the copywriter
                          img.inform-icon(src="../../../../assets/images/info-icon.png")
                        span.rsp(:class="{rspSecond: true}") The copywriter will provide you with bullet points/topics to include in the article and you can approve them before hand. Please note: this comes at an additional cost
          .col-4__block7
            .first
              span.exp Examples
              input.in(type="text" placeholder="www.example.com" value="genBrief.briefExample" v-model="genBrief.briefExample")
              span.url URL
            .second
              .uploadBtn
                .uploadBtn__text Upload
                input(name="refFiles" type="file" @change='copyChangeRefFiles')
              span.se Upload Reference File
              .loadedList
                li.loadedList__item(v-if="refFiles.name" @click="refRemove(file)") {{ refFiles.name }}
                  i.fa.fa-times.deleteIcon
        .col-5
          .col-5__block1
            span.block1 STRUCTURE TO INCLUDE
          .block1-wrapper
            .sub(v-for="(item, index) in col5_block1" @click="switchStructure(index)" :class="[{check: item.check}, {sub_unbord: index == 3}]")
              .selected
                .empty-check
                  .check-sel(v-if="item.check")
              span.title(:class="[{sec_title: index == 1}, {four_title: index == 3}]") {{ item.title }}
              img.secImg(:src="item.image1" v-if="index != 3")
              textarea.inpbl5(v-if="index == 3" :class="{textarea_vis: true}" v-model="item.input" @click.prevent="switchStructure(index)" rows="1" @keyup="autoGrowInp5()")
        .col-6
          .col-6__block1
            span.block1 STYLE
            span.star *
          .col-6__block2
            .sub(v-for="(item, index) in col6__block1" @click="switchBlock6(index)" :class="{check: item.check}")
              .selected
                .empty-check
                  .check-sel(v-if="item.check")
              span {{ item.title }}
              img(:src="item.image")
        .col-7
          .col-7__block1
            span.asterisk.copytone TONE OF VOICE
            .voiceChekers
              .inner-option(v-for="(voice, i) in voices")
                .inner-option__check(@click="voicecheck(i)")
                  .checker(v-if="voice.check")
                span.voiceTitle {{ voice.title }}
                input(v-if="voice.input" type="text" v-model="voice.inputText")
        .col-8
          .col-8__block1
            span.block1 DESIGN
            .subject-toggle.toggle(@click="toggleSub" :class="{positive: designToggle}")
              .toggler
              .yes
                span YES
              .no
                span NO
          .col-8__block3(v-if="designToggle")
            .designChekers
              .desinner-option(v-for="(item, i) in col8__block3")
                .desinner-option__check(@click="designcheck(i)")
                  .checker(v-if="item.check")
                span.designTitle {{ item.title }}
        .col-9
          .col-9__block1
            span.block1 SEO
            .subject-toggle2.toggle(@click="toggleSub2" :class="{positive: seoToggle}")
              .toggler
              .yes
                span YES
              .no
                span NO
            .voiceChekers.seoadd(v-if="seoToggle")
              .inner-option.additionalInn
                .inner-option__check(@click="voicecheckSeo")
                  .checker(v-if="meta.check")
                span.voiceTitle {{ meta.title }}
          .col-9__block2(v-if="seoToggle")
            .sub(v-for="(item, index) in col9__block2")
              .sub__choose
                span.title1 {{ item.title1 }}
                input(v-model="item.input" value="item.input")
          .copydetails__quote
            .send(:class="{copyoptionChecked: copysendOption}" @click="copychooseBegin")
              .send__check
                .checker(:class="{checkerChecked: copysendOption}")
              .send__text
                p.head Send a Quote
                p.insideText I approve for the project to begin immediately and I'll review the quote later.
            .start(:class="{copyoptionChecked: copystartOption}" @click="copychooseStart")
              .start__check
                .checker(:class="{checkerChecked: copystartOption}")
              .start__text
                p.head Start Immediately
                p.insideText I approve for the project to begin immediately and to receive the quote just for reference.
          .col-9__block3
            .bot
              .buttonWrap
                input(type="submit" value="Submit")
                span.foot {{ footSpan }}
      .warning(v-if="error")
        .message
          .closeWarning(@click="closeWarning")
            i.fa.fa-times
          p(v-for="err in errors") {{ err }}
    .orderInfoCopy
      .orderInfoCopy__title
        h3 YOUR ORDER
      .orderInfoCopy__summary
        .orderInfo__summary-service
          span 1
          label SERVICE:
          p.check {{ service }}
        .orderInfoCopy__summary-type
          span 2
          label TYPE:
          p.check {{ typeSelect }}
        .orderInfoCopy__summary-language
          span 3
          label LANGUAGE:
          p.check &nbsp;
            template(v-for="language of selectLang") {{ language.lang }};
            template(v-if="selectLang == 0") Select
        .orderInfoCopy__summary-package
          span 4
          label PACKAGE:
          p.check {{ genBrief.package }}
        .orderInfoCopy__summary-deadline
          label SUGGESTED DEADLINE
          p.check {{ deadlineDate }}
</template>

<script>
  import moment from "moment";
  import Datepicker from "~/components/Datepicker.vue";
  import ClickOutside from 'vue-click-outside';

  export default {
    data() {
      return {
        error: false,
        col1_block2: [
          {
            title: "Article",
            imageN: require("../../../../assets/images/article-icon.png"),
            imageW: require("../../../../assets/images/article-icon-selected.png"),
            active: true
          },
          {
            title: "Blog Post",
            imageN: require("../../../../assets/images/blog-icon.png"),
            imageW: require("../../../../assets/images/blog-icon-selected.png"),
            active: false
          },
          {
            title: "Review",
            imageN: require("../../../../assets/images/reviews-icon.png"),
            imageW: require("../../../../assets/images/reviews-icon-selected.png"),
            active: false
          }
        ],
        col3_block2: [
          {
            title: "0-200",
            image: require("../../../../assets/images/UP-TO-199-icon.png"),
            check: false
          },
          {
            title: "0-400",
            image: require("../../../../assets/images/200-399-icon.png"),
            check: true
          },
          {
            title: "0-600",
            image: require("../../../../assets/images/400-599-icon.png"),
            check: false
          },
          {
            title: "0-1000",
            image: require("../../../../assets/images/600-999-icon.png"),
            check: false
          },
          {
            title: "0-1400",
            image: require("../../../../assets/images/1000-1400-icon.png"),
            check: false
          }
        ],
        col4_block6: [
          {
            title1:
              "You give the copywriter freedom to write article as they please. You will only receive one round of edits if you think the article needs improvement.",
            title2: "Give the copywriter freedom",
            check: true
          },
          {
            title1:
              "The copywriter will provide you with bullet points/topics to include in the article and\nyou can approve them beforehand.Please note:this comes at an additional cost",
            title2: "Request an outline from the copywriter",
            check: false
          }
        ],
        col5_block1: [
          {
            title: "Sub-heading",
            image: require("../../../../assets/images/unselected-checkbox.png"),
            image1: require("../../../../assets/images/article-icon.png"),
            check: true
          },
          {
            title: "Only Paragraphs",
            image: require("../../../../assets/images/unselected-checkbox.png"),
            image1: require("../../../../assets/images/article-icon.png"),
            check: false
          },
          {
            title: "Bullet points",
            image: require("../../../../assets/images/unselected-checkbox.png"),
            image1: require("../../../../assets/images/article-icon.png"),
            check: false
          },
          {
            title: "Others",
            input: "",
            image: require("../../../../assets/images/unselected-checkbox.png"),
            image1: require("../../../../assets/images/article-icon.png"),
            check: false
          }
        ],
        col6__block1: [
          {
            title: "US",
            image: require("../../../../assets/images/US-icon.png"),
            check: true
          },
          {
            title: "UK",
            image: require("../../../../assets/images/UK-icon.png"),
            check: false
          }
        ],
        col7__block2: [
          {
            title: "Formal",
            check: true
          },
          {
            title: "Informal",
            check: false
          },
          {
            title: "Excited",
            check: false
          },
          {
            title: "Straightforward",
            check: false
          },
          {
            title: "Serious",
            check: false
          },
          {
            title: "Relaxed",
            check: false
          },
          {
            title: "Parsuasive",
            check: false
          },
          {
            title: "Playful/Funny",
            check: false
          },

          {
            title: "Other",
            input: "",
            check: false
          }
        ],
        genBrief: {
          briefDescr: "",
          briefAudience: "",
          briefTitle: "",
          briefTopics: "",
          briefSure: "",
          briefExample: "",
          briefRef: [],
          package: "0-400",
          structure: [],
          style: "US",
          tone: [],
          design: [],
          seo: [],
          cta: "No"
        },
        format: 'dd-MM-yyyy',
        detailFiles: [],
        refFiles: [],
        services: [],
        projectName: "",
        langDrop: false,
        languages: [],
        copyLangs: [],
        langSelect: "Select",
        selectLang: [],
        designToggle: false,
        seoToggle: false,
        col8__block3: [
          {
            title: "Images",
            check: true
          },
          {
            title: "Charts",
            check: false
          },
          {
            title: "Other",
            check: false
          }
        ],
        col9__block2: [
          {
            title1: "Keywords",
            input: "",
            // check: true
          },
          {
            title1: "Keyword density",
            input: "",
            // check: false
          },
          {
            title1: "Other",
            input: "",
            // check: false
          }
        ],
        slide: "0px",
        typeSelect: "Article",
        sure: false,
        footSpan: 'Please note that all copywriting jobs come with one free round of edits. Rewriting requests come at separate cost.',
        copysendOption: true,
        copystartOption: false,
        errors: [],
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
        toneDrop: false,
        voices: [
          // { title: "Promotional", check: false },
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
        descriptionToolTip: 'Please give a brief description of the project in as match detail as possible.',
        boolForDescrTool: false,
        targetAudienceToolTip: 'What kind of audience will read this article?',
        boolForTargTool: false,
        topicsToolTip: 'What main topics should or should not be discussed in the article? Please be as detailed as possible.',
        boolForTopicsTool: false,
        inblock5: false.check,
        meta: {
          title: 'Include META tags',
          check: true
        },
        topicsOption: true,
        requestOption: false
      };
    },
    methods: {
      topicsSure(){
        this.topicsOption = true;
        this.requestOption = false;
        this.col4_block6[0].check = true;
        this.col4_block6[1].check = false;
        this.genBrief.briefTopics = this.col4_block6[0].title2;

      },
      topicsRequest() {
        this.topicsOption = false;
        this.requestOption = true;
        this.col4_block6[0].check = false;
        this.col4_block6[1].check = true;
        this.genBrief.briefTopics = this.col4_block6[1].title2;

      },
      autoGrow() {
        let grow = document.getElementsByClassName("ta-block2")[0];
        let row = grow.getAttribute("rows");
        if (grow.clientHeight < grow.scrollHeight) {
          grow.style.height = grow.scrollHeight * 2 - grow.clientHeight + "px";
        }
      },
      autoGrowInp() {
        let grow = document.getElementsByClassName(".inpbl5")[0];
        let row = grow.getAttribute("rows");
        if (grow.clientHeight < grow.scrollHeight) {
          grow.style.height = grow.scrollHeight * 2 - grow.clientHeight + "px";
        }
      },
      voicecheckSeo() {
        this.meta.check = !this.meta.check;
      },
      descrTooltip() {
        this.boolForDescrTool = !this.boolForDescrTool;
      },
      targTooltip() {
        this.boolForTargTool = !this.boolForTargTool;
      },
      topicsTooltip() {
        this.boolForTopicsTool = !this.boolForTopicsTool;
      },
      closeWarning() {
        this.error = false;
      },
      outsideLangs() {
        this.langDrop = false;
      },
      iamNotSure() {
        this.sure = !this.sure;
        this.inblock5 = !this.inblock5;
        // document.getElementsByClassName("tarcl")[0].readOnly = this.sure;
        if(this.sure) {
          for(let i = 0; i < this.col4_block6.length; i++) {
            if(this.col4_block6[i].check) {
              this.genBrief.briefTopics = this.col4_block6[i].title2;
            }
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
      switchBg(index) {
        this.col1_block2.forEach((item, i) => {
          if (index == i) {
            item.active = true;
            this.typeSelect = item.title;
          } else {
            item.active = false;
          }
        });
      },
      switchcheck(index) {
        this.col3_block2.forEach((item, i) => {
          if (index == i) {
            item.check = true;
            this.genBrief.package = item.title;
          } else {
            item.check = false;
          }
        });
      },
      switchPoints(index) {
        this.col4_block6.forEach((item, i) => {
          if (index == i) {
            item.check = true;
            // this.genBrief.briefSure = item.title2;
          } else {
            item.check = false;
          }
        });
      },
      switchStructure(index) {
        this.col5_block1.forEach((item, i) => {
          if (index == i) {
            item.check = !item.check;
          }
        })
      },
      switchBlock6(index) {
        let style = this.col6__block1;
        if (style[index].check) {
          this.styleSelect = style[index].title;
          return true
        } else {
          style.forEach(item => {
            item.check = !item.check;
            if(item.check) {
              this.genBrief.style = item.title
            }
          })
        }
      },
      switchBlock7(index) {
        this.col7__block2.forEach((item, i) => {
          if (index == i) {
            item.check = !item.check;
          }
        });
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
      toggleSub() {
        this.designToggle = !this.designToggle;
        if(!this.designToggle) {
          this.col8__block3.forEach((item,i) => {
            if(i == 0) { item.check = true }
            else { item.check = false }
            if(i == 2) item.input = ""
          })
        }
      },
      toggleSub2() {
        this.seoToggle = !this.seoToggle;
        if(!this.seoToggle) {
          this.col9__block2.forEach((item, i) => {
            item.input = "";
            if(i == 0) { item.check = true }
            else { item.check = false }
          })
        }
      },
      switchBlock8(index) {
        this.col8__block3.forEach((item, i) => {
          if (index == i) {
            item.check = !item.check;
          }
        });
      },
      switchBlock9(index) {
        this.col9__block2.forEach((item, i) => {
          if (index == i) {
            item.check = !item.check;
          }
        });
      },
      copychooseBegin() {
        this.copysendOption = true;
        this.copystartOption = false
      },
      copychooseStart() {
        this.copysendOption = false;
        this.copystartOption = true
      },
      copyChangeRefFiles(event){
        this.refFiles = event.target.files[0];
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
        this.col1_block2.forEach(item => {
          if(item.title == "Article") {
            item.active = true
          } else {
            item.active = false
          }
        });
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
        this.col3_block2.forEach(item => {
          if(item.title == '200-399') {
            item.check = true
          } else {
            item.check = false
          }
        });
        this.sure = false;
        this.designToggle = false;
        this.seoToggle = false;
        this.col5_block1.forEach((item, i) => {
          if(i == 0) { item.check = true }
          else { item.check = false };
          if(i == 3) { item.input = "" }
        });
        this.col7__block2.forEach((item, i) => {
          if(i == 0) {item.check = true}
          else { item.check = false };
          if(i == 8) { item.input = "" }
        })
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

        this.genBrief.structure = this.structureSelect;
        this.genBrief.tone = this.toneSelect;
        this.genBrief.design = this.designSelect;
        this.genBrief.seo = this.seoSelect;

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
        if(this.copysendOption) {
          const result = await this.$axios.$post('api/request', sendForm);
        }
        if(this.copystartOption) {
          const result = await this.$axios.$post('api/project-request', sendForm);
        }
        this.clearForm();
      },
      async checkForm(event) {
        this.request = {
          projectName: this.projName,
          date: "",
          contactName: this.$store.state.clientInfo.name,
          contactEmail: this.$store.state.clientInfo.email,
          service: this.$store.state.clientInfo.service,
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
        if(!this.genBrief.briefDescr) this.errors.push("Brief description required!");
        if(!this.genBrief.briefTopics) this.errors.push("Please, enter topics of brief");
        if(!this.toneSelect.length) this.errors.push("Please, choose tone of voice");
        if(!this.errors.length){
          this.sendForm();
          console.log("sent")
          // window.top.location.href = "https://www.pangea.global/thank-you";
          var uniqueCopywr = {
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
            tone: this.toneSelect,
            design: this.designSelect,
            seo: this.seoSelect
          };
          var requestType = 'QUOTE';
          if(!this.copysendOption) {
            requestType = 'PROJECT'
          }
          this.$store.dispatch('loadOrderDetails', uniqueCopywr);
          this.$store.dispatch('referFiles', this.refFiles);
          this.$store.dispatch('requestType', requestType);
          this.$emit('thankCopy', this.service);
        } else {
          this.showError();
          event.preventDefault();
        }
      },
      showError() {
        this.error = true;
        setTimeout( () => {
          this.error = false;
        }, 4000)
      },
      getServices() {
        this.services = this.$store.state.services;
      },
      classes(err) {
        for(let i = 0; i < this.errors.length; i++ ) {
          if(this.errors[i].title == err) {
            return 'errorActive'
          }
        }
      },
      openPicker() {
        this.$refs.programaticOpen.showCalendar();
      },
      voicecheck(ind) {
        console.log(ind);
        this.voices[ind].check = !this.voices[ind].check;
        this.genBrief.tone = this.toneSelect;
      },
      designcheck(ind) {
        this.col8__block3[ind].check = !this.col8__block3[ind].check;
        this.genBrief.design = this.designSelect;
      },
      outsideTones() {
        this.toneDrop = false;
      },
      showTone() {
        this.toneDrop = !this.toneDrop;
      },
      refRemove(event) {
        this.refFiles = [];
      }
    },
    computed: {
      projName() {
        let result = "";
        if (this.projectName) {
          result = this.typeSelect + ": " + this.projectName;
        }
        return result;
      },
      structureSelect() {
        let result = [];
        this.col5_block1.forEach( (item) => {
          if(item.check) {
            if (item.title == "Others") {
              result.push(item.input)
            } else {
              result.push(item.title);
            }
          }
        })
        return result;
      },
      designSelect() {
        let result = []
        this.col8__block3.forEach( (item) => {
          if(item.check) {
            if (item.title == "Other") {
              result.push(item.input)
            } else {
              result.push(item.title);
            }
          }
        })
        return result;
      },
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
      seoSelect() {
        let result = [];
        this.col9__block2.forEach((item) => {
          if(item.input) {
            result.push(item);
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
      },
      service() {
        return this.$store.state.clientInfo.service;
      },
      topicSelect() {
        let result = '';
        if(this.sure) {
          for(let i = 0; i < this.col4_block6.length; i++) {
            if(col4_block6[i].check) {
              console.log(col4_block6[i].title2);
              result = this.col4_block6[i].title2;
            }
          }
        }
        return result;
      }
    },
    watch: {
      deadlineSelect() {
        const date = moment(this.deadlineSelect);
        if(this.deadlineSelect) {
          this.deadlineDate = date.format('DD-MM-YYYY');
        }
      }
    },
    components: {
      Datepicker
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
  .copywritingWrapper {
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
      margin-left: 20%;
      @media (max-width: 1320px) {
        margin-left: 3%;
        width: 55%;
      }
      @media (max-width: 1070px) {
        margin: 5px;
        justify-content: flex-start;
        align-items: flex-start;
      }
      @media (max-width: 1024px) {
        width: 65%;
      }
      @media (max-width: 868px) {
        width: 80%;
      }

      .copywriting-form {
        width: 100%;
        max-width: 520px;
        .col-1 {
          margin-bottom: 35px;
          &__block0 {
            color: #67573E;
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            justify-content: space-between;
            .lblock {
              width: 50%;
              label {
                font-size: 22px;
                margin-bottom: 5px;
              }
              ::-webkit-input-placeholder {
                opacity: 0.6;
              }
              .name {
                display: flex;
                flex-direction: column;
                input {
                  margin-left: 10px;
                  height: 28px;
                  padding-left: 5px;
                  padding-right: 5px;
                  border-radius: 7px;
                  border: 1px solid rgba(102, 86, 61, 0.5);
                  outline: none;
                  font-family: MyriadPro;
                  transition: all 0.3s;
                  &:focus {
                    box-shadow: 0 0 5px rgba(102, 86, 61, 0.5);
                  }
                }
              }
            }
            .rblock {
              width: 44%;
              .name {
                display: flex;
                flex-direction: column;
                .asterisk {
                  font-size: 22px;
                  margin-bottom: 5px;
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
                    border: 1px solid rgba(102, 86, 61, 0.5);
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
          &__block1 {
            margin-bottom: 15px;
            margin-top: 40px;
            .block1 {
              margin-right: 5px;
              &::after {
                content: '*';
                color: #f00;
              }
            }
            .block2 {
              display: flex;
              justify-content: space-around;
              margin-bottom: 10px;
            }
          }
          &__block2 {
            display: flex;
            justify-content: space-between;
            padding-left: 10px;
            &-sub1 {
              display: flex;
              align-items: center;
              color: #67563D;
              border: 1px solid #67563D;
              border-radius: 16px;
              padding: 7px;
              background-color: #fff;
              cursor: pointer;
              .sub1 {
                margin-right: 20px;
                font-weight: bold;
              }
              img {
                margin-right: 10px;
              }
            }
          }
        }

        .col-2 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 10px;
            .asterisk {
              font-size: 22px;
            }
          }
          &__block2 {
            .inner-langs {
              margin-top: 10px;
              margin-left: 10px;
              margin-bottom: 80px;
              &__title {
                padding-left: 8px;
                font-size: 14px;
              }
              &__select {
                position: absolute;
                margin-top: 5px;
                max-height: 490px;
                width: 100%;
                max-width: 510px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 10px rgba(102, 86, 61, 0.6);
                border-radius: 10px;
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
                  z-index: 10;
                  background-color: white;
                  border-bottom-left-radius: 10px;
                  border-bottom-right-radius: 10px;
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

        .col-3 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 7px;
            .block1 {
              font-size: 22px;
              margin-right: 5px;
              &::after {
                content: '*';
                color: #f00;
              }
            }
          }
          &__block2 {
            padding-left: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            height: 110px;
            &-sub {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              cursor: pointer;
              .checkTitle {
                .selected {
                  display: flex;
                  justify-content: center;
                }
              }

              span {
                margin-bottom: 24px;
                &:last-child {
                  margin-bottom: 10px;
                }
              }
              img {
                width: 71px;
              }
            }
          }
        }

        .col-4 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 1px;
            .block1 {
              font-size: 22px;
            }
          }
          &__block2 {
            padding-left: 10px;
            font-size: 14px;
            .descr {
              .head {
                position: relative;
                margin-top: 20px;
                // .block2 {
                //     &:hover ~ .notice {
                //         visibility: visible;
                //     }
                // }
                .notice {
                  margin-left: 70px;
                  color: #f4866e;
                  font-size: 14px;
                  white-space: nowrap;
                  visibility: hidden;
                  z-index: 1;
                  position: absolute;
                  top: -16px;
                  left: 1px;
                }
                .notice_vis {
                  visibility: visible;
                }
              }
            }

            .inner-ta {
              margin-bottom: 20px;
              .ta-block2 {
                font-family: MyriadPro;
                border-radius: 8px;
                outline: none;
                width: 98%;
                padding-top: 4px;
                padding-left: 7px;
                resize: none;
              }
            }
          }
          &__block3 {
            padding-left: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            .descr-1 {
              .head-1 {
                margin-top: 20px;
                position: relative;
                // .block3 {
                //     &:hover ~ .notice-1 {
                //         visibility: visible;
                //     }
                // }
                .notice-1 {
                  margin-left: 70px;
                  color: #f4866e;
                  font-size: 14px;
                  white-space: nowrap;
                  visibility: hidden;
                  z-index: 1;
                  position: absolute;
                  top: -14px;
                  left: 38px;
                }
                .notice_1_vis {
                  visibility: visible;
                }
              }
            }
            .in-block3 {
              input {
                font-family: MyriadPro;
                border-radius: 8px;
                outline: none;
                width: 98%;
                border: 1px solid #bfb09d;
                padding: 4px 0 4px 7px;
              }
            }
          }
          &__block4 {
            padding-left: 10px;
            margin-bottom: 20px;
            .block4 {
              font-size: 14px;
            }
            .in-block4 {
              input {
                font-family: MyriadPro;
                border-radius: 8px;
                outline: none;
                width: 98%;
                border: 1px solid #bfb09d;
                padding: 4px 0 4px 7px;
              }
            }
          }
          &__block5 {
            padding-left: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            .descr-2 {
              .head-2 {
                margin-top: 20px;
                position: relative;
                // .block5 {
                //     &:hover ~ .notice-2 {
                //         visibility: visible;
                //     }
                // }
                .notice-2 {
                  margin-left: 70px;
                  color: #f4866e;
                  font-size: 14px;
                  white-space: nowrap;
                  visibility: hidden;
                  z-index: 1;
                  position: absolute;
                  top: -16px;
                  left: -57px;
                }
                .notice_2_vis {
                  visibility: visible;
                }
              }
            }
            .wrap {
              display: flex;
              justify-content: space-between;
              .in-block5 {
                width: 55%;
                textarea {
                  font-family: MyriadPro;
                  border-radius: 8px;
                  outline: none;
                  width: 100%;
                  border: 1px solid #bfb09d;
                  padding: 4px 0 4px 7px;
                  resize: none;
                }
              }
              .block5-delim {
                display: flex;
                align-items: center;
              }
              .block5-but {
                margin-top: -2px;
                button {
                  border: 0;
                  width: 114px;
                  height: 40px;
                  border-radius: 12px;
                  background-color: #D15F45;
                  box-shadow: 1px 1px 5px rgba(102, 86, 61, 0.6);
                  font-size: 14px;
                  color: #FFF;
                  outline: none;
                  cursor: pointer;
                }
                .notSure {
                  background-color: #fff;
                  color: #66563D;
                }
              }
            }
          }

          &__block6 {
            padding-left: 10px;
            font-size: 14px;
            margin-bottom: 30px;
            display: flex;
            &-header {
              margin-bottom: 15px;
              width: 100%;
            }
            .block6 {
              margin-right: 6px;
            }
            &-main {
              display: flex;
              justify-content: space-between;
              width: 100%;
              .main-outer {
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 1px solid rgba(102, 86, 61, 0.38);
                margin-bottom: 15px;
                width: 236px;
                height: 105px;
                .descr-3 {
                  margin-top: 8px;
                  .head-3 {
                    position: relative;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 0 5px;
                    img {
                      margin-left: 3px;
                      &:hover ~ .rsp {
                        visibility: visible;
                      }
                    }
                    .rsp {
                      position: absolute;
                      color: #D15F45;
                      top: 40px;
                      left: 16px;
                      width: 230px;
                      visibility: hidden;
                      font-size: 14px;
                      opacity: 0.78;
                    }
                    .rspSecond {
                      position: absolute;
                      color: #D15F45;
                      top: 55px;
                      left: -9px;
                      width: 230px;
                      visibility: hidden;
                    }
                  }
                }

              }
              .copyoptionChecked {
                border: 1px solid #66563D;
              }
            }
          }
          &__block7 {
            padding-left: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            .first {
              display: flex;
              flex-direction: column;
              .exp {
                margin-bottom: 12px;
              }
              .in {
                border-radius: 12px;
                outline: none;
                border-style: none;
                border: 1px solid #66563D;
                opacity: 0.5;
                margin-bottom: 12px;
                font-size: 14px;
                width: 170px;
                height: 37px;
              }
              ::-webkit-input-placeholder {
                text-align: center;
              }
              .url {
                display: flex;
                justify-content: center;
                opacity: 0.5;
                font-size: 12px;
              }
            }
            .second {
              display: flex;
              flex-direction: column;
              margin-top: 29px;
              width: 170px;
              .uploadBtn {
                overflow: hidden;
                position: relative;
                width: 65%;
                padding: 11px 30px;
                border-radius: 12px;
                -webkit-box-shadow: 0 3px 5px rgba(0, 0, 0, .4);
                box-shadow: 0 3px 5px rgba(102, 86, 61, 0.6);
                background-color: #D15F45;
                cursor: pointer;
                margin-right: 15px;
                margin-bottom: 10px;
                &__text {
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
                  width: 170px;
                }
              }
              .se {
                opacity: 0.5;
                font-size: 12px;
                margin-left: 35px;
              }
            }
          }
        }

        .col-5 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 10px;
            .block1 {
              font-size: 22px;
            }
          }
          .block1-wrapper {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            .sub {
              display: flex;
              flex-direction: column;
              align-items: center;
              // border: 0.5px solid #bfb09d;
              // margin: 10px 43px 10px 0px;
              cursor: pointer;
              .title {
                // padding: 0 20px 10px 20px;
                white-space: nowrap;
                font-size: 14px;
              }
              // .sec_title {
              //     padding: 10px 0 10px 10px;
              // }
              // .four_title {
              //     padding: 10px 9px 10px 10px;
              // }
              img {
                margin: 10px 30px;
              }
              textare {
                display: none;
              }
              .textarea_vis {
                font-family: MyriadPro;
                display: block;
                border-radius: 8px;
                border-style: ridge;
                padding: 20px 12px;
                margin-left: 10px;
                resize: none;
                outline: none;
                width: 105px;
                margin-top: 6px;
              }
              // &:hover {
              //     box-shadow: 0 0 4px #66563D;
              // }
            }
            .sub_unbord {
              // border: none;
              .title {
                .four_title {
                  margin-bottom: 32px;
                }
              }
              &:hover {
                box-shadow: none;
              }
            }
          }
        }

        .col-6 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 14px;
            .block1 {
              margin-right: 6px;
              font-size: 22px;
            }
          }
          &__block2 {
            display: flex;
            justify-content: space-around;
            .sub {
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              img {
                width: 44px;
                height: 23px;
              }
            }
          }
        }

        .col-7 {
          margin-bottom: 30px;
          &__block1 {
            margin-bottom: 30px;
            .copytone {
              margin-right: 6px;
              font-size: 22px;
            }
          }
          .voiceChekers {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            width: 100%;
            padding-left: 10px;
            margin-top: 20px;
            max-height: 158px;
            .inner-option {
              display: flex;
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
                outline: none;
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
                    bottom: -11px;
                    left: 0px;
                    transform: rotate(40deg);
                  }
                  &::after {
                    content: "";
                    position: absolute;
                    width: 4px;
                    height: 13px;
                    background-color: #66563D;
                    bottom: -13;
                    right: 5px;
                    transform: rotate(40deg);
                  }
                }
              }
            }
          }
        }

        .col-8 {
          margin-bottom: 40px;
          &__block1 {
            display: flex;
            margin-bottom: 20px;
            .block1 {
              font-size: 22px;
              margin-right: 20px;
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
              filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#eeeeee', endColorstr='#cccccc',GradientType=0 );
              box-shadow: 0 0 3px rgba(102, 86, 61, 0.6);
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
          &__block3 {
            display: flex;
            justify-content: space-between;
            .designChekers {
              display: flex;
              flex-wrap: wrap;
              width: 100%;
              padding-left: 10px;
              margin-top: 20px;
              max-height: 158px;
              justify-content: space-between;
              .desinner-option {
                display: flex;
                width: 16%;
                flex-direction: row;
                margin-bottom: 20px;
                align-items: center;
                .designTitle {
                  padding-left: 10px;
                }
                input {
                  width: 54px;
                  height: 28px;
                  margin-left: 10px;
                  border: 1px solid rgba(102, 86, 61, 0.7);
                  border-radius: 5px;
                  font-family: MyriadPro;
                  outline: none;
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
                      bottom: -11px;
                      left: 0px;
                      transform: rotate(40deg);
                    }
                    &::after {
                      content: "";
                      position: absolute;
                      width: 4px;
                      height: 13px;
                      background-color: #66563D;
                      bottom: -13;
                      right: 5px;
                      transform: rotate(40deg);
                    }
                  }
                }
              }
            }
          }
        }

        .col-9 {
          margin-bottom: 30px;
          &__block1 {
            margin-right: 47px;
            display: flex;
            margin-bottom: 20px;
            .block1 {
              font-size: 22px;
              margin-right: 45px;
              padding-right: 8px;
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
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#eeeeee', endColorstr='#cccccc',GradientType=0 );
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
                width: 64%;
              }
              .no {
                width: 45%;
              }
            }
          }
          &__block2 {
            display: flex;
            flex-direction: column;
            max-height: 125px;
            margin-bottom: 20px;
            .sub {
              display: flex;
              padding-left: 10px;
              margin-bottom: 10px;
              &__choose {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                .title1 {
                  width: 25%;
                }
                input {
                  width: 75%;
                  border-radius: 10px;
                  outline: none;
                  border: 1px solid #66563D;
                  height: 24px;
                  padding: 0 10px;
                }
              }
            }
          }
          &__block3 {
            margin-bottom: 77px;
            .bot {
              .buttonWrap {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
                position: relative;
                input {
                  background-color: #D15F45;
                  outline: none;
                  box-shadow: 0 3px 5px rgba(102, 86, 61, 0.6);
                  color: #fff;
                  width: 164px;
                  height: 40px;
                  border: none;
                  border-radius: 10px;
                  margin-top: 15px;
                  cursor: pointer;
                }
                .foot {
                  opacity: 0.67;
                  font-size: 12px;
                  white-space: nowrap;
                  position: absolute;
                  left: -17px;
                  bottom: 75px;
                }
              }
            }
          }
        }
        .star {
          color: red;
        }

        .empty-check {
          border: 1px solid #bfb09d;
          border-radius: 18px;
          width: 16px;
          height: 16px;
          margin: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .check-sel {
          width: 12px;
          height: 12px;
          border-radius: 12px;
          background-color: #67563D;
          border-radius: 14px;
        }

        .activeType {
          background-color: #66563D;
          opacity: 0.67;
          color: #fff;
        }
      }
    }
    .color{
      opacity: 1;
    }

    .orderInfoCopy {
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

  .copydetails {
    padding-bottom: 0;
    flex-direction: column;
    margin-bottom: 38px;
    &__quote {
      margin-top: 30px;
      width: 100%;
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
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
          width: 18px;
          height: 18px;
          margin-top: 5px;
          border: 1px solid #66563D;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          .checker {
            width: 67%;
            height: 67%;
            border-radius: 69%;
          }
          .checkerChecked {
            background-color: #66563D;
          }
        }
        &__text {
          width: 88%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          .head {
            margin: 5px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .insideText {
            font-size: 12px;
            margin-top: 0;
            text-align: center;
          }
        }
      }
    }
  }

  .inform-icon {
    margin-bottom: -4px;
    margin-left: -4px;
  }
  .sureOptions {
    display: flex;
    justify-content: space-between;
  }
  .in_block5_opac {
    opacity: 0.5;
  }

  .voiceChekers {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
    padding-left: 10px;
    margin-top: 20px;
    max-height: 158px;
    .inner-option {
      display: flex;
      width: 36.5%;
      flex-direction: row;
      margin-bottom: 20px;
      align-items: center;
      .seoadd1 {
        width: 49.5%;
      }
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
        outline: none;
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
            bottom: -11px;
            left: 0px;
            transform: rotate(40deg);
          }
          &::after {
            content: "";
            position: absolute;
            width: 4px;
            height: 13px;
            background-color: #66563D;
            bottom: -13;
            right: 5px;
            transform: rotate(40deg);
          }
        }
      }
    }
    .additionalInn {
      width: 68.5%;
    }
  }

  .seoadd {
    margin-top: 4px;
    width: 62%;
    margin-left: 30px;
  }

  .copyoptionChecked {
    transition: all 0.3s;
    box-shadow: 0 0 7px rgba(102, 86, 61, 0.6);
    border: 1px solid #66563D;
  }

</style>
