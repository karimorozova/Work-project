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
                            img(src='../../assets/images/calendar.png')
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
                                          .select__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == langSelect }")
                                              template(v-for='dialect in language.dialects')
                                                  .pair.pair_dialect(v-if="copyLangs.indexOf(dialect.symbol) != -1" @click="chooseDialect(dialect)")
                                                      img(:src="'/flags/' + dialect.symbol + '.png'")                  
                                                      span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}
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
                                img.inform-icon(src="../../assets/images/info-icon.png" @click="descrTooltip")
                                span.notice(:class="{notice_vis: boolForDescrTool}") {{ descriptionToolTip }}
                        .inner-ta
                            textarea.ta-block2(rows="1" @keyup="autoGrow()" v-model="genBrief.briefDescr") {{ genBrief.briefDescr }}
                    .col-4__block3
                        .descr-1
                            .head-1
                                span.block3 Targeted Audience
                                span.notice-1(:class="{notice_1_vis: boolForTargTool}") {{ targetAudienceToolTip }}
                                img.inform-icon(src="../../assets/images/info-icon.png" @click="targTooltip")
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
                                img.inform-icon(src="../../assets/images/info-icon.png" @click="topicsTooltip")
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
                                              img.inform-icon(src="../../assets/images/info-icon.png")
                                              span.rsp(:class="{rspSecond: true}") You give the copywriter freedom to write article as they please. You will only receive one round of edits if you think the article needs improvement.
                                  .main-outer(:class="{copyoptionChecked: requestOption}" @click="topicsRequest")
                                      .selected
                                          .empty-check
                                              .check-sel(v-if="requestOption")
                                      .descr-3
                                          .head-3
                                              span.normsp Request an outline from the copywriter
                                                img.inform-icon(src="../../assets/images/info-icon.png")
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
        .orderInfoCopy(:style="{transform: slide}")
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
import Datepicker from "../Datepicker.vue";
import ClickOutside from 'vue-click-outside';

export default {
  data() {
    return {
      error: false,
      col1_block2: [
        {
          title: "Article",
          imageN: require("../../assets/images/article-icon.png"),
          imageW: require("../../assets/images/article-icon-selected.png"),
          active: true
        },
        {
          title: "Blog Post",
          imageN: require("../../assets/images/blog-icon.png"),
          imageW: require("../../assets/images/blog-icon-selected.png"),
          active: false
        },
        {
          title: "Review",
          imageN: require("../../assets/images/reviews-icon.png"),
          imageW: require("../../assets/images/reviews-icon-selected.png"),
          active: false
        }
      ],
      col3_block2: [
        {
          title: "0-200",
          image: require("../../assets/images/UP-TO-199-icon.png"),
          check: false
        },
        {
          title: "0-400",
          image: require("../../assets/images/200-399-icon.png"),
          check: true
        },
        {
          title: "0-600",
          image: require("../../assets/images/400-599-icon.png"),
          check: false
        },
        {
          title: "0-1000",
          image: require("../../assets/images/600-999-icon.png"),
          check: false
        },
        {
          title: "0-1400",
          image: require("../../assets/images/1000-1400-icon.png"),
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
          image: require("../../assets/images/unselected-checkbox.png"),
          image1: require("../../assets/images/article-icon.png"),
          check: true
        },
        {
          title: "Only Paragraphs",
          image: require("../../assets/images/unselected-checkbox.png"),
          image1: require("../../assets/images/article-icon.png"),
          check: false
        },
        {
          title: "Bullet points",
          image: require("../../assets/images/unselected-checkbox.png"),
          image1: require("../../assets/images/article-icon.png"),
          check: false
        },
        {
          title: "Others",
          input: "",
          image: require("../../assets/images/unselected-checkbox.png"),
          image1: require("../../assets/images/article-icon.png"),
          check: false
        }
      ],
      col6__block1: [
        {
          title: "US",
          image: require("../../assets/images/US-icon.png"),
          check: true
        },
        {
          title: "UK",
          image: require("../../assets/images/UK-icon.png"),
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
        if(!item.dialects) {
          item.check = false
        } else {
          item.dialects.map(ditem => {
            ditem.check = false
          })
        }
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
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  mounted() {
    this.getLanguages();
    this.getServiceLangs()
    this.getServices();
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/clientrequest/copywriting.scss";

</style>
