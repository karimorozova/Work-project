<template lang="pug">
  .moduleFilters
    template(v-for="({ id, name }) in tableFilters")

      .filter(v-if="id === 'f_vendorId'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_phone'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_email'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_currency'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_timezone'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      //- .filter(v-if="id === 'f_dateInfo.createdAt'")
      //-   .filter__label {{name}}
      //-   .filter__input
      //-     input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
      //-     .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
      //-       i.fas.fa-backspace
      .filter(v-if="id === 'f_dateInfo.createdAt'")
        .filter__label {{name}}
        .filter__input
          DatePicker(
            :value="selectedCreationDateRange"
            @input="(e) => replaceRoute('f_dateInfo.createdAt', `${ new Date(e[0]).getTime() }_${ new Date(e[1]).getTime() }`)"
            format="MMM D: HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Datetime range"
          )
          .remove(v-if="!!selectedCreationDateRange[0]" @click="removeQuery(id)")
            i.fas.fa-backspace
      //.filter(v-if="id === 'f_status'")
      //  .filter__label {{name}}
      //  .filter__input
      //    input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
      //    .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
      //      i.fas.fa-backspace
      .filter(v-if="id === 'f_gender'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_vendorType'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_native'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :selectedOption="getSimpleValue(id)"
            :options="languages.map(({ lang }) => lang)"
            placeholder="Option"
            @chooseOption="({option}) => setSimpleValue(id, option)"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_isAvailableForWork'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :selectedOption="getSimpleValue(id)"
            :options="booleanOptions"
            placeholder="Option"
            @chooseOption="({option}) => setSimpleValue(id, option)"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_isTest'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :selectedOption="getSimpleValue(id)"
            :options="booleanOptions"
            placeholder="Option"
            @chooseOption="({option}) => setSimpleValue(id, option)"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_companyName'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_website'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_fullName'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      //.filter(v-if="id === 'f_billingInfo'")
      //  .filter__label {{name}}
      //  .filter__input
      //    SelectMulti(
      //      :selectedOptions="selectedPaymentMethods"
      //      :options="paymentTypes"
      //      placeholder="Options"
      //      @chooseOptions="setPaymentMethods"
      //      :isSelectedWithIcon="true"
      //      :isRemoveOption="true"
      //      @removeOption="removeQuery(id)"
      //    )
      .filter(v-if="id === 'f_catExperience'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedCatExperience"
            :options="catOptions"
            placeholder="Options"
            @chooseOptions="setCatExperience"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_sourceLanguages'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedSourceLanguages"
            :options="languages.map(({ lang }) => lang) | firstEnglishLanguage"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setSourceLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_targetLanguages'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTargetLanguages"
            :options="languages.map(({ lang }) => lang)"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setTargetLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_industry'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :hasSearch="true"
            :selectedOptions="selectedIndustries"
            :options="allIndustries"
            placeholder="Options"
            @chooseOptions="setIndustries"
            :isRemoveOption="true"
            :isSelectedWithIcon="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_steps'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :hasSearch="true"
            :selectedOptions="selectedSteps"
            :options="allSteps"
            placeholder="Options"
            @chooseOptions="setSteps"
            :isRemoveOption="true"
            :isSelectedWithIcon="true"
            @removeOption="removeQuery(id)"
          )
      //.filter(v-if="id === 'f_rate'")
      //  .filter__label {{name}}
      //  .filter__input
      //    input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
      //    .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
      //      i.fas.fa-backspace

</template>

<script>
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import SelectSingle from '../../SelectSingle'
import SelectMulti from "../../SelectMulti"
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import { mapGetters } from "vuex"
export default {
  name: 'VendorsFilters',
  mixins: [ LayoutWrapperMixin ],
  components: {
    SelectSingle,
    SelectMulti,
    DatePicker
  },
  data() {
    return {
      booleanOptions: [ 'Yes', 'No'],
      paymentTypes: ['PayPal', 'Bank Details'],
      catOptions: ['Trados', 'XML', 'MemoQ']
    }
  },
  computed: {
    ...mapGetters({
      languages: "getAllLanguages",
      industries: "getAllIndustries",
      steps: "getAllSteps",
    }),
    selectedCatExperience() {
      return this.$route.query.f_catExperience ? this.$route.query.f_catExperience.split(',') : []
    },
    // selectedPaymentMethods() {
    //   return this.$route.query.f_billingInfo ? this.$route.query.f_billingInfo.split(',') : []
    // },
    selectedSourceLanguages() {
      return this.$route.query.f_sourceLanguages && this.languages.length
        ? this.$route.query.f_sourceLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
        : []
    },
    selectedTargetLanguages() {
      return this.$route.query.f_targetLanguages && this.languages.length
        ? this.$route.query.f_targetLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
        : []
    },
    selectedIndustries() {
      return this.$route.query.f_industry && this.industries.length
        ? this.$route.query.f_industry.split(',').map(_id => this.industries.find(industry => _id === industry._id).name)
        : []
      // if (this.$route.query.f_industry && this.industries.length) {
      //   const { name } = this.industries.find(({ _id }) => `${ _id }` === `${ this.$route.query.f_industry }`)
      //   return name
      // }
      // return ''
    },
    selectedSteps() {
      return this.$route.query.f_steps && this.steps.length
        ? this.$route.query.f_steps.split(',').map(_id => this.steps.find(step => _id === step._id).title)
        : []
      // if (this.$route.query.f_steps && this.steps.length) {
      //   const { title } = this.steps.find(({ _id }) => `${ _id }` === `${ this.$route.query.f_steps }`)
      //   return title
      // }
      // return ''
    },
    selectedCreationDateRange() {
      return this.$route.query['f_dateInfo.createdAt']
          ? [ new Date(+this.$route.query['f_dateInfo.createdAt'].split('_')[0]), new Date(+this.$route.query['f_dateInfo.createdAt'].split('_')[1]) ]
          : [ null, null ]
    },
    allIndustries() {
      return this.industries.map(({ name }) => name)
    },
    allSteps() {
      return this.steps.map(({ title }) => title)
    },
  },
  props: {
    tableFilters: {
      type: Array,
      default: () => []
    },
  },
  methods: {
    // setPaymentMethods({option}) {
    //   if (!this.$route.query.f_billingInfo) {
    //     this.replaceRoute('f_billingInfo', option)
    //     return
    //   }
    //   let paymentOptions = this.$route.query.f_billingInfo.split(',')
    //   if (paymentOptions.includes(option)) paymentOptions = paymentOptions.filter(payment => payment !== option)
    //   else paymentOptions.push(option)
    //   this.replaceRoute('f_billingInfo', paymentOptions.join(','))
    // },
    setCatExperience({option}) {
      if (!this.$route.query.f_catExperience) {
        this.replaceRoute('f_catExperience', option)
        return
      }
      let catOptions = this.$route.query.f_catExperience.split(',')
      if (catOptions.includes(option)) catOptions = catOptions.filter(catOption => catOption !== option)
      else catOptions.push(option)
      this.replaceRoute('f_catExperience', catOptions.join(','))
    },
    setIndustries({ option }) {
      // const { _id } = this.industries.find(({ name }) => name === option)
      // this.replaceRoute('f_industry', _id)
      if (!this.$route.query.f_industry) {
        this.replaceRoute('f_industry', this.getIndustryIdByName(option))
        return
      }
      let _ids = this.$route.query.f_industry.split(',')
      if (_ids.includes(this.getIndustryIdByName(option))) _ids = _ids.filter(_id => _id !== this.getIndustryIdByName(option))
      else _ids.push(this.getIndustryIdByName(option))
      this.replaceRoute('f_industry', _ids.join(','))
    },
    setSteps({option}) {
      // const { _id } = this.steps.find(({ title }) => title === option)
      // this.replaceRoute('f_steps', _id)
      if (!this.$route.query.f_steps) {
        this.replaceRoute('f_steps', this.getStepIdByTitle(option))
        return
      }
      let _ids = this.$route.query.f_steps.split(',')
      if (_ids.includes(this.getStepIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getStepIdByTitle(option))
      else _ids.push(this.getStepIdByTitle(option))
      this.replaceRoute('f_steps', _ids.join(','))
    },
    setSourceLanguages({option}) {
      if (!this.$route.query.f_sourceLanguages) {
        this.replaceRoute('f_sourceLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.f_sourceLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('f_sourceLanguages', _ids.join(','))
    },
    setTargetLanguages({option}) {
      if (!this.$route.query.f_targetLanguages) {
        this.replaceRoute('f_targetLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.f_targetLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('f_targetLanguages', _ids.join(','))
    },

    getLanguageIdByLang(option) {
      const { _id } = this.languages.find(({ lang }) => lang === option)
      return _id
    },
    getIndustryIdByName(option) {
      const { _id } = this.industries.find(({ name }) => name === option)
      return _id
    },
    getStepIdByTitle(option) {
      const { _id } = this.steps.find(({ title }) => title === option)
      return _id
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/colors';

.moduleFilters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px 25px;
}

.filter {
  width: 220px;

  &__label {
    margin-bottom: 3px;
    font-family: 'Myriad600';
  }

  &__input {
    position: relative;
    height: 32px;
    width: 220px;
    background: white;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 220px;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }


}

.remove {
  font-size: 15px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;
  background: white;

  &:hover {
    color: $text;
  }
}

</style>
