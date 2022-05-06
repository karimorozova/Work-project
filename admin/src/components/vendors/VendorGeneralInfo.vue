<template lang="pug">
  .gen-info
    //ValidationErrors(
    //  v-if="areErrorsExist"
    //  :errors="errors"
    //  :isAbsolute="true"
    //  @closeErrors="closeErrors"
    //)
    .vendorInformation
      .vendorInformation__line1
        .row
          .row__key
            span First Name:
            span.require *
          .row__value
            input.input(
              type="text"
              placeholder="Value"
              :value="currentVendor.firstName"
              @change="(e) => updateVendorProp(e.target.value,'firstName')"
            )
        .row
          .row__key
            span Surname:
            span.require *
          .row__value
            input.input(
              type="text"
              placeholder="Value"
              :value="currentVendor.surname"
              @change="(e) => updateVendorProp(e.target.value,'surname')"
            )
        .row
          .row__key
            span Email:
            span.require *
          .row__value
            input.input(
              type="text"
              placeholder="Value"
              :value="currentVendor.email"
              @change="(e) => updateVendorProp(e.target.value,'email')"
            )

      .vendorInformation__line2
        .vendorInformation__photo
          .photo-wrap(v-if="!currentVendorFull.photo")
            input.photo-file(type="file" @change="previewPhoto")
            .photo-text(v-if="!isImageExist")
              p.photo-text__message(v-if="!isFileError") Upload File
                br
                span.photo-extensions *.jpg/jpeg/png
                span.photo-size <= 3MB
            img.photo-image(v-if="isImageExist")
            p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
          .photo-wrap(v-if="currentVendorFull.photo")
            input.photo-file(type="file" @change="previewPhoto")
            img.photo-image(:src="currentVendorFull.photo")

        .vendorInformation__description
          .row.mbRow.phone
            .row__key Phone:
            .row__value
              input.input( type="text" placeholder="Value" :value="currentVendor.phone" @input="(e)=>updateVendorProp(e.target.value, 'phone')" ref="phone")

          .row.mbRow.timezone
            .row__key Time Zone:
            .row__value
              SelectSingle(
                :hasSearch="true"
                placeholder="Option"
                :options="timezones",
                :selectedOption="currentVendor.timezone",
                @chooseOption="updateVendorTimeZone"
              )
          //.row.mbRow
          //  .row__key Availability:
          //  .row__value
          //    SelectSingle(
          //      :options="availabilityList"
          //      :selectedOption="currentVendor.availability"
          //      placeholder="Option"
          //      @chooseOption="(e) => updateVendorProp(e.option, 'availability')"
          //    )
          //.row
          //  .row__key Gender:
          //  .row__value
          //    SelectSingle(
          //      :options="genders"
          //      :selectedOption="currentVendor.gender"
          //      placeholder="Option"
          //      @chooseOption="(e) => updateVendorProp(e.option, 'gender')"
          //    )
          //.row
          //  .row__key Company Name:
          //  .row__value
          //    input.input(type="text" placeholder="Value" :value="currentVendor.companyName" @change="(e) => updateVendorProp(e.target.value,'companyName')")
          //.row
          //  .row__key Skype:
          //  .row__value
          //    input.input(type="text" placeholder="Value" :value="currentVendor.skype" @change="(e) => updateVendorProp(e.target.value,'skype')")
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import SelectMulti from "../SelectMulti"
import SelectSingle from "../SelectSingle"
import RadioButton from "../RadioButton";
import photoPreview from "../../mixins/photoPreview"
import moment from "moment-timezone";

export default {
  mixins: [ photoPreview ],
  data() {
    return {
      photoFile: [],
      errors: [],
      genders: [ "Male", "Female", "Other" ],
      timezone: '',
      availabilityList: ['Full-time', 'Part-time', 'Limited'],
      availability: '',
      gender: '',
      searchLang: '',
      timezones: [],
      isImageExist: false,
      isFileError: false,
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

    updateVendorTimeZone({ option }) {
      this.updateCurrentVendorGeneralData({ key: 'timezone', value: option })
      this.timezone = this.currentVendor.timezone
    },
    updateVendorProp(value, key) {
      this.updateCurrentVendorGeneralData({ key, value })
    },
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",

      currentVendorFull: "getCurrentVendor"
    }),
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
    SelectMulti,
    RadioButton
  },
  created() {
    this.timezones = moment.tz.names()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";

.vendorInformation {
  width: 100%;

  &__photo {
    width: 210px;
    margin-top: -60px;
    margin-left: 60px;
  }

  &__line2 {
    display: flex;
  }

  &__line1 {
    background-color: $light-background;
    padding: 25px;
    display: flex;
    justify-content: space-between;
    padding-left: 270px;
  }

  &__description {
    box-sizing: border-box;
    padding: 25px 25px 0 0;
    width: 770px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    flex-wrap: wrap;
  }
}
.vendor-info__radio {
  display: flex;
}
.radio {
  margin-right: 15px;
}

.gen-info {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 1040px;
  width: 1040px;
  border-radius: 2px;
  background: white;
  height: fit-content;
  position: relative;
}

.require {
  color: $red;
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

.saveButtons {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 20px;
}

.mbRow {
  margin-bottom: 15px;
}

//Photo
.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__message {
    opacity: .4;
    text-align: center;
  }

  &__error-message {
    position: absolute;
    z-index: 12;
    background-color: white;
    color: $red;
    height: 150px;
    width: 150px;
    display: flex;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    font-size: 14px;
    text-align: center;
  }
}

.photo-wrap {
  width: 150px;
  height: 150px;
  border: 2px solid $light-border;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8%;
  background-color: white;
  margin-top: 20px;

  .photo-image {
    object-fit: cover;
    height: 150px;
    width: 150px;
  }
}

.photo-file {
  position: absolute;
  top: -24px;
  height: 172px;
  width: 150px;
  background-color: transparent;
  outline: none;
  border: none;
  z-index: 5;
  cursor: pointer;
  border-radius: 8%;
}
.timezone {
  margin-right: auto;
}
.phone {
  margin-right: 42.5px;
}
</style>
