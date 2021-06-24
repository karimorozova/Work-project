<template lang="pug">
  .general-info
    .general-info__block
      .block-item
        label.block-item__label.block-item_relative Company Name:
          Asterisk(:customStyle="asteriskStyle")
        input(type="text" placeholder="Company Name" :value="currentClient.name" @change="(e) => changeProperty(e, 'name')" :class="{'general-info_error-shadow': !currentClient.name && isSaveClicked}")
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Official Company Name:
        input(type="text" placeholder="Official Company Name" :value="currentClient.officialCompanyName" @change="(e) => changeProperty(e, 'officialCompanyName')")
      .block-item
        label.block-item__label.block-item_relative Email:
          Asterisk(:customStyle="asteriskStyle")
        input(type="text" placeholder="Email" :value="currentClient.email" @change="(e) => changeProperty(e, 'email')" :class="{'general-info_error-shadow': !currentClient.email && isSaveClicked}")
      .block-item(v-if="!isIndividual")
        label.block-item__label Website:
        input(type="text" placeholder="Website" :value="currentClient.website" @change="(e) => changeProperty(e, 'website')")
      .block-item
        label.block-item__label.block-item_relative Industry:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.industries.length}")
          MultiClientIndustrySelect(:selectedInd="currentClient.industries" :filteredIndustries="selectedIndNames" @chosenInd="setIndustries")
    .general-info__block
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Time Zone:
        .block-item__drop.block-item_medium-index
          SelectSingle(
            :hasSearch="true"
            placeholder="Select"
            :selectedOption="currentClient.hasOwnProperty('timeZone') && currentClient.timeZone !== null  ? currentClient.timeZone.zone : currentZone"
            :options="timezoneData"
            @chooseOption="setTimezone"
          )
      .block-item(v-if="!isIndividual")
        label.block-item__label.block-item_relative Native Language:
        .block-item__drop
          SelectSingle(
            :hasSearch="true"
            placeholder="Select"
            :selectedOption="currentClient.hasOwnProperty('nativeLanguage') && currentClient.nativeLanguage !== null  ? currentClient.nativeLanguage.lang : currentLanguage"
            :options="targetLanguages"
            @chooseOption="setLanguage"
          )
      .block-item
        label.block-item__label.block-item_relative Source Languages:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="currentClient.sourceLanguages.length ? makeStringLanguage(currentClient.sourceLanguages) : makeStringLanguage(currentSourceLanguages)"
            :options="sourceLanguages | firstEnglishLanguage"
            @chooseOptions="setSource"
            :allOptionsButtons="true"
          )
      .block-item
        label.block-item__label.block-item_relative Target Languages:
          Asterisk(:customStyle="asteriskStyle")
        .block-item__drop
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="currentClient.targetLanguages.length ? makeStringLanguage(currentClient.targetLanguages) : makeStringLanguage(currentTargetLanguages)"
            :options="targetLanguages"
            @chooseOptions="setTarget"
            :allOptionsButtons="true"
          )

      .block-item
        label.block-item__label.block-item_relative Aliases:
        .block-item__drop
          SelectMulti(
            placeholder="Select"
            :hasSearch="true"
            :selectedOptions="currentClient.hasOwnProperty('aliases') ? currentClient.aliases : currentClientAliases"
            :options="clientAliases"
            @chooseOptions="setAlias"
          )
</template>

<script>
	import Asterisk from "@/components/Asterisk"
	import ClientStatusSelect from "../ClientStatusSelect"
	import MultiClientIndustrySelect from "../MultiClientIndustrySelect"
	import AMSelect from "../AMSelect"
	import scrollDrop from "@/mixins/scrollDrop"
	import SelectSingle from "../../SelectSingle"
	import SelectMulti from "../../SelectMulti"

	import { mapGetters, mapActions } from "vuex"

	export default {
		mixins: [ scrollDrop ],
		props: {
			isSaveClicked: {
				type: Boolean
			},
			isIndividual: {
				type: Boolean,
				default: true
			},
			languages: {
				type: Array
			},
			timezones: {
				type: Array
			},
			allClientAliases: {
				type: Array
			}
		},
		data() {
			return {
				asteriskStyle: { top: "-4px" },
				currentZone: "",
				currentLanguage: "",
				currentSourceLanguages: [],
				currentTargetLanguages: [],
				currentClientAliases: []
			}
		},
		methods: {
			...mapActions([ "storeClientPropertyOverallData", "updateClientStatus", "alertToggle" ]),
			changeProperty(e, prop) {
				this.storeClientPropertyOverallData({ prop, value: e.target.value })
			},
			makeStringLanguage(langArray) {
				return langArray.map(item => item.lang)
			},
			setIndustries({ industry }) {
				let industries = [ ...this.currentClient.industries ]
				const position = industries.findIndex(item => item._id === industry._id)
				if (position !== -1) {
					industries.splice(position, 1)
				} else {
					industries.push(industry)
				}
				this.storeClientPropertyOverallData({ prop: "industries", value: industries })
			},
			setLanguage({ option }) {
				this.currentLanguage = option
				const lang = this.languages.find(item => item.lang == option)
				this.storeClientPropertyOverallData({ prop: "nativeLanguage", value: lang })
			},
			setTimezone({ option }) {
				this.currentZone = option
				const timezone = this.timezones.find(item => item.zone == option)
				this.storeClientPropertyOverallData({ prop: "timeZone", value: timezone })
			},
			setAlias({ option }) {
				if (this.currentClient.hasOwnProperty('aliases')) {
					if (this.currentClient.aliases.length) {
						this.currentClientAliases = [ ...this.currentClient.aliases ]
					}
				}
				const position = this.currentClientAliases.indexOf(option)

				if (position !== -1) {
					this.currentClientAliases.splice(position, 1)
					this.storeClientPropertyOverallData({
						prop: "aliases",
						value: this.currentClientAliases
					})
				} else {
					this.currentClientAliases.push(option)
					this.storeClientPropertyOverallData({
						prop: "aliases",
						value: this.currentClientAliases
					})
				}
			},
			setTarget({ option }) {
				if (this.currentClient.hasOwnProperty('targetLanguages')) {
					if (this.currentClient.targetLanguages.length) {
						this.currentTargetLanguages = [ ...this.currentClient.targetLanguages ]
					}
				}
				const position = this.currentTargetLanguages
						.map(item => item.lang)
						.indexOf(option)

				if (position !== -1) {
					this.currentTargetLanguages.splice(position, 1)
					this.storeClientPropertyOverallData({
						prop: "targetLanguages",
						value: this.currentTargetLanguages
					})
				} else {
					const lang = this.languages.find(item => item.lang === option)
					this.currentTargetLanguages.push(lang)
					this.storeClientPropertyOverallData({
						prop: "targetLanguages",
						value: this.currentTargetLanguages
					})
				}
			},
			setSource({ option }) {
				if (this.currentClient.hasOwnProperty('sourceLanguages')) {
					if (this.currentClient.sourceLanguages.length) {
						this.currentSourceLanguages = [ ...this.currentClient.sourceLanguages ]
					}
				}
				const position = this.currentSourceLanguages
						.map(item => item.lang)
						.indexOf(option)

				if (position !== -1) {
					this.currentSourceLanguages.splice(position, 1)
					this.storeClientPropertyOverallData({
						prop: "sourceLanguages",
						value: this.currentSourceLanguages
					})
				} else {
					const lang = this.languages.find(item => item.lang === option)
					this.currentSourceLanguages.push(lang)
					this.storeClientPropertyOverallData({
						prop: "sourceLanguages",
						value: this.currentSourceLanguages
					})
				}
			},
			selectedSource() {
			}
		},
		computed: {
			...mapGetters({
				currentClient: "currentClientOverallData"
			}),
			clientAliases() {
				if (this.allClientAliases) {
					return this.allClientAliases
				}
			},
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
				if (
						this.currentClient.industries &&
						this.currentClient.industries.length
				) {
					for (let industry of this.currentClient.industries) {
						result.push(industry.name)
					}
				}
				return result
			}
		},
		components: {
			Asterisk,
			ClientStatusSelect,
			AMSelect,
			MultiClientIndustrySelect,
			SelectSingle,
			SelectMulti
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

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
      width: 210px;
      height: 32px;
    }

    &_high-index {
      z-index: 10;
    }

    &_medium-index {
      z-index: 8;
    }

    input {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 210px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
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
