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
            :options="languages.map(i => i.lang)"
            @chooseOption="setLanguage"
          )
      .block-item(v-if="!isIndividual")
        label.block-item__label Website:
        input(type="text" placeholder="Website" v-model="client.website")

</template>

<script>
	import Asterisk from "@/components/Asterisk"
	import scrollDrop from "@/mixins/scrollDrop"
	import SelectSingle from "../../SelectSingle"
	import SelectMulti from "../../SelectMulti"

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
			timezones: {
				type: Array
			},
      languages: {
	      type: Array
      }
		},
		data() {
			return {
				asteriskStyle: { top: "-4px" },
				currentZone: "",
				currentLanguage: ""
			}
		},
		methods: {
			setLanguage({ option }) {
				this.currentLanguage = option
				this.client.nativeLanguage = this.languages.find(item => item.lang === option)
			},
			setTimezone({ option }) {
				this.currentZone = option
				this.client.timeZone = this.timezones.find(item => item.zone === option)
			}
		},
		computed: {
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
      width: 41%;
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
    height: 32px;

    &__check-item {
      width: 220px;
    }

    &__label {
      margin-bottom: 0;
    }

    &_relative {
      position: relative;
    }

    &__drop {
      position: relative;
      width: 220px;
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
      width: 220px;
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
