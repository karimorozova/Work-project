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
      .filter(v-if="id === 'f_status'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
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
      .filter(v-if="id === 'f_surname'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace
      .filter(v-if="id === 'f_billingInfo'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedPaymentMethods"
            :options="paymentTypes"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setPaymentMethods"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

</template>

<script>
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import SelectSingle from '../../SelectSingle'
import SelectMulti from "../../SelectMulti"
import { mapGetters } from "vuex"
export default {
  name: 'VendorsFilters',
  mixins: [ LayoutWrapperMixin ],
  components: {
    SelectSingle,
    SelectMulti
  },
  data() {
    return {
      booleanOptions: [ 'Yes', 'No'],
      paymentTypes: ['PayPal', 'Bank Details']
    }
  },
  computed: {
    ...mapGetters({
      languages: "getAllLanguages",
    }),
  },
  props: {
    tableFilters: {
      type: Array,
      default: () => []
    },
    selectedPaymentMethods: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    setPaymentMethods({ option }) {
      this.selectedPaymentMethods.push(option)
      // if (!this.$route.query.f_sourceLanguages) {
      //   this.replaceRoute('f_sourceLanguages', this.getLanguageIdByLang(option))
      //   return
      // }
      // let _ids = this.$route.query.f_sourceLanguages.split(',')
      // if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      // else _ids.push(this.getLanguageIdByLang(option))
      // this.replaceRoute('f_sourceLanguages', _ids.join(','))
    },
  },
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
