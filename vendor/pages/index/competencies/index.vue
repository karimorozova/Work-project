<template lang="pug">


  .competencies
    h1.competencies__title Competencies and Rates
    .competencies__body

      .competencies__row
        .competencies__col
          .competencies__select
            .competencies__input-title Source Language:
            SelectSingle.width-191(:selectedOption="currentSourceLang" :options="langs.map(({lang}) => lang)" @chooseOption="(e) => setSelectedOption(e, 'currentSourceLang')")
        .competencies__col
          .competencies__select
            .competencies__input-title Target Language:
            SelectSingle.width-191(:selectedOption="targetLangOrMotherTongue" :options="langs.map(({lang}) => lang)" @chooseOption="(e) => setSelectedOption(e, 'currentTargetLang')")

      .competencies__row(v-if="isEqualsMotherTongue()")
        .competencies__text
          p The target language you have selected isn't your mother tongue.
          p Please provide more details about your level of {{currentTargetLang}}, years of experience and other supporting information.
        .competencies__markdown
          WYSIWYG(@editorBlur="(e)=> setTargetLangDetails(e,'currentTargetLang')")

      .competencies__row
        .competencies__col
          .competencies__select
            .competencies__input-title Industry:
            SelectMulti.width-191(:selectedOptions="currentIndustry.map(({name})=> name)" :options="industries" @chooseOptions="setSelectedMultiOption")
        .competencies__col
          .competencies__select
            .competencies__input-title Step:
            SelectSingle.width-191(:selectedOption="currentStep" :options="step" @chooseOption="(e) => setSelectedOption(e, 'currentStep')")

      .competencies__row-column(v-for="{name} in currentIndustry")
        .competencies__text
          p Please provide more details about your experience in {{name}}
        .competencies__markdown
          WYSIWYG(@editorBlur="(e)=> setIndustriesDetails(e,name)")

      .competencies__row
        .competencies__input
          .competencies__input-title Rate per word:
          .competencies__rates
            input.width-191(v-model.lazy="rate" type="text")

      .competencies__row
        .competencies__text
        p Can you back translate ( {{targetLangOrMotherTongue}} >> {{currentSourceLang}} ) in {{currentIndustry.map(({name})=> name).join(', ')}}

      .competencies__row
        .competencies__reverse-translate

          .competencies__radio-button
            label.radio(for='opt1')
              input#opt1.hidden(type='radio' v-model="isReverseTranslate" :value="true")
              span.label
              | Yes
          .competencies__rates.reverse-rate(v-if="isReverseTranslate === true")
            span Rate:
            input(v-model="reverseRate" type="text")

        .competencies__reverse-translate
          .competencies__radio-button
            label.radio(for='opt2')
              input#opt2.hidden(type='radio' v-model="isReverseTranslate" :value="false")
              span.label
              | No

      .competencies__row
        .competencies__submit
          input(type="button" value="Submit" @click="checkError" )


</template>

<script>
import SelectSingle from "../../../components/overall/SelectSingle"
import SelectMulti from "../../../components/overall/SelectMulti"
import { mapGetters } from "vuex"
import WYSIWYG from "../../../components/overall/WYSIWYG"

export default {
  data() {
    return {
      step: [ 'Translation', 'Copywriting' ],
      currentSourceLang: '',
      currentTargetLang: '',
      currentIndustry: [],
      currentStep: '',
      industriesDetails: {},
      targetLangDetails: {},
      isReverseTranslate: false,
      rate: (0).toFixed(4),
      reverseRate: (0).toFixed(4),
      errors: []
    }
  },
  watch: {
    rate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex,'').replace(',','.') ) || 0
      this.rate = (+value).toFixed(4)
    },
    reverseRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex,'').replace(',','.') ) || 0
      this.reverseRate = (+value).toFixed(4)
    }
  },
  methods: {
    setSelectedOption({ option }, value) {
      this[value] = option
    },
    setSelectedMultiOption({option}){
      const index = this.currentIndustry.findIndex(({name}) => option.name === name)
      if (index !== -1) {
        this.currentIndustry.splice(index, 1)
      }else {
        if (this.currentIndustry.length >= 5 ) return
        this.currentIndustry.push(option)
      }
    },
    setTargetLangDetails ({ data }, name) {
      this.targetLangDetails[name] = data
    },
    setIndustriesDetails({ data }, name) {
      this.industriesDetails[name] = data
    },
    isEqualsMotherTongue() {
      return this.currentTargetLang.length > 0 && this.currentTargetLang !== this.motherTongue
    },
    isNormalRate(rate) {
      const regex = /^\d+\.\d{1,10}$/
      return regex.test(rate)
    },
    checkError() {
      if (this.currentSourceLang === this.currentTargetLang) this.errors.push('')
      if (this.currentSourceLang.length > 0) this.errors.push('')
      if (this.currentTargetLang.length > 0) this.errors.push('')
      if (this.currentIndustry.length > 0) this.errors.push('')
      if (!this.isNormalRate(this.rate)) this.errors.push('')
      if (this.isReverseTranslate === true && !this.isNormalRate(this.reverseRate)) console.log('errro')
      if (this.currentStep.length > 0) this.errors.push('')
      this.submitForm()
    },
    submitForm() {
    }
  },
  computed: {
    ...mapGetters({
      langs: 'getLangs',
      industries: 'getIndustries',
      vendor: "getVendor"
    }),
    motherTongue: function () {
      return this.vendor.native ? this.vendor.native.lang : ''
    },
    targetLangOrMotherTongue: function () {
      return this.currentTargetLang ? this.currentTargetLang : this.motherTongue
    }
  },
  components: {
    SelectSingle,
    SelectMulti,
	  WYSIWYG
  }
}
</script>

<style lang="scss" scoped>
.competencies {
  padding: 30px;
  width: 1040px;
  color: #67573e;
  font-family: Myriad400;

  p {
    margin: 0;
  }

  &__title {
    font-size: 22px;
  }

  &__input-title {
    margin-bottom: 5px;
  }

  &__body {
    padding: 20px 20px 0.1px 20px;
    box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  &__row-column {
    margin-bottom: 20px;
  }

  &__select {
    margin-right: 40px;
  }
  &__text {
    margin-bottom: 5px;
  }
  &__markdown {
    max-width: 588px;
  }

  &__rates {
    input {
      padding: 7px 10px;
      border: 1px solid #66563D;
      color: #66563D;
      border-radius: 7px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  }

  &__reverse-translate {
    display: flex;
    width: 191px;
    margin-right: 40px;

    .reverse-rate {
      display: flex;
      align-items: center;
      width: 130px;
      margin-left: 10px;

      span {
        margin-right: 5px;
      }
    }
  }

  &__radio-button {
    display: flex;
    align-items: center;
  }

  &__submit {
    display: flex;
    justify-content: center;

    input {
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 34px;
      color: #fff;
      font-size: 14px;
      border-radius: 7px;
      background-color: #d15f45;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;
    }
  }

  .width-191 {
    width: 191px;
  }
  .radio {
    position: relative;
    cursor: pointer;
    line-height: 20px;
    font-size: 14px;
  }

  .radio .label {
    position: relative;
    display: block;
    float: left;
    margin-right: 10px;
    width: 18px;
    height: 18px;
    border: 1px solid #c3c5c5;
    border-radius: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  .radio .label:after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 12px;
    height: 12px;
    border-radius: 100%;
    background: #d15f45;
    opacity: 0;
    pointer-events: none;
  }

  input[type="radio"]:checked + .label {
    border-color: #c3c5c5;
  }

  input[type="radio"]:checked + .label:after {
    opacity: 1;
  }

  .cntr {
    position: absolute;
    top: calc(50% - 10px);
    left: 0;
    width: 100%;
    text-align: center;
  }

  .hidden {
    display: none;
  }

}
</style>