<template lang="pug">
  .ratio
    .ratio__title Currency ratio:          
    .ratio__element 1 &euro;
    .ratio__element =
    .ratio__element
      .ratio__input
        input(type="number" v-model="currencyUsd")
        span.ratio__input-symbol &#36;
    .ratio__element =
    .ratio__element
      .ratio__input
        input(type="number" v-model="currencyGbp")
        span.ratio__input-symbol &pound;
    .ratio__element(v-if="defaultUsd == currencyUsd && defaultGbp == currencyGbp")
      .ratio__button
        .ratio__no-active
          img(src="../../../assets/images/Other/save-icon-qa-form.png")
    .ratio__element(v-else)
      .ratio__button(@click="saveCurrency(), refreshPage()")
        img(src="../../../assets/images/Other/save-icon-qa-form.png")


</template>
<script>
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {
				currencyId: null,
				currencyUsd: null,
				currencyGbp: null,

				defaultUsd: null,
				defaultGbp: null
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			refreshPage() {
				this.$emit('refreshPage')
			},
			refreshResultTable() {
				this.$emit('refreshResultTable')
			},
			async getCurrency() {
				try {
					const result = await this.$http.get("/currency/currency-ratio")
					this.currencyId = result.data._id
					this.currencyUsd = this.defaultUsd = result.data.USD
					this.currencyGbp = this.defaultGbp = result.data.GBP
				} catch (err) {
					this.alertToggle({
						message: "Error on getting currency",
						isShow: true,
						type: "error"
					})
				}
			},
			async saveCurrency() {
				try {
					const result = await this.$http.post("/currency/currency-ratio", {
						currencyRatio: {
							_id: this.currencyId,
							USD: this.currencyUsd,
							GBP: this.currencyGbp
						}
					})
					this.getCurrency()
					this.refreshResultTable()
					this.alertToggle({ message: "Currency saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on updating currency", isShow: true, type: "error" })
				}
			}
		},
		created() {
			this.getCurrency()
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .ratio {
    padding-top: 20px;
    padding-left: 20px;
    display: flex;
    align-items: center;

    &__no-active {
      opacity: 0.5;
      cursor: default;
    }

    &__input {
      &-symbol {
        margin-left: 3px;
      }
    }

    &__button {
      cursor: pointer;
      height: 20px;
      margin-left: 2px;
    }

    &__element {
      margin-left: 10px;
    }
  }

  input {
    color: $text;
    height: 30px;
    border-radius: 2px;
    width: 55px;
    border: 1px solid $border;
    padding: 0 8px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

  input:focus {
    outline: none;
  }
</style>