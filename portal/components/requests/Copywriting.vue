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
                        span.block2 Language(s)
                    .col-2__block3
                        span.sub1 Select
                        img(src="../../assets/images/open-close-arrow-brown.png")
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
                                button(@click.prevent="") I am not sure
                    .col-4__block6
                        .col-4__block6-header
                            span.block6 If you are unsure of what points the article should cover, please select one of the following:
                            span.star *
                        .col-4__block6-main(v-for="(item, index) in col4_block6" @click="switchPoints(index)" :class="{choice: item.choice}")
                            .main-outer
                                .selected
                                    .empty-choice(v-if="!item.choice")
                                    .choice-sel(v-else)
                                spna.normsp {{ item.title2 }}
                                span.rsp {{ item.title1 }}
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
                .col-6
                    .col-6__block1
                        span.block1 6. Style *
                .col-7
                    .col-7__block1
                        span.block1 7. Tone of voice *
                .col-8
                    .col-8__block1
                        span.block1 8. Design
                .col-9
                    .col-9__block1
                        span.block1 9. SEO
        .orderInfoCopy
          .orderInfoCopy__title
            h3 YOUR ORDER
          .orderInfoCopy__summary
            .orderInfo__summary-service
              span 1
              label SERVICE: 
              p.choice
            .orderInfoCopy__summary-type
              span 2
              label TYPE:
              p W
            .orderInfoCopy__summary-language
              span 3
              label LANGUAGE:
            .orderInfoCopy__summary-package
              span 4
              label PACKAGE: 
              p.choice
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
          title1: "You give the copywriter freedom to write article as they please.\nYou will only receive one round of edits if you think the article needs improvement.",
          title2: "Give the copywriter freedom",
          choice: true
        },
        {
          title1: "The copywriter will provide you with bullet points/topics to include in the article and\nyou can approve them beforehand.Please note:this comes at an additional cost",
          title2: "Request an outline from the copywriter",
          choice: false
        }
      ]
    };
  },
  methods: {
      switchBg(index) {
          this.col1_block2.forEach((item, i) => {
              if (index == i) {
                  item.active = true;
              } else {
                  item.active = false;
              }
          });
      },
      switchChoice(index) {
          this.col3_block2.forEach((item, i) => {
              if (index == i) {
                  item.choice = true;
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
      }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/clientrequest/copywriting.scss";
</style>
