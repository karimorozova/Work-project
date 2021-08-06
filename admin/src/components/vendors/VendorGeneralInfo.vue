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
          SelectMulti(
            :hasSearch="true"
            :allOptionsButtons="true"
            placeholder="Select"
            :selectedOptions="currentVendor.industries.length ? currentVendor.industries.map(i => i.name) : []"
            :options="getAllIndustries.map(i => i.name)"
            @chooseOptions="setIndustries"
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
	import { mapActions, mapGetters } from "vuex"
	import SelectMulti from "../SelectMulti"
	import SelectSingle from "../SelectSingle"

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
				searchLang: '',
				timezones: []
			}
		},
		methods: {
			...mapActions({
				updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData"
			}),
			setAlias(e) {
				let currVendorAliases = [ ...this.currentVendor.aliases ]
				const position = currVendorAliases.findIndex(item => item === e.option)
				if (position !== -1) currVendorAliases.splice(position, 1)
				else currVendorAliases.push(e.option)

				this.updateCurrentVendorGeneralData({ key: 'aliases', value: currVendorAliases })
			},
			previewPhoto(e, name) {
				this.updateCurrentVendorGeneralData({ key: name, value: e.target.value })
			},
			updateVendorNative(value) {
				const { _id, lang } = this.filteredLanguages.find(({ lang }) => lang === value.option)
				this.updateCurrentVendorGeneralData({ key: 'native', value: { _id, lang } })
			},
			updateVendorTimeZone({ option }) {
				this.updateCurrentVendorGeneralData({ key: 'timezone', value: option })
			},
			setIndustries({ option }) {
				let industries = [ ...this.currentVendor.industries ]
				const position = industries.findIndex(item => item.name === option)
				if (position !== -1) industries.splice(position, 1)
				else industries.push(this.getAllIndustries.find(item => item.name === option))
				this.updateCurrentVendorGeneralData({ key: "industries", value: industries })
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
				getAllIndustries: "getAllIndustries",
				languages: "getAllLanguages"
			}),
			filteredLanguages() {
				let result = this.languages
				if (this.addAll) {
					result.unshift({ lang: "All", symbol: "All" })
				}
				result = result.filter(item => {
					if (item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
						return item
					}
				})
				return result
			},
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
			}
		},
		components: {
			SelectSingle,
			SelectMulti
		},
		created() {
			this.getTimezones()
			this.getAliases()
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors.scss";

  .require {
    color: $red;
  }

  .gen-info {
    /*box-sizing: border-box;*/
    /*padding: 20px;*/
    /*box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;*/
    /*border-radius: 4px;*/
    /*background-color: white;*/
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
