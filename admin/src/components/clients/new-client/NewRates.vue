<template lang="pug">
  .rates-info
    .block-item
      .block-item__title Pricelist:
        span.require *
      .block-item__input(:class="{'rates-info_error-shadow': !client.defaultPricelist && isSaveClicked}")
        SelectSingle(
          placeholder="Select"
          :selectedOption="clientPricelist"
          :options="pricelistsData"
          @chooseOption="setPricelist"
        )
    .block-item
      .block-item__title Currency:
        span.require *
      .block-item__input(:class="{'rates-info_error-shadow': !client.currency.length && isSaveClicked}")
        SelectSingle(
          placeholder="Select"
          :selectedOption="clientCurrency"
          :options="['EUR','USD','GBP']"
          @chooseOption="setCurrency"
        )
</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import { mapActions } from "vuex"

	export default {
		props: {
			client: {
				type: Object
			},
			isSaveClicked: {
				type: Boolean
			}
		},
		data() {
			return {
				pricelists: []
			}
		},
		computed: {
			clientPricelist() {
				if (this.pricelists.length) {
					if (!this.client.defaultPricelist.hasOwnProperty('name')) {
						const activePricelists = this.pricelists.filter(i => i.isActive)
						this.client.defaultPricelist = activePricelists.find(pricelist => true)
					}
					return this.client.defaultPricelist.name
				}
			},
			clientCurrency() {
				return !this.client.currency ? this.client.currency = 'EUR' : this.client.currency
			},
			pricelistsData() {
				return this.pricelists.filter(i => i.isActive).map(i => i.name)
			}
		},
		methods: {
			...mapActions([ "alertToggle" ]),
			async getPricelists() {
				try {
					const result = await this.$http.get("/prices/pricelists")
					this.pricelists = result.body
				} catch (err) {
					this.alertToggle({
						message: "Error on getting pricelists.",
						isShow: true,
						type: "error"
					})
				}
			},
			setPricelist({ option }) {
				this.client.defaultPricelist = this.pricelists.find(
						i => i.name === option
				)
			},
			setCurrency({ option }) {
				this.client.currency = option
			}
		},
		created() {
			this.getPricelists()
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .rates-info {
    display: flex;
    padding: 8px;

    &_error-shadow {
      box-shadow: 0 0 5px $red;
      height: 31px;
    }

    .block-item {
      width: 350px;
      display: flex;

      &__title {
        width: 100px;
      }

      &__input {
        width: 220px;
        position: relative;
        margin-top: -6px;
      }
    }

    .require {
      font-size: 14px;
      color: red;
      margin-left: 2px;
    }
  }
</style>
