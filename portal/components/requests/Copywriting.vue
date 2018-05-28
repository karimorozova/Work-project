<template lang="pug">
    .copywritingWrapper
        .copywritingContainer
            form.copywriting-form
                .col-1
                    .col-1__block1
                        span.block1 1. Type
                        span.star *
                    .col-1__block2
                        .col-1__block2-sub1(v-for="(item, index) in col1_block2" @click="switchBg(index)" :class="{active: item.active}")
                            span.sub1 {{ item.title }}
                            img(v-if="item.active" :src="item.imageN")
                            img(v-else :src="item.imageW")
                .col-2
                    .col-2__block1
                        span.block1 2. Select a Language
                    .col-2__block2
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
                .col-3
                    .col-3__block1
                        span.block1 3. Package
                        span.star *
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
                        span.block1 4. General Brief
                    .col-4__block2
                        .descr
                            .head
                                span.block2 Description
                                span.star *
                                span.notice Please give a brief description of the project in as match detail as possible.
                        .inner-ta
                            textarea.ta-block2
                    .col-4__block3
                        .descr-1
                            .head-1
                                span.block3 Targeted Audience
                                span.notice-1 What kind of audience will read this article?
                        .in-block3
                            input
                    .col-4__block4
                        span.block4 Suggested title
                        .in-block4
                            input
                    .col-4__block5
                        .descr-2
                            .head-2
                                span.block5 Topics to mention or not mention
                                span.notice-2 What main topics should or should not be discussed in the article? Please be as detailed as possible.
                                span.star *
                        .wrap
                            .in-block5
                                textarea
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
                            input.in(type="text" placeholder="www.exampleexample.com" value="")
                            span.url URL
                        .second
                            button.but(@click.prevent="") Upload
                            span.se Upload Reference File
                .col-5
                    .col-5__block1
                        span.block1 5. Structure to Include
                    .block1-wrapper
                        .sub(v-for="(item, index) in col5_block1" @click="switchStructure(index)" :class="[{choice: item.choice}, {sub_unbord: index == 3}]")
                            .selected
                                .empty-choice(v-if="!item.choice")
                                .choice-sel(v-else)
                            span.title(:class="[{sec_title: index == 1}, {four_title: index == 3}]") {{ item.title }}
                            img(:src="item.image" v-if="index != 3")
                            input(v-if="index == 3" :class="{inp_vis: true}")
                .col-6
                    .col-6__block1
                        span.block1 6. Style
                        span.star *
                    .col-6__block2
                        .sub(v-for="(item, index) in col6__block1" @click="switchBlock6(index)" :class="{choice: item.choice}")
                            .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                            img(:src="item.image")
                .col-7
                    .col-7__block1
                        span.block1 7. Tone of voice
                        span.star *
                    .col-7__block2
                        .sub(v-for="(item, index) in col7__block2" @click="switchBlock7(index)" :class="{choice: item.choice}")
                            .selected
                                .empty-choice(v-if="!item.choice")
                                .choice-sel(v-else)
                            .subspan
                                span.title(:class="{title8: index == 8}") {{ item.title }}
                            input(v-if="index == 8" :class="{inp_vis: true}")
                .col-8
                    .col-8__block1
                        span.block1 8. Design
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
                            input(v-if="index == 2" :class="{lastInp: true}")
                .col-9
                    .col-9__block1
                        span.block1 9. SEO
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
                                input
                            

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
              p.choice &nbsp; <template v-for="language of selectLang" >{{ language.lang }},  </template> <template v-if="selectLang == 0">Select</template>
            .orderInfoCopy__summary-package
              span 4
              label PACKAGE: 
              p.choice {{ packageSelect }}
            .orderInfoCopy__summary-deadline
              label SUGGESTED DEADLINE
              p.choice
</template>

<script>
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
          title: "Up to 199",
          image: require("../../assets/images/UP-TO-199-icon.png"),
          choice: false
        },
        {
          title: "200-399",
          image: require("../../assets/images/200-399-icon.png"),
          choice: true
        },
        {
          title: "400-599",
          image: require("../../assets/images/400-599-icon.png"),
          choice: false
        },
        {
          title: "600-999",
          image: require("../../assets/images/600-999-icon.png"),
          choice: false
        },
        {
          title: "1000-1400",
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
          image: require("../../assets/images/reviews-icon.png"),
          choice: false
        }
      ],
      col6__block1: [
        {
          image: require("../../assets/images/US-icon.png"),
          choice: true
        },
        {
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
          choice: false
        }
      ],
      langDrop: false,
      languages: [],
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
          choice: false
        }
      ],
      col9__block2: [
        {
          title1: "META description",
          title2: "Keywords",
          choice: true
        },
        {
          title1: "Keyword density",
          choice: false
        },
        {
          title1: "META description",
          choice: false
        }
      ],
      slide: "0px",
      typeSelect: "Article",
      packageSelect: "200-399",
      sure: false
    };
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
          this.packageSelect = item.title;
        } else {
          item.choice = false;
        }
      });
    },
    switchPoints(index) {
      this.col4_block6.forEach((item, i) => {
        if (index == i) {
          item.choice = true;
        } else {
          item.choice = false;
        }
      });
    },
    switchStructure(index) {
      this.col5_block1.forEach((item, i) => {
        if (index == i) {
          item.choice = true;
        } else {
          item.choice = false;
        }
      });
    },
    switchBlock6(index) {
      this.col6__block1.forEach((item, i) => {
        if (index == i) {
          item.choice = true;
        } else {
          item.choice = false;
        }
      });
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
    }
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
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  mounted() {
    this.getLanguages();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/clientrequest/copywriting.scss";
</style>
