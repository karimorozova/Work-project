<template lang="pug">
.vendor
  div(@click="close") Close
  div {{ vendorId }}

  .vendor__stats
    .stats__row.border-bottom
      .stats__colLong
        .stats__col-bigTitle RATE
        .stats__col-bigValue
          .stats__col-bigValue-num {{ item.rate }}
          .stats__col-bigValue-currency
            //span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          .stats__col-bigValue-image(v-if="item.benchmarkMargin < 0" )
            img(:src="icons.down")
          .stats__col-bigValue-image(v-if="item.benchmarkMargin > 0" )
            img(:src="icons.up")

    .stats__row
      .stats__col.border-right
        .stats__col-smallValue {{ vendorFinance.benchmark }}
        .stats__col-smallTitle B.MARK
      .stats__col
        .stats__col-smallValue {{ vendorFinance.benchmarkMargin }}
        .stats__col-smallTitle MARGIN

  .vendor__marks
    .marks__row
      .marks__title TQI
      .marks__value {{ item.tqi }}
    .marks__row
      .marks__title LQA1
      .marks__value {{ item.lqa1 }}
    .marks__row
      .marks__title LQA2
      .marks__value {{ item.lqa2 }}
    .marks__row
      .marks__title LQA3
      .marks__value {{ item.lqa3 }}
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    vendorId: { type: String },
    currentStep: { type: Object },
    currentIndustry: { type: Object },
  },
  data() {
    return {
      stepFinance: this.currentStep.finance.Price,
      vendorFinance: null,
      icons: {
        up: require("../../../assets/images/latest-version/up.png"),
        down: require("../../../assets/images/latest-version/down.png")
      },
      vendorDetails: null,
      item: {
        price: 1,
        total: 5,
        margin: 10,
        rate: 10,
        benchmarkMargin: 10,
        benchmark: 4,
        tqi: 0,
        lqa1: 1,
        lqa2: 1,
        lqa3: 1,
      }
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    async getVendorDetails() {

      const query = `${ this.currentStep.fullSourceLanguage._id }-${ this.currentStep.fullTargetLanguage._id }-${ this.currentStep.step._id}-${ this.currentStep.payablesUnit._id }-${ this.currentIndustry._id }`
      console.log(query)
     this.vendorFinance =  (await this.$http.post('/pm-manage/vendors-for-steps-details/', { vendorId: this.vendorId, query })).data

    },
    ...mapActions({
      //   alertToggle: "alertToggle",
      //   updateMatrix: "updateMatrix"
    }),
  },
  created() {
    this.getVendorDetails();
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject",
    }),
  },
  components: {},
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";
.vendor {
  padding: 25px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;

  &__stats {
    border: 1px solid $light-border;
    height: fit-content;
    margin-left: 10px;
    border-radius: 8px;
    margin-left: 20px;
  }
}

.marks {
  &__row {
    display: flex;
    margin-bottom: 2px;
  }

  &__title {
    color: #3333;
    width: 45px;
  }

  &__value {
    color: $dark-border;
  }
}

.stats {
   &__row {
     display: flex;
     justify-content: space-evenly;
   }

   &__col {
     display: flex;
     width: 80px;
     flex-direction: column;
     align-items: center;
     padding: 6px 0;
     text-align: center;

     &-bigTitle {
       font-size: 14px;
       color: #3333;
       font-family: Myriad600;
       letter-spacing: .2px;
     }

     &-bigValue {
       display: flex;
       align-items: center;

       &-currency {
         font-size: 14px;
         color: $dark-border;
         margin-left: 3px;
       }

       &-num {
         //font-family: 'Myriad600';
       }

       &-image {
         height: 16px;
         margin-left: 8px;
       }

     }

     &-smallTitle {
       color: #3333;
       font-size: 12px;
       margin-top: 1px;
       letter-spacing: .2px;
     }

     &-smallValue {
       color: $dark-border;
     }
   }

   &__colLong {
     height: fit-content;
     display: flex;
     justify-content: center;
     width: 100%;
     padding: 9px 8px 8px 8px;
     gap: 8px;
     align-items: center;
   }
 }
</style>
