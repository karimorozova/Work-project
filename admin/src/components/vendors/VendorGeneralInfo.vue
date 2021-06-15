<template lang="pug">
  .gen-info
    .gen-info__block
      .photo-wrap(v-if="!currentVendor.photo")
        input.photo-file(type="file", @change="previewPhoto")
        .photo-text(v-if="!imageExist")
          p.photo-text__message(v-if="!isFileError") upload your photo
            span.photo-extensions *.jpg/jpeg/png
            span.photo-size <= 2MB
        img.photo-image(v-if="imageExist")
        p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
      .photo-wrap(v-if="currentVendor.photo")
        input.photo-file(type="file", @change="previewPhoto")
        img.photo-image(:src="currentVendor.photo")
    .gen-info__block
      .block-item
        label.block-item__label.block-item_relative First Name:
          Asterisk(:customStyle="asteriskStyle")
        input.block-item__input-filed(
          :class="{ 'block-item_error-shadow': errors.includes('Please, enter valid first name.') && isSaveClicked }",
          type="text",
          placeholder="First Name",
          :value="currentVendor.firstName",
          @change="(e) => updateVendorProp(e.target.value, 'firstName')"
        )
      .block-item
        label Surname:
        input.block-item__input-filed(
          type="text",
          placeholder="Surname",
          :value="currentVendor.surname",
          @change="(e) => updateVendorProp(e.target.value,  'surname')"
        )
      .block-item
        label.block-item__label.block-item_relative Email:
          Asterisk(:customStyle="asteriskStyle")
        input.block-item__input-filed(
          type="text",
          placeholder="Email",
          :value="currentVendor.email",
          @change="(e) => updateVendorProp(e.target.value, 'email')"
        )
      .block-item
        label Phone:
        input.block-item__input-filed(
          type="text",
          placeholder="Phone",
          :value="currentVendor.phone",
          @input="(e) => updateVendorProp(e.target.value, 'phone')",
          ref="phone"
        )
      .block-item
        label Time Zone:
        .block-item__drop-menu.block-item_high-index
          TimezoneSelect(:timezoneSelected=" currentVendor.timezone", @chosenZone="(e) => updateVendorProp(e, 'timezone')")
      .block-item
        label.block-item__label.block-item_relative Native Language:
        .block-item__drop-menu.block-item_medium-index
          NativeLanguageSelect(:selectedLang="currentVendor.native", @chosenLang="(e) => updateVendorProp(e.lang, 'native')")
      .block-item.no-margin
        label Gender:
        .block-item__drop-menu
          SelectSingle(
            :options="genders",
            :selectedOption="currentVendor.gender",
            placeholder="Gender",
            @chooseOption="(e) => updateVendorProp(e.option, 'gender')"
          )
    .gen-info__block
      .block-item
        label Company Name:
        input.block-item__input-filed(
          type="text",
          placeholder="Company Name",
          :value="currentVendor.companyName",
          @change="(e) => updateVendorProp(e.target.value,  'companyName')"
        )
      .block-item
        label Website:
        input.block-item__input-filed(
          type="text",
          placeholder="Website",
          :value="currentVendor.website",
          @change="(e) => updateVendorProp(e.target.value,  'website')"
        )
      .block-item
        label Skype:
        input.block-item__input-filed(
          type="text",
          placeholder="Skype",
          :value="currentVendor.skype",
          @change="(e) => updateVendorProp(e.target.value,  'skype')"
        )
      .block-item
        label Linkedin:
        input.block-item__input-filed(
          type="text",
          placeholder="Linkedin",
          :value="currentVendor.linkedin",
          @change="(e) => updateVendorProp(e.target.value,  'linkedin')"
        )
      .block-item
        label WhatsApp:
        input.block-item__input-filed(
          type="text",
          placeholder="WhatsApp",
          :value="currentVendor.whatsapp",
          @change="(e) => updateVendorProp(e.target.value,  'whatsapp')"
        )
      .block-item
        label Industries:
          span.require *
        .block-item__drop-menu(
          :class="{ 'block-item_error-shadow': isSaveClicked && !currentVendor.industries.length }"
        )
          MultiVendorIndustrySelect(
            :selectedInd="currentVendor.industries || []",
            :filteredIndustries="selectedIndNames",
            @chosenInd="chosenInd"
          )
      .block-item.no-margin
        label Aliases:
        .block-item__drop-menu
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="currentVendor.hasOwnProperty('aliases') ? currentVendor.aliases : currentVendorAliases"
            :options="vendorAliases"
            @chooseOptions="setAlias"
          )
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import SelectMulti from "../SelectMulti"
import SelectSingle from "../SelectSingle"
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect"
import TimezoneSelect from "../clients/TimezoneSelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import Asterisk from "../Asterisk";

export default {
  data() {
    return {
      errors: [],
      aliases: [],
      genders: [ "Male", "Female", "Other" ],
      currentVendorAliases: [],
      timezone: '',
      native: '',
      gender: '',
    }
  },
  methods: {
    ...mapActions({
      updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData",
    }),
    chosenInd(e){
      let curentVentorIndusties = [...this.currentVendor.industries]

      const position = curentVentorIndusties.findIndex(item => item._id === e.industry._id);
      if(position !== -1) {
        curentVentorIndusties.splice(position, 1)
      } else {
        curentVentorIndusties.push( e.industry)
      }
      this.updateCurrentVendorGeneralData({key: 'industries', value: curentVentorIndusties})
    },
    setAlias(e){
      let curentVentorAliases = [...this.currentVendor.aliases]

      const position = curentVentorAliases.findIndex(item => item === e.option);
      if(position !== -1) {
        curentVentorAliases.splice(position, 1)
      } else {
        curentVentorAliases.push( e.option)
      }
      this.updateCurrentVendorGeneralData({key: 'aliases', value: curentVentorAliases})
    },
    previewPhoto(e,name) {
      this.updateCurrentVendorGeneralData({key: name, value: e.target.value})
    },
    updateVendorProp(value, key) {
      this.updateCurrentVendorGeneralData({key, value })
    },
    async getAliases() {
      try {
        const result = await this.$http.get(`/memoqapi/memoq-vendor-aliases/${ this.$route.params.id }`)
        this.aliases = result.body
      } catch (err) {
        this.alertToggle({
          message: "Error in Aliases",
          isShow: true,
          type: "error"
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",
    }),
    vendorAliases() {
      if (this.aliases) {
        return this.aliases
      }
    },
    selectedIndNames() {
      let result = []
      if (this.currentVendor.industries && this.currentVendor.industries.length) {
        for (let ind of this.currentVendor.industries) {
          result.push(ind.name)
        }
      }
      return result
    },
  },
  components: {
    SelectSingle,
    SelectMulti,
    MultiVendorIndustrySelect,
    TimezoneSelect,
    NativeLanguageSelect,
    Asterisk
},
  created() {
    this.getAliases()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";

.gen-info {
  box-sizing: border-box;
  padding: 20px;
  box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
}

.gen-info {
  display: flex;
  justify-content: space-between;
  position: relative;

  &__block {
    width: 35%;

    &:first-child {
      width: 22%;
      text-align: center;
    }
  }
}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  &__label {
    margin-bottom: 0;
  }

  &_relative {
    position: relative;
  }

  &__drop-menu {
    position: relative;
    width: 200px;
    height: 28px;
    box-sizing: border-box;
  }

  &_high-index {
    z-index: 10;
  }

  &_medium-index {
    z-index: 8;
  }

  label {
    margin-bottom: 0;
  }

  &__input-filed {
    font-size: 14px;
    color: #66563d;
    border: 1px solid #c1bbb1;
    border-radius: 4px;
    padding: 0 5px;
    outline: none;
    width: 200px;
    height: 30px;
    box-sizing: border-box;
  }

  ::-webkit-input-placeholder {
    opacity: 0.5;
  }

  &_error-shadow {
    box-shadow: 0 0 5px red;
    border-radius: 4px;
  }
}

.photo-wrap {
  width: 195px;
  height: 160px;
  border: 1px solid #c1bbb1;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  .photo-image {
    max-width: 100%;
    max-height: 100%;
  }
}

.photo-file {
  position: absolute;
  top: -25px;
  left: -100px;
  height: 180px;
  background-color: transparent;
  outline: none;
  border: none;
  z-index: 5;
  cursor: pointer;
}

.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__message {
    font-size: 18px;
    opacity: 0.5;
    width: 50%;
    text-align: center;
  }

  &__error-message {
    position: absolute;
    bottom: 30%;
    z-index: 10;
    background-color: $white;
    padding: 3px;
    box-sizing: border-box;
    color: $orange;
  }
}
.photo-extensions,
.photo-size {
  display: block;
  font-size: 12px;
  margin-top: 10px;
}
.edited {
  opacity: .6;
}
.actionsButton {
  display: flex;
  position: absolute;
  right: 10px;
  top: -30px;
}
.actionsButton__icon {
  padding: 0 5px;
}

</style>
