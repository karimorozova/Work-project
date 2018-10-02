<template lang="pug">
    .confirmation
        .head
            .head__title
                span.thanks THANK YOU FOR YOUR ORDER!
                span.summary SUMMARY BELOW:
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PROJECT NAME:
                    span.itemData {{ orderData.projectName }}
            .allDetails
                .allDetails__item
                    span.itemName SUGGESTED DEADLINE:
                    span.itemData {{ orderData.date }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName TYPE:
                    span.itemData {{ orderData.type }}
            .allDetails
                .allDetails__item
                    span.itemName LANGUAGE(S):
                    span.itemData {{ targetLangs }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PACKAGE:
                    span.itemData {{ orderData.package }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName BRIEF:
                        .inner-w
                            span.itemNameSm DESCRIPTION:
                            span.itemData {{ orderData.description }}
                        .inner-w
                            span.itemNameSm AUDIENCE:
                            span.itemData {{ orderData.audience }}
                        .inner-w
                            span.itemNameSm TITLE:
                            span.itemData {{ orderData.title }}
                        .inner-w
                            span.itemNameSm TOPICS:
                            span.itemData {{ topics }}
                        .inner-w
                            span.itemNameSm URL:
                            span.itemData {{ orderData.example }}
                        .inner-w
                            span.itemNameSm Reference File:
                            span.itemData {{ refFileName }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName STRUCTURE:
                    span.itemData {{ structures }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName STYLE:
                    span.itemData {{ orderData.style }}
            .allDetails
                .allDetails__item
                    span.itemName TONE OF VOICE:
                    span.itemData {{ tones }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName DESIGN:
                    span.itemData {{ degign }}
            .allDetails
                .allDetails__item
                    span.itemName SEO:
                    span.itemData {{ metaExist }}
                    span.itemNameSm KEYWORDS:
                    span.itemData {{ orderData.seo }}
                    span.itemNameSm KEYWORD DENSITY:
                    span.itemData {{ orderData.seo }}
                    span.itemNameSm OTHER:
                    span.itemData {{ orderData.seo }}
        .copyconffoot
            span.itemDataExSm(v-if="orderData.requestType == 'QUOTE'") A QUOTE WILL BE SENT SHOURTLY 
            span.itemDataExSm(v-else) THE PROJECT WILL BEGIN SHOURTLY 

                
</template>

<script>
import moment from "moment";

export default {
  props: {},
  data() {
    return {
      orderData: {}
    };
  },
  methods: {
    getData() {
      this.orderData = this.$store.state.orderDetails;
    }
  },
  computed: {
    deadlineSelect() {
      let result = "";
      if (this.orderData.date) {
        result = moment(this.orderData.date).format("DD/MM/YYYY");
      }
      return result;
    },
    sourceLang() {
      let result = "";
      if (this.orderData.sourceLanguage) {
        result = this.orderData.sourceLanguage.lang;
      }
      return result;
    },
    targetLangs() {
      let result = "";
      if (this.orderData.targetLanguages) {
        for (let i = 0; i < this.orderData.targetLanguages.length; i++) {
          result += this.orderData.targetLanguages[i].lang + "; ";
        }
      }
      return result;
    },
    detailFilesList() {
      let result = "";
      if (this.orderData.detailFiles) {
        for (let i = 0; i < this.orderData.detailFiles.length; i++) {
          result += this.orderData.detailFiles[i] + "; ";
        }
      }
      return result;
    },
    refFileName() {
      let result = "";
      if (this.orderData.refFiles) {
        result = this.orderData.refFiles;
      }
      return result;
    },
    tones() {
      let result = "";
      if (this.orderData.tone) {
        for (let i = 0; i < this.orderData.tone.length; i++) {
          result += this.orderData.tone[i] + ", ";
        }
      }
      return result;
    },
    degign() {
      let result = "";
      if (this.orderData.design) {
        for (let i = 0; i < this.orderData.design.length; i++) {
          result += this.orderData.design[i] + "; ";
        }
      }
      return result;
    },
    audience() {
      let result = "";
      if (this.orderData.audience) {
        result += this.orderData.audience;
      }
      return result;
    },
    topics() {
      let result = "";
      if (this.orderData.topics) {
        result = "To mention: " + this.orderData.topic;
      }
      return result;
    },
    structures() {
      let result = "";
      if(this.orderData.structure) {
        for(let i = 0; i < this.orderData.structure.length; i++) {
          result += this.orderData.structure[i] + ", " ;
        }
      }
      return result;
    },
    seo() {
      let result = '';
      if(this.orderData.seo) {
        for(let i = 0; i < this.orderData.seo.length; i++) {
          result += this.orderData.seo[i] + ", " ;
        }
      }
      return result;
    },
    metaExist() {
      let result ='';
      if(this.orderData.seo) {
        result = 'META description';
      }
      return result;
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style lang="scss">
.confirmation {
  color: #66573d;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .head {
    &__title {
      margin-bottom: 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 22px;
      .summary {
        font-size: 14px;
      }
    }
  }
  &__mainData {
    margin-bottom: 80px;
    display: flex;
    width: 60%;
    justify-content: space-between;
  }
}
.allDetails {
  width: 35%;
  &__item {
    display: flex;
    flex-direction: column;
  }
}
.itemName {
  font-size: 22px;
}
.itemNameSm {
  font-size: 14px;
  padding-right: 5px;
  &:last-child {
    margin-bottom: 0;
  }
}
.itemData {
  font-size: 14px;
  color: #D15F45;
}
.itemDataExSm {
  font-size: 12px;
  color: #aca6a5;
}
.copyconffoot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.inner-w {
  display: flex;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
