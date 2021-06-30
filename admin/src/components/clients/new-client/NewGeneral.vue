<template lang="pug">
  .general-info
    .general-info__block
      .block-item
        label.block-item__label.block-item_relative Company Name:
          Asterisk(:customStyle="asteriskStyle")
        input(type="text" placeholder="Company Name" v-model="client.name" :class="{'general-info_error-shadow': !client.name && isSaveClicked}")
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Official Company Name:
        input(type="text" placeholder="Official Company Name" v-model="client.officialCompanyName")
      .block-item
        label.block-item__label.block-item_relative Email:
          Asterisk(:customStyle="asteriskStyle")
        input(type="text" placeholder="Email" v-model="client.email" :class="{'general-info_error-shadow': !client.email && isSaveClicked}")
      .block-item(v-if="!isIndividual")
        label.block-item__label Website:
        input(type="text" placeholder="Website" v-model="client.website")
      .block-item
        label.block-item__label.block-item_relative Industry:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !client.industries.length}")
          SelectMulti(
            :hasSearch="true"
            :allOptionsButtons="true"
            placeholder="Select"
            :selectedOptions="client.industries.length ? client.industries.map(i => i.name) : []"
            :options="getAllIndustries.map(i => i.name)"
            @chooseOptions="setIndustries"
          )
    .general-info__block
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Time Zone:
        .block-item__drop.block-item_medium-index
          SelectSingle(
            :hasSearch="true"
            placeholder="Select"
            :selectedOption="client.hasOwnProperty('timeZone') ? client.timeZone.zone : currentZone"
            :options="timezoneData"
            @chooseOption="setTimezone"
          )
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Native Language:
        .block-item__drop
          SelectSingle(
            :hasSearch="true"
            placeholder="Select"
            :selectedOption="client.hasOwnProperty('nativeLanguage') ? client.nativeLanguage.lang : currentLanguage"
            :options="targetLanguages"
            @chooseOption="setLanguage"
          )
      .block-item
        label.block-item__label.block-item_relative Source Languages:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.sourceLanguages.length}")
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="client.hasOwnProperty('sourceLanguages') ? makeStringLanguage(client.sourceLanguages) : makeStringLanguage(currentSourceLanguages)"
            :options="sourceLanguages | firstEnglishLanguage"
            @chooseOptions="setSource"
            :allOptionsButtons="true"
          )
      .block-item
        label.block-item__label.block-item_relative Target Languages:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.targetLanguages.length}")
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="client.hasOwnProperty('targetLanguages') ? makeStringLanguage(client.targetLanguages) : makeStringLanguage(currentTargetLanguages)"
            :options="targetLanguages"
            @chooseOptions="setTarget"
            :allOptionsButtons="true"
          )
</template>

<script>
	import Asterisk from "@/components/Asterisk"
	import scrollDrop from "@/mixins/scrollDrop"
	import SelectSingle from "../../SelectSingle"
	import SelectMulti from "../../SelectMulti"
	import { mapGetters } from "vuex"

	export default {
		mixins: [ scrollDrop ],
		props: {
			client: {
				type: Object
			},
			isIndividual: {
				type: Boolean,
				default: false
			},
			isSaveClicked: {
				type: Boolean
			},
			languages: {
				type: Array
			},
			timezones: {
				type: Array
			}
		},
		data() {
			return {
				asteriskStyle: { top: "-4px" },
				currentZone: "",
				currentLanguage: "",
				currentSourceLanguages: [],
				currentTargetLanguages: []
			}
		},
		methods: {
			setIndustries({ option }) {
				const curr = this.getAllIndustries.find(item => item.name === option)
				if (!this.client.industries.length) {
					return this.client.industries.push(curr)
				}
				const position = this.client.industries.findIndex(item => item.name === option)
				if (position !== -1) return this.client.industries.splice(position, 1)
				this.client.industries.push(curr)
			},
			makeStringLanguage(langArray) {
				return langArray.map(item => item.lang)
			},
			setLanguage({ option }) {
				this.currentLanguage = option
				this.client.nativeLanguage = this.languages.find(item => item.lang === option)
			},
			setTimezone({ option }) {
				this.currentZone = option
				this.client.timeZone = this.timezones.find(item => item.zone === option)
			},
			setTarget({ option }) {
				if (!this.client.targetLanguages.length) {
					const lang = this.languages.find(item => item.lang === option)
					return this.client.targetLanguages.push(lang)
				}
				const position = this.client.targetLanguages
						.map(item => item.lang)
						.indexOf(option)

				if (position !== -1) {
					return this.client.targetLanguages.splice(position, 1)
				} else {
					const lang = this.languages.find(item => item.lang === option)
					return this.client.targetLanguages.push(lang)
				}
			},
			setSource({ option }) {
				if (!this.client.sourceLanguages.length) {
					const lang = this.languages.find(item => item.lang === option)
					return this.client.sourceLanguages.push(lang)
				}
				const position = this.client.sourceLanguages
						.map(item => item.lang)
						.indexOf(option)

				if (position !== -1) {
					return this.client.sourceLanguages.splice(position, 1)
				} else {
					const lang = this.languages.find(item => item.lang === option)
					return this.client.sourceLanguages.push(lang)
				}
			}
		},
		computed: {
			...mapGetters({
				getAllIndustries: "getAllIndustries"
			}),
			sourceLanguages() {
				if (this.languages) {
					return this.languages.map(item => item.lang).sort((a, b) => a.localeCompare(b))
				}
			},
			targetLanguages() {
				if (this.languages) {
					return this.languages.map(item => item.lang).sort((a, b) => a.localeCompare(b))
				}
			},
			timezoneData() {
				if (this.timezones) {
					return this.timezones.map(item => item.zone)
				}
			},
			selectedIndNames() {
				let result = []
				if (this.client.industries && this.client.industries.length) {
					for (let ind of this.client.industries) {
						result.push(ind.name)
					}
				}
				return result
			}
		},
		components: {
			Asterisk,
			SelectSingle,
			SelectMulti
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .general-info {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &__block {
      width: 39%;
      padding-bottom: 1px;
    }

    &_error-shadow {
      box-shadow: 0 0 5px $red;
    }
  }

  .block-item:last-child {
    margin-bottom: 0px;
  }

  .block-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    height: 30px;

    &__check-item {
      width: 190px;
    }

    &__label {
      margin-bottom: 0;
    }

    &_relative {
      position: relative;
    }

    &__drop {
      position: relative;
      width: 200px;
      height: 28px;
    }

    &_high-index {
      z-index: 10;
    }

    &_medium-index {
      z-index: 8;
    }

    input {
      font-size: 14px;
      color: #66563d;
      border: 1px solid #c1bbb1;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 5px;
      outline: none;
      width: 200px;
      height: 30px;
    }

    ::-webkit-input-placeholder {
      opacity: 0.5;
    }
  }

  .contract,
  .nda {
    display: flex;
    align-items: center;
    width: 22%;
    justify-content: space-between;

    &__upload {
      position: relative;
      background: url("../../../assets/images/Other/upload-icon.png");
      background-repeat: no-repeat;
      width: 40%;
      height: 22px;
      overflow: hidden;

      .upload {
        padding-left: 0;
        padding-right: 0;
        width: 33px;
        height: 22px;
        border: none;
        outline: none;
        margin-top: -3px;
        margin-right: 2px;
        opacity: 0;
        z-index: 2;
        position: absolute;
        left: -10px;
        cursor: pointer;
        font-size: 0;
      }
    }

    &__download {
      width: 40%;
      cursor: pointer;
    }
  }
</style>
