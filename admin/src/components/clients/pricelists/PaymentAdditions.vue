<template lang="pug">
  .payment-additions
    .payment-additions__block
      .payment-additions__title
        .payment-additions__title-name Receivables Additions:
        .payment-additions__title-value {{allDiscountsValue}} €
        .payment-additions__title-add-new
          .add-button(@click="addData")
            .add-button__icon
              i.fas.fa-plus

      .payment-additions__lists
        .payment-additions__list(v-for="(item, index) in enumPaymentAdditions")

          .payment-additions__list-name(v-if="item.name")
            span(:style="textMargin") {{item.name}}

          .payment-additions__list-dropMenu(v-else)
            input(type="text" v-model="name" )
            //SelectSingle(
            //  :isTableDropMenu="true",
            //  placeholder="Select",
            //  :hasSearch="true",
            //  :selectedOption="currentPaymentAdditions.name || ''",
            //  :options="filteredDiscounts",
            //  @chooseOption="setDiscount"
            //)

          .payment-additions__list-value
            span(v-if="item.value") {{item.value}} €
            input(v-else type="number" v-model="value" )
            //span(v-if="currentPaymentAdditions.value && !item.value") {{currentPaymentAdditions.value}} &#37;

          //.payment-additions__list-icons(v-if="paramsIsEdit")
          .payment-additions__list-icons
            .new-payment-additions(v-if="!item.value")
              i(class="fas fa-save"  @click="checkErrors")
              i(class="fas fa-times" @click="cancelAdding")
            .new-payment-additions(v-else)
              i( class="fas fa-trash" @click="deleteDiscount(item)")
            //img.icon( :src="icons.delete.icon" @click="deleteDiscount(item._id)")
            //img.icon(v-if="item._id" :src="icons.delete.icon" @click="deleteDiscount(item._id)")
            //img.icon(v-else :src="icons.save.icon" @click="checkErrors()")
          //.payment-additions__list-icons(v-else)
          //  img.icon(:src="icons.delete.icon")

    //.payment-additions__add(v-if="paramsIsEdit")

</template>

<script>
	import crudIcons from "@/mixins/crudIcons"
	import SelectSingle from "../../SelectSingle"
	import Add from "../../Add"
	import { mapActions } from 'vuex'

	export default {
		mixins: [ crudIcons ],
		props: {
			// paramsIsEdit: {
			// 	type: Boolean
			// },
			enum: {
				type: String
			}
		},
		data() {
			return {
				textMargin: { 'padding-left': '7px' },
				enumPaymentAdditions: [],
				// allDiscounts: [],
				currentActive: -1,
				currentPaymentAdditions: {},
				// areErrors: false,
				errors: [],
        name: '',
        value: '',
			}
		},
		methods: {
			...mapActions([ 'alertToggle', 'setCurrentProject' ]),

			// setDiscount({ option }) {
			// 	this.currentPaymentAdditions = this.allDiscounts.find(item => item.name === option)
			// },
			setEditionData(index) {
				this.currentActive = index
				this.currentPaymentAdditions = this.enumPaymentAdditions[index]
			},
			addData() {
				if (this.currentActive !== -1) return this.isEditing()
				this.enumPaymentAdditions.push({
					name: "",
					value: "",
				})
				this.setEditionData(this.enumPaymentAdditions.length - 1)
				// this.$nextTick(() => this.scrollToEnd());
			},
			cancelAdding() {
        this.enumPaymentAdditions.pop()
        this.cancel()
      },
			// scrollToEnd() {
			// 	const element = this.$el.querySelector('.payment-additions__lists');
			// 	element.scrollTop = element.scrollHeight
			// },
			cancel() {
			  this.name = ''
			  this.value = ''
				this.currentActive = -1
				this.currentPaymentAdditions = {}
			},
			async checkErrors() {
				if (this.currentActive === -1) return
				this.errors = []
				if(!this.name) this.errors.push("Name should not be empty!");
				if(!this.value && isNaN(parseFloat(this.value)))  this.errors.push("Value should be numeric!");
				if (this.errors.length) {
					// this.areErrors = true
          this.alertToggle({ message: this.errors[0], isShow: true, type: "error" })
					return
				}
				await this.saveChanges()
			},
			updateEnumData(result) {
        this.setCurrentProject(result.data)
				// this.enum === 'PngSysProject' && this.setCurrentProject(result.data)
				// this.enum === 'XTRFProject' && this.$emit('updateXTRFProject', result.data)
			},
			async saveChanges() {
				this.enumPaymentAdditions = this.enumPaymentAdditions.filter(({ name }) => name)
				// const updatedArray = this.enumPaymentAdditions
				// updatedArray.push()
				try {
          const result = await this.$http.post(this.setCurrentRoutes.update, { _id: this.$route.params.id, addItem: {name: this.name, value: this.value} })
          await this.updateEnumData(result)
          this.enumPaymentAdditions = result.data.paymentAdditions
          this.alertToggle({ message: "Payment Additions Saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Payment Additions", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			},
			async deleteDiscount(deleteItem) {
				try {
          const result = await this.$http.post(this.setCurrentRoutes.delete, { _id: this.$route.params.id, deleteItem})
					await this.updateEnumData(result)
          this.enumPaymentAdditions = result.data.paymentAdditions
					this.alertToggle({ message: "Payment Additions Deleted!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on deleting", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			},
			async getEnumDiscounts() {
				try {
					const result = await this.$http.get(this.setCurrentRoutes.get + `${ this.$route.params.id }`)
          console.log(result.data)
					this.enumPaymentAdditions = result.data.paymentAdditions
				} catch (err) {
					this.alertToggle({ message: "Error on getting Payment Additions", isShow: true, type: "error" })
				}
			},
			// async getDiscounts() {
			// 	try {
			// 		const result = await this.$http.get("/pm-manage/payment-additions")
			// 		this.allDiscounts = result.data
			// 	} catch (err) {
			// 		this.alertToggle({ message: "Error on getting All Discounts", isShow: true, type: "error" })
			// 	}
			// }
		},
		watch: {
			// paramsIsEdit(newValue, oldValue) {
			// 	// if (oldValue && !newValue) this.enumPaymentAdditions = this.enumPaymentAdditions.filter(({ name }) => name)
			// 	if (!newValue) {
			// 		this.enumPaymentAdditions = this.enumPaymentAdditions.filter(item => !!item.name)
			// 		this.cancel()
			// 	}
			// }
		},
		created() {
			this.getEnumDiscounts()
			// this.getDiscounts()
		},
		computed: {
			setCurrentRoutes() {
				if (this.enum) switch (this.enum) {
					// case 'client':
					// 	return {
					// 		get: '/clientsapi/get-client-payment-additions/?id=',
					// 		update: '/clientsapi/update-client-payment-additions'
					// 	}
					case 'PngSysProject':
						return {
							get: '/pm-manage/get-project-payment-additions/?id=',
							update: '/pm-manage/update-project-payment-additions',
							delete: '/pm-manage/delete-project-payment-additions'
						}
					// case 'XTRFProject':
					// 	return {
					// 		get: '/memoqapi/get-project-payment-additions/?id=',
					// 		update: '/memoqapi/update-project-payment-additions'
					// 	}
				}

			},
			filteredDiscounts() {
				return this.allDiscounts
						.filter(allItem => !this.enumPaymentAdditions.filter(item => item.name)
								.map(item => item.name)
								.includes(allItem.name))
						.map(item => item.name)
			},
			allDiscountsValue() {
				return this.enumPaymentAdditions.filter(item => item.name).reduce((acc, curr) => {
					acc += +curr.value
					return acc
				}, 0)
			}
		},
		components: {
			Add,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  @import "../../../assets/styles/settingsTable";

  .payment-additions {
    display: block;

    &__block {
      border: 1px solid $border;
      width: 356px;
    }

    &__title {
      height: 40px;
      line-height: 40px;
      padding-left: 7px;
      border-bottom: 1px solid $border;
      display: flex;
      align-items: center;

      &-name {
        width: 225px;
        font-size: 14px;
        height: 40px;
        font-family: 'Myriad600';
      }

      &-value {
        width: 75px;
        font-size: 14px;
        font-family: 'Myriad600';
      }
      &-add-new {
        width: 50px;
        font-size: 14px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    &__add {
      margin-top: 10px;
    }

    &__lists {
      /*max-height: 93px;*/
      /*overflow-y: scroll;*/
    }

    &__list {
      display: flex;
      height: 40px;
      border-bottom: 1px solid $light-border;
      align-items: center;

      &-dropMenu {
        position: relative;
        width: 211px;
        height: 32px;
        margin: 0 7px;
      }

      &-name {
        width: 225px;
        font-size: 14px;
        display: flex;
        align-items: center;
        height: 40px;
      }

      &-value {
        width: 75px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid $light-border;
        height: 40px;
        padding: 0 7px;
      }



      &-icons {
        width: 50px;
        border-left: 1px solid $light-border;

        .new-payment-additions {
          padding-top: 4px;
          height: 40px;
          display: flex;
          align-items: center;
          font-size: 18px;
          justify-content: space-around;
        }
        
        & i {
          cursor: pointer;
        }
        
      }
    }
  }

  .opacity {
    cursor: default;
    opacity: 0.5;
  }

  .icon {
    cursor: pointer;
  }


  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 100%;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .add-button {
    width: 25px;
    height: 25px;
    border: 1px solid $border;
    border-radius: 4px;
    cursor: pointer;
    transition: .2s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      .add-button__icon {
        color: $text;
      }
    }

    &__icon {
      font-size: 15px;
      color: $dark-border;
      margin-top: 1px;
    }

  }

</style>
