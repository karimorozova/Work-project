<template lang="pug">
  .competencies
    .competencies__body
      .competencies__modal-wrapper(v-if="errors.length > 0" @click="clearErrors")
        Modal.modal.modal-width-300(@close="clearErrors")
          .modal-error Error:
          p.modal-error__errors(v-for="modalError in errors") {{modalError}}
      .competencies__modal-wrapper(v-if="showAlert.isShow")
        ApproveModal.modal.modal-width-500(
          approveValue="Yes"
          notApproveValue="No"
          @approve="modifyApprove"
          @notApprove="modifyNotApprove"
          @close="closeApproveModal"
        )
          p(v-for="matchPending in matchPendingCompetencies")
            span.bold {{matchPending.sourceLanguage.lang}} &nbsp;
            span >> &nbsp;
            span.bold {{matchPending.targetLanguage.lang}} &nbsp;
            span for &nbsp;
            span.bold {{matchPending.industry.name}} &nbsp;
          p for step: &nbsp;
            span.bold {{currentStep.title}} &nbsp;
            span has been entered in our system. Do you wish to overwrite the information with the new information you have entered.

      .competencies__row
        .competencies__col
          .competencies__select
            .competencies__input-title Source Language:
            SelectSingle.width-191(
              :selectedOption="currentSourceLang.lang"
              :options="langs"
              placeholder="Source language"
              @chooseOption="(e) => setSelectedOption(e, 'currentSourceLang')"
            )
        .competencies__col
          .competencies__select
            .competencies__input-title Target Language:
            SelectSingle.width-191(
              :selectedOption="targetLangOrMotherTongue.lang"
              :options="langs"
              placeholder="Target language"
              @chooseOption="(e) => setSelectedOption(e, 'currentTargetLang')"
              )

      .competencies__row-column.mb35(v-if="isEqualsMotherTongue()")
        .competencies__text
          p The target language you have selected isn't your mother tongue.
          p Please provide more details about your level of &nbsp;
            span.bold {{currentTargetLang.lang}}
            span , years of experience and other supporting information.
        .competencies__markdown
          WYSIWYG(@editorBlur="setTargetLangDetails")

      .competencies__row
        .competencies__col
          .competencies__select
            .competencies__input-title Industry:
            SelectMulti.width-191(
              :selectedOptions="currentIndustry.map(({name})=> name)"
              :options="industries"
              placeholder="Industry"
              @chooseOptions="setSelectedMultiOption"
              )
        .competencies__col
          .competencies__select
            .competencies__input-title Step:
            SelectSingle.width-191(
              :selectedOption="currentStep.title"
              :options="filteredSteps()"
              placeholder="Step"
              @chooseOption="(e) => setSelectedOption(e, 'currentStep')"
              )

      .competencies__row-column.mb35(v-for="{name} in currentIndustry")
        .competencies__text
          p Please provide more details about your experience in &nbsp;
            span.bold {{name}}
        .competencies__markdown
          WYSIWYG(@editorBlur="(e)=> setIndustriesDetails(e,name)")

      .competencies__row
        .competencies__select
          .competencies__input-title Rate per word:
          .competencies__rates
            input.width-191(v-model.lazy="currentRate" type="text")

      .competencies__row
        .competencies__text
        p Can you back translate ( &nbsp;
          span.bold {{targetLangOrMotherTongue.lang}} >> &nbsp;
          span.bold {{currentSourceLang.lang}} &nbsp;
          span ) in &nbsp;
          span.bold {{currentIndustry.map(({name})=> name).join(', ')}}

      .competencies__row
        .competencies__reverse-translate
          .competencies__radio-button
            label.radio(for='opt1')
              input#opt1.hidden(type='radio' v-model="isReverseTranslate" :value="true")
              span.label
              | Yes

        .competencies__reverse-translate
          .competencies__radio-button
            label.radio(for='opt2')
              input#opt2.hidden(type='radio' v-model="isReverseTranslate" :value="false")
              span.label
              | No

      .competencies__row
        .competencies__select(v-if="isReverseTranslate === true")
          .competencies__input-title Rate per word:
          .competencies__rates
            input.width-191(v-model.lazy="currentReverseRate" type="text")

      .competencies__row
        .competencies__submit
          Button(value="Submit" @clicked="checkError" customClass="width-191" :isDisabled="showAlert.isShow")


</template>

<script>
import SelectSingle from "../../../components/overall/SelectSingle"
import SelectMulti from "../../../components/overall/SelectMulti"
import { mapGetters, mapActions } from "vuex"
import WYSIWYG from "../../../components/overall/WYSIWYG"
import ApproveModal from "../../../components/ApproveModal";
import Button from "../../../components/overall/Button";
import Modal from "../../../components/overall/Modal";

export default {
  data() {
    return {
      showStep: [ 'Translation', 'Copywriting' ],
      currentSourceLang: {},
      currentTargetLang: {},
      currentIndustry: [],
      currentStep: {},
      industriesDetails: {},
      targetLangDetails: '',
      isReverseTranslate: false,
      currentRate: (0).toFixed(4),
      currentReverseRate: (0).toFixed(4),
      showAlert: {
        isShow: false,
        text: '',
      },
      updateOld: false,
      matchPendingCompetencies: [],
      newPendingCompetencies: [],
      oldPendingCompetencies: [],
      errors: []
    }
  },
  watch: {
    currentRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex,'').replace(',','.') ) || 0
      this.currentRate = (+value).toFixed(4)
    },
    currentReverseRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex,'').replace(',','.') ) || 0
      this.currentReverseRate = (+value).toFixed(4)
    }
  },
  methods: {
    ...mapActions([
      "setVendorProp"
    ]),
    filteredSteps () {
      return this.steps.filter((step) => this.showStep.includes(step.title) )
    },
    setSelectedOption({ option }, value) {
      this[value] = option
    },
    setSelectedMultiOption({option}){
      const index = this.currentIndustry.findIndex(({name}) => option.name === name)
      if (index !== -1) {
        this.currentIndustry.splice(index, 1)
      }else {
        if (this.currentIndustry.length >= 5 ) {
          this.errors.push('You can select only 5 industry for one request')
          return
        }
        this.currentIndustry.push(option)
      }
    },
    setTargetLangDetails ({ data }) {
      this.targetLangDetails = data
    },
    setIndustriesDetails({ data }, name) {
      this.industriesDetails[name] = data
    },
    isEqualsMotherTongue() {
      return this.currentTargetLang.lang && this.currentTargetLang.lang !== this.motherTongue.lang
    },
    isNormalRate(rate) {
      const regex = /^\d+\.\d{1,10}$/
      return regex.test(rate)
    },
    findMatch(pendingCompetencies) {
      this.oldPendingCompetencies = Array.from(this.vendor.pendingCompetencies || [])
      const vendorPending = Array.from(this.pendingCompetenciesToStrings)

      pendingCompetencies.forEach((elem) => {
        const pattern = `${elem.sourceLanguage._id}-${elem.targetLanguage._id}-${elem.industry._id}-${elem.step._id}`
        const matchCompetenciesIndex = vendorPending.indexOf(pattern)
        if ( matchCompetenciesIndex !== -1 ) {
          vendorPending.splice(matchCompetenciesIndex, 1)
          this.oldPendingCompetencies.splice(matchCompetenciesIndex, 1)
          this.matchPendingCompetencies.push(elem)
        } else {
          this.newPendingCompetencies.push(elem)
        }
      })
    },
    generateFinalData(sourceLanguage, targetLanguage) {
      let groupedArray = []
      for(const industry of this.currentIndustry) {
        groupedArray.push({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          industry: industry,
          step: this.currentStep,
          rate: this.currentRate,
          descriptions: {
            targetLanguage: this.targetLangDetails || '',
            industry: this.industriesDetails[industry.name],
          }
        })
      }
      return groupedArray
    },
    checkError() {
      this.errors = []
      if (!this.currentSourceLang.lang) this.errors.push('Source Language is empty')
      if (!this.targetLangOrMotherTongue.lang) this.errors.push('Target Language is empty')
      if (this.currentIndustry.length < 1) this.errors.push('Industry is empty')
      if (!this.currentStep.title) this.errors.push('Step is empty')
      // if (!this.isNormalRate(this.rate)) this.errors.push('Rate is empty')
      // if (this.isReverseTranslate === true && !this.isNormalRate(this.reverseRate)) console.log('Reverse rate is empty')
      if (this.errors.length < 0) return
      // if (this.currentSourceLang === this.currentTargetLang) this.errors.push('')
      // if (this..length > 0) this.errors.push('')
      this.submitForm()
    },
    submitForm() {
      let pendingCompetenciesCombinations = this.generateFinalData(this.currentSourceLang, this.targetLangOrMotherTongue)
      if (this.isReverseTranslate) {
        pendingCompetenciesCombinations.push(...this.generateFinalData(this.targetLangOrMotherTongue, this.currentSourceLang))
      }

      this.findMatch(pendingCompetenciesCombinations)

      const pendingCompetencies = [...this.vendor.pendingCompetencies,...this.newPendingCompetencies]

      if(this.matchPendingCompetencies.length > 0) {
        this.showAlert.isShow = true
      }else {
        this.sendRequest(pendingCompetencies)
        this.setVendorProp({prop: "pendingCompetencies", value: pendingCompetencies})
        this.pendingCompetenciesToDefault()
      }
    },
    modifyApprove() {
      const pendingCompetencies = [...this.oldPendingCompetencies, ...this.matchPendingCompetencies, ...this.newPendingCompetencies]
      this.sendRequest(pendingCompetencies)
      this.setVendorProp({prop: "pendingCompetencies", value: pendingCompetencies})
      this.pendingCompetenciesToDefault()
      this.showAlert.isShow = false
    },
    modifyNotApprove() {
      const pendingCompetencies = [...this.vendor.pendingCompetencies,...this.newPendingCompetencies]
      this.sendRequest(pendingCompetencies)
      this.setVendorProp({prop: "pendingCompetencies", value: pendingCompetencies})
      this.pendingCompetenciesToDefault()
      this.showAlert.isShow = false
    },
    closeApproveModal() {
      this.showAlert.isShow = false
      this.pendingCompetenciesToDefault()
    },
    pendingCompetenciesToDefault () {
      this.matchPendingCompetencies = []
      this.newPendingCompetencies = []
      this.oldPendingCompetencies = []
    },
    sendRequest(pendingCompetencies) {
      this.$axios.post('/vendor/pending-competencies', {
        token: this.token,
        pendingCompetencies,
      })
    },
    clearErrors() {
      this.errors = []
    }
  },
  computed: {
    ...mapGetters({
      langs: 'getLangs',
      industries: 'getIndustries',
      vendor: "getVendor",
      steps: "getAllStepss",
	    token: "getToken"
    }),
    pendingCompetenciesToStrings(){
      return this.vendor
        && this.vendor.pendingCompetencies
        && this.vendor.pendingCompetencies
          .map(item => {
            return `${item.sourceLanguage._id}-${item.targetLanguage._id}-${item.industry._id}-${item.step._id}`
          })

    },
    motherTongue: function () {
      return this.vendor.native
        ? this.vendor.native
        : ''
    },
    targetLangOrMotherTongue: function () {
      return this.currentTargetLang.lang
        ? this.currentTargetLang
        : this.motherTongue
    }
  },
  components: {
    Modal,
    Button,
    ApproveModal,
    SelectSingle,
    SelectMulti,
	  WYSIWYG
  }
}
</script>

<style lang="scss" scoped>
.competencies {
  width: 1040px;
  color: #67573e;
  font-family: Myriad400;

  p {
    margin: 0;
  }
  &__modal-wrapper{
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0,0,0,0.1);
    z-index: 999;
    .modal {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-right: -50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
    }
  }

  &__title {
    margin: 20px 0;
    font-size: 20px;
  }

  &__input-title {
    min-width: 110px;
  }

  &__body {
    padding: 20px 20px 0.1px 20px;
    box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
    position: relative;
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
    margin-right: 100px;
    display: flex;
    align-items: center;
  }
  &__text {
    opacity: .6;
    margin-bottom: 5px;
  }
  &__markdown {
    max-width: 700px;
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
    margin-right: 60px;

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
  .modal-error{
    color: #d15f45;
    font-family: Myriad600;
    text-align: center;
    font-size: 18px;
    &__errors{
      font-size: 16px;
    }
  }


  .width-191 {
    width: 191px;
  }
  .modal-width-300 {
    width: 300px;
  }
  .modal-width-500 {
    width: 500px;
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
  .mb35 {
    margin-bottom: 35px;
  }
  .bold {
    font-family: Myriad600;
  }


}
</style>
