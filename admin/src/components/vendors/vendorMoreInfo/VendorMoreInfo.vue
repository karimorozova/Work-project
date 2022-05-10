<template lang="pug">
  .container
    .vendorInformation__description
      .row.mbRow
        .row__key Native Language:
        .row__value
          SelectSingle(
            :selectedOption="currentVendor.native ? currentVendor.native.lang: ''",
            :options="filteredLanguages.map(({lang}) => lang)",
            :hasSearch="true"
            placeholder="Option"
            @chooseOption="updateVendorNative"
          )
      .row.mbRow
        .row__key Gender:
        .row__value
          SelectSingle(
            :options="genders"
            :selectedOption="currentVendor.gender"
            placeholder="Option"
            @chooseOption="(e) => updateVendorProp(e.option, 'gender')"
          )
      .row.mbRow
        .row__key Currency:
          .row__value
            SelectSingle(
              :options="currencyList"
              :selectedOption="currentVendor.currency"
              placeholder="Option"
              @chooseOption="(e) => updateVendorProp(e.option, 'currency')"
            )
      .row.mbRow
        .row__key CAT experience:
        .row__value
          SelectMulti(
            :selectedOptions="currentVendor.catExperience"
            :isTableDropMenu="true"
            placeholder="Options"
            :hasSearch="false"
            :options="catExperienceList"
            @chooseOptions="chooseCatExperienceOptions"
          )

      .row.mbRow(v-if="isAgency === 'Agency'" )
        .row__key Company Name:
          .row__value
            input.input(type="text" placeholder="Value" :value="currentVendor.companyName" @change="(e) => updateVendorProp(e.target.value,'companyName')")
      .row.mbRow(v-if="isAgency === 'Agency'" )
        .row__key Website:
          .row__value
            input.input(type="text" placeholder="Value" :value="currentVendor.website" @change="(e) => updateVendorProp(e.target.value,'website')")

</template>

<script>
import SelectSingle from '../../SelectSingle'
import SelectMulti from '../../SelectMulti'
import { mapActions, mapGetters } from "vuex"

export default {
  name: 'VendorMoreInfo',
  props: {
    isAgency: {
      type: String
    }
  },
  components: {
    SelectSingle,
    SelectMulti
  },
  data() {
    return {
      genders: [ "Male", "Female", "Other" ],
      gender: '',
      native: '',
      searchLang: '',
      catExperience: [],
      catExperienceList: [ 'XTM', 'MemoQ', 'Trados' ],
      currencyList: [ 'EUR' ]
    }

  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",
      languages: "getAllLanguages"
    }),
    filteredLanguages() {
      let result = this.languages
      if (this.addAll) {
        result.unshift({ lang: "All", symbol: "All" })
      }
      result = result.filter(item => {
        if (item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) !== -1) {
          return item
        }
      })
      return result
    }
  },
  methods: {
    ...mapActions({
      updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData",
      alertToggle: 'alertToggle',
      storeCurrentVendor: "storeCurrentVendor"
    }),
    updateVendorNative(value) {
      const { _id, lang } = this.filteredLanguages.find(({ lang }) => lang === value.option)
      this.updateCurrentVendorGeneralData({ key: 'native', value: { _id, lang } })
    },
    updateVendorProp(value, key) {
      this.updateCurrentVendorGeneralData({ key, value })
      this[key] = value
    },
    chooseCatExperienceOptions({ option }) {
      const cat = [ ...this.currentVendor.catExperience ]
      const position = cat.indexOf(option)
      if (position !== -1) {
        cat.splice(position, 1)
      } else {
        cat.push(this.catExperienceList.find((item) => item === option))
      }
      console.log(cat)
      this.updateVendorProp(cat, 'catExperience')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.vendorInformation__description {
  box-sizing: border-box;
  width: 770px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  flex-wrap: wrap;
  margin-left: auto;
  padding: 25px 25px 0 0;
}

.vendorInformation__title-wrapper {
  box-sizing: border-box;
  width: 770px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  flex-wrap: wrap;
  margin-left: auto;
}

.row {
  &__key {
    margin-bottom: 3px;
  }

  &__value {
    width: 220px;
    background-color: powderbluer;
    position: relative;
    height: 32px;
  }
}

.input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 220px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.mbRow {
  margin-bottom: 15px;
}

.title {
  font-family: Myriad600;
  font-size: 16px;
}

.website {
  margin-right: auto;
}

.company {
  margin-right: 42.5px;
}

.agency {
  padding-top: 0;
}
</style>
