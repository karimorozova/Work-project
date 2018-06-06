<template lang="pug">
    .copywritingWrapper
        .container
            form.copywriting-form(@submit.prevent="checkForm")
                .col-1
                    .col-1__block0
                      .lblock
                        .name
                          label.asterisk PROJECT NAME: 
                          input(:class="classes('projectName')" type="text" placeholder="Project Name" v-model="projectName")
                      .rblock
                        .name
                          label.asterisk DEADLINE:
                        .deadline
                          .picker
                            datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                          .datepick(@click='openPicker')
                            img(src='../../assets/images/calendar.png')
                    .col-1__block1
                        span.block1 TYPE
                    .col-1__block2
                        .col-1__block2-sub1(v-for="(item, index) in col1_block2" @click="switchBg(index)" :class="{activeType: item.active}")
                          span.sub1 {{ item.title }}
                          img(v-if="item.active" :src="item.imageN")
                          img(v-else :src="item.imageW")
                .col-2
                    .col-2__block1
                        span.block1 SELECT A LANGUAGE
                    .col-2__block2
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
                        .col-3__block2-sub(v-for="(item, index) in col3_block2" @click="switchChoice(index)" :class="{choice: item.choice}")
                            .checkTitle
                                .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                                span.sub1 {{ item.title }}
                            img(:src="item.image")

                .col-4
                    .col-4__block1
                        span.block1 GENERAL BRIEF
                    .col-4__block2
                        .descr
                            .head
                                span.block2 Description
                                span.star *
                                span.notice Please give a brief description of the project in as match detail as possible.
                        .inner-ta
                            textarea.ta-block2(v-model="genBrief.briefDescr")
                    .col-4__block3
                        .descr-1
                            .head-1
                                span.block3 Targeted Audience
                                span.notice-1 What kind of audience will read this article?
                        .in-block3
                            input(v-model="genBrief.briefAudience")
                    .col-4__block4
                        span.block4 Suggested title
                        .in-block4
                            input(v-model="genBrief.briefTitle")
                    .col-4__block5
                        .descr-2
                            .head-2
                                span.block5 Topics to mention or not mention
                                span.notice-2 What main topics should or should not be discussed in the article? Please be as detailed as possible.
                                span.star *
                        .wrap
                            .in-block5
                                textarea(v-model="genBrief.briefTopics")
                            .block5-delim
                                span.delim or
                            .block5-but
                                button(@click.prevent="iamNotSure") I am not sure
                    .col-4__block6(v-if="sure")
                        .col-4__block6-header
                            span.block6 If you are unsure of what points the article should cover, please select one of the following:
                            span.star *
                        .col-4__block6-main(v-for="(item, index) in col4_block6" @click="switchPoints(index)" :class="{choice: item.choice}")
                            .main-outer
                                .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                                .descr-3
                                    .head-3
                                        spna.normsp {{ item.title2 }}
                                        span.rsp(:class="{rspSecond: index == 1}") {{ item.title1 }}
                    .col-4__block7
                        .first
                            span.exp Examples
                            input.in(type="text" placeholder="www.example.com" value="" v-model="genBrief.briefExample")
                            span.url URL
                        .second
                            .uploadBtn
                              .uploadBtn__text Upload
                              input(name="refFiles" type="file" @change='copyChangeRefFiles')
                            span.se Upload Reference File
                .col-5
                    .col-5__block1
                        span.block1 STRUCTURE TO INCLUDE
                    .block1-wrapper
                      .sub(v-for="(item, index) in col5_block1" @click="switchStructure(index)" :class="[{choice: item.choice}, {sub_unbord: index == 3}]")
                          .selected
                              .empty-choice(v-if="!item.choice")
                              .choice-sel(v-else)
                          span.title(:class="[{sec_title: index == 1}, {four_title: index == 3}]") {{ item.title }}
                          img(:src="item.image" v-if="index != 3")
                          input(v-if="index == 3" :class="{inp_vis: true}" v-model="item.input" @click.prevent="switchStructure(index)")
                .col-6
                    .col-6__block1
                        span.block1 STYLE
                        span.star *
                    .col-6__block2
                        .sub(v-for="(item, index) in col6__block1" @click="switchBlock6(index)" :class="{choice: item.choice}")
                            .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                            img(:src="item.image")
                .col-7
                    .col-7__block1
                        span.block1 TONE OF VOICE
                        span.star *
                    .col-7__block2
                        .sub(v-for="(item, index) in col7__block2" :class="{choice: item.choice}")
                            .selected(@click="switchBlock7(index)")
                                .empty-choice(v-if="!item.choice")
                                .choice-sel(v-else)
                            .subspan
                                span.title(:class="{title8: index == 8}") {{ item.title }}
                            input(v-if="index == 8" :class="{inp_vis: true}" v-model="item.input")
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
                        .sub(v-for="(item, index) in col8__block3" @click="switchBlock8(index)" :class="{choice: item.choice}")
                            .selected
                                .empty-choice(v-if="!item.choice")
                                .choice-sel(v-else)
                            span.title {{ item.title }}
                            input(v-if="index == 2" :class="{lastInp: true}" v-model="item.input")
                .col-9
                    .col-9__block1
                        span.block1 SEO
                        .subject-toggle2.toggle(@click="toggleSub2" :class="{positive: seoToggle}")
                            .toggler
                            .yes 
                                span YES
                            .no 
                                span NO
                    .col-9__block2(v-if="seoToggle")
                        .sub(v-for="(item, index) in col9__block2" @click="switchBlock9(index)" :class="{choice: item.choice}")
                            .sub__choose
                                .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                                span.title1 {{ item.title1 }}
                            .sub__input    
                                .selected(v-if="item.title2" :class="[{inv_block: index == 1}, {inv_block: index == 2}]")
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                                span.title2(v-if="item.title2" :class="[{inv_block: index == 1}, {inv_block: index == 2}]") {{ item.title2 }}                                
                                input(v-model="item.input")
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
                            

        .orderInfoCopy(:style="{transform: slide}")
          .orderInfoCopy__title
            h3 YOUR ORDER
          .orderInfoCopy__summary
            .orderInfo__summary-service
              span 1
              label SERVICE: 
              p.choice {{ service }}
            .orderInfoCopy__summary-type
              span 2
              label TYPE:
              p.choice {{ typeSelect }}
            .orderInfoCopy__summary-language
              span 3
              label LANGUAGE:
              p.choice &nbsp;
                template(v-for="language of selectLang") {{ language.lang }},
                template(v-if="selectLang == 0") Select
            .orderInfoCopy__summary-package
              span 4
              label PACKAGE: 
              p.choice {{ genBrief.package }}
            .orderInfoCopy__summary-deadline
              label SUGGESTED DEADLINE
              p.choice {{ deadlineDate }}
</template>

<script>
import moment from "moment";
import Datepicker from "../Datepicker.vue";
import NewProject from "../NewProject.vue";

export default {
  data() {
    return {
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
          choice: false
        },
        {
          title: "0-400",
          image: require("../../assets/images/200-399-icon.png"),
          choice: true
        },
        {
          title: "0-600",
          image: require("../../assets/images/400-599-icon.png"),
          choice: false
        },
        {
          title: "0-1000",
          image: require("../../assets/images/600-999-icon.png"),
          choice: false
        },
        {
          title: "0-1400",
          image: require("../../assets/images/1000-1400-icon.png"),
          choice: false
        }
      ],
      col4_block6: [
        {
          title1:
            "You give the copywriter freedom to write article as they please. You will only receive one round of edits if you think the article needs improvement.",
          title2: "Give the copywriter freedom",
          choice: true
        },
        {
          title1:
            "The copywriter will provide you with bullet points/topics to include in the article and\nyou can approve them beforehand.Please note:this comes at an additional cost",
          title2: "Request an outline from the copywriter",
          choice: false
        }
      ],
      col5_block1: [
        {
          title: "Sub-heading",
          image: require("../../assets/images/reviews-icon.png"),
          choice: true
        },
        {
          title: "Only Paragraphs",
          image: require("../../assets/images/reviews-icon.png"),
          choice: false
        },
        {
          title: "Bullet points",
          image: require("../../assets/images/reviews-icon.png"),
          choice: false
        },
        {
          title: "Others",
          input: "",
          image: require("../../assets/images/reviews-icon.png"),
          choice: false
        }
      ],
      col6__block1: [
        {
          title: "US",
          image: require("../../assets/images/US-icon.png"),
          choice: true
        },
        {
          title: "UK",
          image: require("../../assets/images/UK-icon.png"),
          choice: false
        }
      ],
      col7__block2: [
        {
          title: "Formal",
          choice: true
        },
        {
          title: "Informal",
          choice: false
        },
        {
          title: "Excited",
          choice: false
        },
        {
          title: "Straightforward",
          choice: false
        },
        {
          title: "Serious",
          choice: false
        },
        {
          title: "Relaxed",
          choice: false
        },
        {
          title: "Parsuasive",
          choice: false
        },
        {
          title: "Playful/Funny",
          choice: false
        },

        {
          title: "Other",
          input: "",
          choice: false
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
        package: "200-399",
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
          choice: true
        },
        {
          title: "Charts",
          choice: false
        },
        {
          title: "Other",
          input: "",
          choice: false
        }
      ],
      col9__block2: [
        {
          title1: "META description",
          title2: "Keywords",
          input: "",
          choice: true
        },
        {
          title1: "Keyword density",
          input: "",
          choice: false
        },
        {
          title1: "Other",
          input: "",
          choice: false
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
      deadlineSelect: ''
    }
  },
  methods: {
    iamNotSure() {
        this.sure = !this.sure;
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
    switchChoice(index) {
      this.col3_block2.forEach((item, i) => {
        if (index == i) {
          item.choice = true;
          this.genBrief.package = item.title;
        } else {
          item.choice = false;
        }
      });
    },
    switchPoints(index) {
      this.col4_block6.forEach((item, i) => {
        if (index == i) {
          item.choice = true;
          this.genBrief.briefSure = item.title2;
        } else {
          item.choice = false;
        }
      });
    },
    switchStructure(index) {
      this.col5_block1.forEach((item, i) => {
        if (index == i) {
          item.choice = !item.choice;
        }
      })
    },
    switchBlock6(index) {
      let style = this.col6__block1;      
      if (style[index].choice) {
        this.styleSelect = style[index].title;
        return true
      } else {
        style.forEach(item => {
          item.choice = !item.choice;
          if(item.choice) {
            this.genBrief.style = item.title
          }
        })
      }
    },
    switchBlock7(index) {
      this.col7__block2.forEach((item, i) => {
        if (index == i) {
          item.choice = !item.choice;
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
    },
    toggleSub2() {
      this.seoToggle = !this.seoToggle;
    },
    switchBlock8(index) {
      this.col8__block3.forEach((item, i) => {
        if (index == i) {
          item.choice = !item.choice;
        }
      });
    },
    switchBlock9(index) {
      this.col9__block2.forEach((item, i) => {
        if (index == i) {
          item.choice = !item.choice;
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
      if(!this.toneSelect.length) errors.push("Please, choose Tone of voice");
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
    classes(err) {
      for(let i = 0; i < this.errors.length; i++ ) {
        if(this.errors[i].title == err) {
          return 'errorActive'
        }
      }
    },
    openPicker() {
      this.$refs.programaticOpen.showCalendar();
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
        if(item.choice) {
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
        if(item.choice) {
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
      this.col7__block2.forEach((item) => {
        if(item.choice) {
          if (item.title == "Other") {
            result.push(item.input)
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
        if(item.choice) {
          let seo = item.title1 + ": " + item.input;
          result.push(seo)
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

<style lang="scss" scoped>
@import "../../assets/styles/clientrequest/copywriting.scss";

// .copydetails {
//     padding-bottom: 0;
//     flex-direction: column;
//     margin-bottom: 38px;
//     &__quote {
//       margin-top: 30px;
//       width: 100%;
//       margin-bottom: 40px;
//       .send, .start {
//         display: flex;
//         align-items: center;
//         border: 1px solid #66563D;        
//         padding-left: 10px;
//         padding-right: 10px;
//         margin: 10px;
//         margin-right: 0;
//         cursor: pointer;
//         &__check {
//           width: 18px;
//           height: 18px;
//           margin-right: 20px;
//           border: 1px solid #66563D;
//           border-radius: 50%;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           .checker {
//             width: 78%;
//             height: 78%;
//             border-radius: 50%;
//           }
//           .checkerChecked {
//             background-color: #66563D;
//           }
//         }
//         &__text {
//           width: 88%;
//           .head {
//             margin-bottom: 5px;
//             font-size: 14px;
//           }
//           .insideText {
//             font-size: 12px;
//             margin-top: 0;
//           }
//         }
//       }
//       .copyoptionChecked {
//         box-shadow: 0 0 7px rgba(0, 0, 0, .6);
//       }

//     }
//   }
</style>
