<template lang="pug">
  .gen-info
    .gen-info__block
      .contact__photo
        .photo-wrap(v-if="!currentVendorFull.photo")
          input.photo-file(type="file" @change="previewPhoto")
          .photo-text(v-if="!isImageExist")
            p.photo-text__message(v-if="!isFileError") Upload File
              span.photo-extensions *.jpg/jpeg/png
              span.photo-size <= 2MB
          img.photo-image(v-if="isImageExist")
          p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
        .photo-wrap(v-if="currentVendorFull.photo")
          input.photo-file(type="file" @change="previewPhoto")
          img.photo-image(:src="currentVendorFull.photo")

    .gen-info__block
      .block-item
        label.block-item__label.block-item_relative First Name:
          span.require *
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
          span.require *
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
          SelectSingle(
            :hasSearch="true"
            :options="timezones.map(item => item.zone)",
            placeholder="Timezone",
            :selectedOption="currentVendor.timezone",
            @chooseOption="updateVendorTimeZone"
          )
      .block-item
        label.block-item__label.block-item_relative Native Language:
        .block-item__drop-menu.block-item_medium-index
          SelectSingle(
            :selectedOption="currentVendor.native != null ? currentVendor.native.lang : ''",
            :options="filteredLanguages.map(({lang}) => lang)",
            placeholder="Native Language"
            :hasSearch="true"
            @chooseOption="updateVendorNative"
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
      .block-item.no-margin
        label Gender:
        .block-item__drop-menu
          SelectSingle(
            :options="genders",
            :selectedOption="currentVendor.gender",
            placeholder="Gender",
            @chooseOption="(e) => updateVendorProp(e.option, 'gender')"
          )
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import SelectMulti from "../SelectMulti"
import SelectSingle from "../SelectSingle"
import photoPreview from "../../mixins/photoPreview"

export default {
  mixins: [ photoPreview ],
  data() {
    return {
      photoFile: [],
      errors: [],
      aliases: [],
      genders: [ "Male", "Female", "Other" ],
      currentVendorAliases: [],
      timezone: '',
      native: '',
      gender: '',
      searchLang: '',
      timezones: [],
      isImageExist: false,
      isFileError: false
    }
  },
  methods: {
    ...mapActions({
      updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData",
      alertToggle: 'alertToggle',
      storeCurrentVendor: "storeCurrentVendor"
    }),
    async previewPhoto() {
      let sendData = new FormData()
      let input = document.getElementsByClassName('photo-file')[0]
      if (this.checkFile(input.files)) {
        const vendor = JSON.stringify(this.currentVendorFull)
        sendData.append("vendor", vendor)
        sendData.append("photo", input.files[0])
        try {
          const res = await this.$http.post("/vendorsapi/update-vendor", sendData)
          console.log(res)
          await this.storeCurrentVendor(res.data)
          this.alertToggle({ message: "Vendor info updated", isShow: true, type: "success" })
        } catch (err) {
          this.alertToggle({ message: "Server error / Cannot update Vendor info", isShow: true, type: "error" })
        }
      } else {
        this.showFileError(input)
      }
    },
    updateVendorNative(value) {
      const { _id, lang } = this.filteredLanguages.find(({ lang }) => lang === value.option)
      this.updateCurrentVendorGeneralData({ key: 'native', value: { _id, lang } })
    },
    updateVendorTimeZone({ option }) {
      this.updateCurrentVendorGeneralData({ key: 'timezone', value: option })
    },
    updateVendorProp(value, key) {
      this.updateCurrentVendorGeneralData({ key, value })
    },
    async getTimezones() {
      try {
        const result = await this.$http.get('/api/timezones')
        this.timezones = result.data
      } catch (err) {
        console.log(err)
      }
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",
      languages: "getAllLanguages",
      currentVendorFull: "getCurrentVendor",
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
    },
    selectedIndNames() {
      let result = []
      if (this.currentVendor.industries && this.currentVendor.industries.length) {
        for (let ind of this.currentVendor.industries) {
          result.push(ind.name)
        }
      }
      return result
    }
  },
  components: {
    SelectSingle,
    SelectMulti
  },
  created() {
    this.getTimezones()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";

.require {
  color: $red;
}

.gen-info {
  display: flex;
  justify-content: space-between;
  position: relative;

  &__block {
    width: 35%;

    &:first-child {
      width: 20%;
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
    width: 220px;
    height: 32px;
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
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
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
  border-radius: 4px;

  .photo-image {
    max-width: 100%;
    max-height: 100%;
  }
}

.photo-file {
  position: absolute;
  top: -25px;
  left: 0px;
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
  opacity: .5;
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
