<template lang="pug">
  .ratesParams
    .pricelist-infoBlock
      .rates

        .rates-item
          .rates-item__title Pricelist:
          .rates-item__input(v-if="currentClient.defaultPricelist") {{currentClient.defaultPricelist.name}}
            .link(@click="goToPricelist(currentClient.defaultPricelist)")
              i.fas.fa-external-link-alt

        .rates-item
          .rates-item__title Currency:
          .rates-item__input {{currentClient.currency}}

        .rates-item
          .rates-item__title Min Price:
          .rates-item__input
            .ratio__input
              input(v-if="isEdit" type="number" ref="minPrice" :value="currentClient.minPrice" @change="updateMinPrice")
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
        :paramsIsEdit="isEdit",
        :enum="'client'"
      )

</template>
<script>
	import { mapGetters, mapActions } from 'vuex'
	import Discounts from "./Discounts"

	export default {
		components: { Discounts },
		props: {
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				icons: {
					edit: { icon: require("../../../assets/images/Other/edit-icon-qa.png") },
					cancel: { icon: require("../../../assets/images/cancel-icon.png") }
				},
				ignoreMinPrice: false
			}
		},
		methods: {
			...mapActions([ 'setUpClientProp', 'alertToggle' ]),
			goToPricelist({ _id }) {
				window.open(`/pangea-settings/pricelists/${ _id }`, '_blank')
			},
			async updateMinPrice() {
				try {
					await this.$http.put('/clientsapi/set-min-price', {
						_id: this.currentClient._id,
						value: this.$refs.minPrice.value
					})
					this.setUpClientProp({ _id: this.$route.params.id, key: 'minPrice', value: this.$refs.minPrice.value })
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
				// try {
				// 	await this.$http.put('/clientsapi/toggle-ignore-min-price', {
				// 		_id: this.currentClient._id,
				// 		value: this.ignoreMinPrice
				// 	})
				// } catch (err) {
				// 	this.alertToggle({
				// 		message: 'Client\'s ignoreMinPrice is not updated!',
				// 		isShow: true,
				// 		type: 'error'
				// 	})
				// }
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
  @import '../../../assets/scss/colors';

  .link {
    cursor: pointer;
  }

  .ratesParams {
    display: flex;
    justify-content: space-between;
    position: relative;
    padding-bottom: 20px;
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
    padding: 10px;
    background: $table-list;
    border: 1px solid $border;
    flex-direction: column;
    border-radius: 4px;

    .rates-item {
      min-height: 32px;
      display: flex;
      align-items: center;

      &__title {
        width: 100px;
      }

      &__input {
        width: 120px;
        display: flex;
        justify-content: space-between;
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
        border: 1px solid #c1bbb1;
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
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 80px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
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
