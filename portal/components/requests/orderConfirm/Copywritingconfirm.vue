<template lang="pug">
    .confirmation
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PROJECT NAME:
                    span.itemData {{ orderDetails.projectName }}
            .allDetails
                .allDetails__item
                    span.itemName SUGGESTED DEADLINE:
                    span.itemData {{ deadlineSelect }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName TYPE:
                    span.itemData {{ orderDetails.type }}
            .allDetails
                .allDetails__item
                    span.itemName LANGUAGE(S):
                    span.itemData {{ targetLangs }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PACKAGE:
                    span.itemData {{ orderDetails.packageSize.size }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName BRIEF:
                        .inner-w
                            span.itemNameSm DESCRIPTION:
                            span.itemData {{ orderDetails.genbrief.Description }}
                        .inner-w
                            span.itemNameSm AUDIENCE:
                            span.itemData {{ orderDetails.genbrief['Targeted Audience'] }}
                        .inner-w
                            span.itemNameSm TITLE:
                            span.itemData {{ orderDetails.genbrief['Suggested title'] }}
                        .inner-w
                            span.itemNameSm TOPICS:
                            span.itemData {{ orderDetails.genbrief.Topics }}
                        .inner-w
                            span.itemNameSm URL:
                            span.itemData {{ orderDetails.genbrief.Examples }}
                        .inner-w
                            span.itemNameSm REFERENCE FILE(S):
                            span.itemData {{ refFilesList }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName STRUCTURE:
                    span.itemData {{ structures }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName STYLE:
                    span.itemData {{ orderDetails.style }}
            .allDetails
                .allDetails__item
                    span.itemName TONE OF VOICE:
                    span.itemData {{ tones }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName DESIGN:
                    span.itemData {{ design }}
            .allDetails
                .allDetails__item
                    span.itemName SEO:
                    span.itemData {{ metaExist }}
                    span.itemNameSm KEYWORDS:
                    span.itemData {{ orderDetails['seo-Keywords'] }}
                    span.itemNameSm KEYWORD DENSITY:
                    span.itemData {{ orderDetails[['seo-Keyword density']] }}
                    span.itemNameSm OTHER:
                    span.itemData {{ orderDetails['seo-Other'] }}
        .copyconffoot
            span.itemDataExSm(v-if="orderDetails.requestType == 'QUOTE'") A QUOTE WILL BE SENT SHOURTLY 
            span.itemDataExSm(v-else) THE PROJECT WILL BEGIN SHOURTLY                 
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
    // data() {
        // return {
        //     orderDetails: {
        //         quoteDecision: 'Send',
        //         genbrief: {
        //             Description: 'svsdvvwevvsvwsvsdvsdgsdv svsv wesdv wevwev wevvs dvsd sdvwev vs dv wevsdvsdv \nwevsv wvsvsvsdv sdvs\n s vsdvsdvsdvsesvsdvwe vw evw vwevvsdv',
        //             'Targeted Audience': ' dvs sd svd sdv svd sdvsvsdvsvxcv',
        //             'Suggested title': 'sdvsvsvsdvwevsdv s',
        //             Topics: 'ds;lkj dl ldbm;lk ;dfklbm; lk dkflkhfovui w;rlknliufhv ',
        //             Examples: 'www.ctc.er'
        //         },
        //         type: 'Blog Post',
        //         structure: 'Only Paragraphs',
        //         style: 'UK',
        //         packageSize: {
        //             name: 'Up to 200',
        //             size: '200',
        //             _id: '5c3c8990c9dbd6389ad1b3f9',
        //             __v: 0,
        //             isChecked: true
        //         },
        //         service: '5c3c8993c9dbd6389ad1b4cd',
        //         projectName: 'lkjdblskdjn',
        //         deadline: 'Wed Oct 09 2019 19:43:00 GMT+0300 (Москва, стандартное время)',
        //         targets: [
        //             {
        //             lang: 'Bosnian (Cyrillic)',
        //             icon: '/static/flags31x21pix/Bosnian[BS].png',
        //             symbol: 'BS',
        //             active: true,
        //             xtm: 'bs_BA_Cyrl',
        //             iso1: 'bs',
        //             iso2: 'bos',
        //             children: false,
        //             parent: '',
        //             china: '',
        //             crud: false,
        //             xtrf: '',
        //             direction: 'in',
        //             check: false,
        //             _id: '5c3c8992c9dbd6389ad1b476',
        //             createdAt: '2019-01-14T13:07:30.171Z',
        //             __v: 0
        //             }
        //         ],
        //         refFiles: [{name: "refdfsdf.sdf"},{name: "sdfsfss.svsdv"}],
        //         tones: [
        //             'Formal',
        //             'Payful/Funny',
        //             'Relaxed'
        //         ],
        //         designs: [
        //             'Images',
        //             'Charts'
        //         ],
        //         isSeo: true,
        //         isMeta: true,
        //         'seo-Keywords': 'dbdfbdf',
        //         'seo-Keyword density': 'xcvbxcvbe eberbdb',
        //         'seo-Other': 'e be dvbderbeb'
        //         }
        // }
    // },
  computed: {
    ...mapGetters({
        orderDetails: "getOrderDetails"
    }),
    deadlineSelect() {
      let result = "";
      if (this.orderDetails.deadline) {
        result = moment(this.orderDetails.deadline).format("DD/MM/YYYY");
      }
      return result;
    },
    targetLangs() {
        let result = "";
        if(this.orderDetails.targets) {
            result = this.orderDetails.targets.reduce((acc, cur) => {
                acc += `${cur.lang} ;`;
                return acc;  
            }, "")
        }
        return result;
    },
    refFilesList() {
        let files = "";
        if(this.orderDetails.refFiles && this.orderDetails.refFiles.length) {
            files = Array.from(this.orderDetails.refFiles).reduce((prev, cur) => {
                return prev + `${cur.name}; `
            }, "")
        }
        return files;
    },
    tones() {
      let result = "";
      if(this.orderDetails.tones) {
        result = this.orderDetails.tones.reduce((acc, cur) => {
            acc += `${cur}; `;
            return acc;  
        }, "")
      }
      return result;
    },
    design() {
      let result = "";
      if (this.orderDetails.designs) {
        result = this.orderDetails.designs.reduce((acc, cur) => {
          return acc+= `; ${cur}`;  
        })
      }
      return result;
    },
    structures() {
      let result = "";
      if(this.orderDetails.structure) {
        result = this.orderDetails.structure;
      }
      return result;
    },
    metaExist() {
      let result ='';
      if(this.orderDetails.isMeta) {
        result = 'META description';
      }
      return result;
    }
  },
};
</script>

<style lang="scss" scoped>

.confirmation {
  color: #66573d;
  margin: 0 auto;
  width: 40%;
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
    margin-bottom: 40px;
    display: flex;
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
