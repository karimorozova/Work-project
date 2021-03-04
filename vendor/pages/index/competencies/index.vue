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
            SelectSingle.width-191(:selectedOption="currentTargetLang" :options="langs.map(({lang}) => lang)" @chooseOption="(e) => setSelectedOption(e, 'currentTargetLang')")

      .competencies__row(v-if="isEqualsMotherTongue()")
        .competencies__text
          p The target language you have selected isn't your mother tongue.
          p Please provide more details about your level of {{currentTargetLang}}, years of experience and other supporting information.
        .competencies__markdown

      .competencies__row
        .competencies__col
          .competencies__select
            .competencies__input-title Industry:
            SelectSingle.width-191(:selectedOption="currentIndustry.name" :options="industries" @chooseOption="(e) => setSelectedOption(e, 'currentIndustry')")
        .competencies__col
          .competencies__select
            .competencies__input-title Step:
            SelectSingle.width-191(:selectedOption="currentStep" :options="step" @chooseOption="(e) => setSelectedOption(e, 'currentStep')")

      .competencies__row
        .competencies__text
          p Please provide more details about your experience in {{currentIndustry.name}}
        .competencies__markdown

      .competencies__row
        .competencies__input
          .competencies__input-title Rate per word:
          .competencies__rates
            input.width-191(v-model="rate" type="text")

      .competencies__row
        .competencies__text
        p Can you back translate ( {{currentTargetLang}} >> {{currentSourceLang}} ) in {{currentIndustry.name}}

      .competencies__row
        .competencies__reverse-translate

          .competencies__radio-button
            input( type="radio" id="contactChoice1"
              v-model="isReverseTranslate" :value="true")
            label( for="contactChoice1") Yes
          .competencies__rates.reverse-rate(v-if="isReverseTranslate === true")
            span Rate:
            input(v-model="reverseRate" type="text")

        .competencies__reverse-translate
          .competencies__radio-button
            input( type="radio" id="contactChoice2"
              v-model="isReverseTranslate" :value="false")
            label( for="contactChoice2") No

      .competencies__row
        .competencies__submit
          input(type="button" value="Submit" @click="checkError" )


</template>

<script>
import SelectSingle from "../../../components/overall/SelectSingle"
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      motherTongue: '',
      step: [ 'Translation', 'Copywriting' ],
      currentSourceLang: '',
      currentTargetLang: '',
      currentIndustry: '',
      currentStep: '',
      isReverseTranslate: false,
      rate: (0).toFixed(4),
      reverseRate: (0).toFixed(4),
      errors: []
    }
  },
  methods: {
    setSelectedOption({ option }, value) {
      this[value] = option
    },
    isEqualsMotherTongue() {
      return this.currentTargetLang !== this.motherTongue
    },
    isNormalRate(rate) {
      const regex = /^\d+\.\d{1,10}$/
      return regex.test(rate)
    },
    checkError() {
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
      industries: 'getIndustries'
    })
  },
  components: {
    SelectSingle,
  }
}
</script>

<style lang="scss" scoped>
.competencies {
  margin: 30px;
  width: 1100px;
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

  &__select {
    margin-right: 40px;
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
      margin-left: 20px;

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

}
</style>