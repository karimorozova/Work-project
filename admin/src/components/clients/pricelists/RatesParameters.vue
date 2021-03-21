<template lang="pug">
  .ratesParams
    .pricelist-infoBlock
      .rates
        .rates-item
          .rates-item__title Pricelist:
          .rates-item__input(v-if="currentClient.defaultPricelist") {{currentClient.defaultPricelist.name}}
        .rates-item
          .rates-item__title Currency:
          .rates-item__input {{currentClient.currency}}
        .rates-item
          .rates-item__title Min Price:
          .rates-item__input
            .ratio__input
              input(v-if="ratesParamsIsEdit" type="number" ref="minPrice" :value="currentClient.minPrice" @change="updateMinPrice")
              span(v-else) {{ currentClient.minPrice }}
              span.ratio__input-symbol(v-html="getSymbol(currentClient.currency)")
        //.rates-item
          .rates-item__title Ignore Min Price:
          .rates-item__input
            .checkbox
              input(type="checkbox" id="ignoreMinPrice" v-model="ignoreMinPrice" @change="setTest")
              label(for="ignoreMinPrice")
    .discounts
      Discounts(
        :paramsIsEdit="ratesParamsIsEdit",
        :enum="'client'"
      )
      .actionsButton
        .actionsButton__icon
          img.defaultIcon(v-if="!ratesParamsIsEdit" :src="icons.edit.icon" @click="crudActions('edit')")
          img.opacity(v-else :src="icons.edit.icon")
        .actionsButton__icon
          img.defaultIcon(v-if="ratesParamsIsEdit" :src="icons.cancel.icon" @click="crudActions('cancel')")
          img.opacity(v-else :src="icons.cancel.icon")


</template>
<script>
	import { mapGetters, mapActions } from 'vuex'
	import Discounts from "./Discounts"

	export default {
		components: { Discounts },
		data() {
			return {
				icons: {
					edit: { icon: require("../../../assets/images/Other/edit-icon-qa.png") },
					cancel: { icon: require("../../../assets/images/cancel-icon.png") }
				},
				ignoreMinPrice: false,
				ratesParamsIsEdit: false
			}
		},
		methods: {
			...mapActions([ 'storeClientProperty', 'alertToggle' ]),
			crudActions(actionType) {
				switch (actionType) {
					case 'cancel':
						this.ratesParamsIsEdit = false
						break
					case 'edit':
						this.ratesParamsIsEdit = true
						break
				}
			},
			async updateMinPrice() {
				try {
					await this.$http.put('/clientsapi/set-min-price', {
						_id: this.currentClient._id,
						value: this.$refs.minPrice.value
					})
					this.storeClientProperty({ prop: 'minPrice', value: this.$refs.minPrice.value })
					this.alertToggle({ message: "Minimum Price saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({
						message: 'Client\'s minimum price is not updated!',
						isShow: true,
						type: 'error'
					})
				}
				// this.storeClientProperty({ prop, value: e.target.value });
			},
			getSymbol(currency) {
				return currency === 'USD' ?
						'&ensp;&#36;' :
						currency === 'EUR' ? '&ensp;&euro;' : '&ensp;&pound'
			},
			async setTest() {
				// this.storeClientProperty({
				//   prop: "ignoreMinPrice",
				//   value: event.target.checked
				// });
				try {
					await this.$http.put('/clientsapi/toggle-ignore-min-price', {
						_id: this.currentClient._id,
						value: this.ignoreMinPrice
					})
				} catch (err) {
					this.alertToggle({
						message: 'Client\'s ignoreMinPrice is not updated!',
						isShow: true,
						type: 'error'
					})
				}
			}
		},
		mounted() {
			// this.minPrice = this.currentClient.minPrice;
			// this.ignoreMinPrice = this.currentClient.ignoreMinPrice;
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			})
		}
	}
</script>
<style lang="scss" scoped>
  .ratesParams {
    display: flex;
    justify-content: space-between;
    position: relative;
    padding-bottom: 20px;
    border-bottom: 1px solid #C5BFB5;
  }

  .discounts {
    display: flex;
  }

  .actionsButton {
    display: flex;
    padding-left: 20px;

    &__icon {
      margin-left: 5px;
    }
  }

  .defaultIcon {
    cursor: pointer;
  }

  .opacity {
    opacity: .5;
    cursor: default;
  }

  .rates {
    display: flex;
    padding: 20px;
    background: #F2EFEB;
    border: 2px solid #938676;
    flex-direction: column;

    .rates-item {
      width: 231px;
      min-height: 30px;
      display: flex;
      align-items: center;

      &__title {
        width: 90px;
      }
    }
  }

  #ignoreMinPrice {
    width: 0;
  }

  .checkbox {
    display: flex;
    height: 20px;
    margin-top: -3px;

    input[type="checkbox"] {
      opacity: 0;

      + {
        label {
          &::after {
            content: none;
          }
        }
      }

      &:checked {
        + {
          label {
            &::after {
              content: "";
            }
          }
        }
      }
    }

    label {
      position: relative;
      display: inline-block;

      &::before {
        position: absolute;
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border: 1px solid;
        left: 0px;
        top: 3px;
      }

      &::after {
        position: absolute;
        content: "";
        display: inline-block;
        height: 5px;
        width: 9px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(-45deg);
        left: 4px;
        top: 7px;
      }
    }
  }


  input {
    color: #67573e;
    height: 22px;
    border-radius: 5px;
    width: 70px;
    border: 1px solid #67573e;
  }

  input {
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  input:focus {
    outline: none;
  }
</style>
