<template lang="pug">
  .discounts
    .discounts__block
      .discounts__title
        .discounts__title-name Discount/Surcharge total:
        .discounts__title-value {{allDiscountsValue}}  &#37;

      .discounts__lists
        .discounts__list(v-for="(item, index) in enumDiscounts")

          .discounts__list-name(v-if="item.name")
            span(:style="textMargin") {{item.name}}

          .discounts__list-dropMenu(v-else)
            SelectSingle(
              :isTableDropMenu="true",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentDiscount.name || ''",
              :options="filteredDiscounts",
              @chooseOption="setDiscount"
            )

          .discounts__list-value
            span(v-if="item.value") {{item.value}} &#37;
            span(v-if="currentDiscount.value && !item.value") {{currentDiscount.value}} &#37;

          .discounts__list-icons(v-if="paramsIsEdit")
            img.icon(v-if="item._id" :src="icons.delete.icon" @click="deleteDiscount(item._id)")
            img.icon(v-else :src="icons.save.icon" @click="checkErrors()")
          .discounts__list-icons(v-else)
            img.opacity(:src="icons.delete.icon")

    .discounts__add(v-if="paramsIsEdit")
      Add(@add="addData")

</template>

<script>
	import crudIcons from "@/mixins/crudIcons"
	import SelectSingle from "../../SelectSingle"
	import Add from "../../Add"
	import { mapActions } from 'vuex'

	export default {
		mixins: [ crudIcons ],
		props: {
			paramsIsEdit: {
				type: Boolean
			},
			enum: {
				type: String
			}
		},
		data() {
			return {
				icons: {
					save: { icon: require("../../../assets/images/Other/save-icon-qa-form.png") },
					delete: { icon: require("../../../assets/images/Other/delete-icon-qa-form.png") }
				},
				textMargin: { 'padding-left': '7px' },
				enumDiscounts: [],
				allDiscounts: [],
				currentActive: -1,
				currentDiscount: {},
				areErrors: false,
				errors: []
			}
		},
		methods: {
			...mapActions([ 'alertToggle', 'setCurrentProject' ]),

			setDiscount({ option }) {
				this.currentDiscount = this.allDiscounts.find(item => item.name === option)
			},
			setEditionData(index) {
				this.currentActive = index
				this.currentDiscount = this.enumDiscounts[index]
			},
			addData() {
				if (this.currentActive !== -1) return this.isEditing()
				this.enumDiscounts.push({
					name: "",
					value: "",
					isActive: true
				})
				this.setEditionData(this.enumDiscounts.length - 1)
				// this.$nextTick(() => this.scrollToEnd());
			},
			// scrollToEnd() {
			// 	const element = this.$el.querySelector('.discounts__lists');
			// 	element.scrollTop = element.scrollHeight
			// },
			cancel() {
				this.currentActive = -1
				this.currentDiscount = {}
			},
			async checkErrors() {
				if (this.currentActive === -1) return
				this.errors = []
				// if(!this.currentName) this.errors.push("Name should not be empty!");
				// if(!this.currentValue) this.errors.push("Value should not be empty!");
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.saveChanges()
			},
			updateEnumData(result) {
				this.enum === 'PngSysProject' && this.setCurrentProject(result.data)
				this.enum === 'XTRFProject' && this.$emit('updateXTRFProject', result.data)
			},
			async saveChanges() {
				this.enumDiscounts = this.enumDiscounts.filter(({ name }) => name)
				const updatedArray = this.enumDiscounts
				updatedArray.push(this.currentDiscount)
				try {
					const result = await this.$http.post(this.setCurrentRoutes.update, { _id: this.$route.params.id, updatedArray })
					this.updateEnumData(result)
					this.alertToggle({ message: "Discount/Surcharges Saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Discount/Surcharges", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			},
			async deleteDiscount(id) {
				this.enumDiscounts = this.enumDiscounts.filter(item => item._id.toString() !== id.toString())
				try {
					const result = await this.$http.post(this.setCurrentRoutes.update, { _id: this.$route.params.id, updatedArray: this.enumDiscounts })
					this.updateEnumData(result)
					this.alertToggle({ message: "Discount/Surcharges Saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on deleting", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			},
			async getEnumDiscounts() {
				try {
					const result = await this.$http.get(this.setCurrentRoutes.get + `${ this.$route.params.id }`)
					this.enumDiscounts = result.data.discounts
				} catch (err) {
					this.alertToggle({ message: "Error on getting Discounts", isShow: true, type: "error" })
				}
			},
			async getDiscounts() {
				try {
					const result = await this.$http.get("/pm-manage/discounts")
					this.allDiscounts = result.data
				} catch (err) {
					this.alertToggle({ message: "Error on getting All Discounts", isShow: true, type: "error" })
				}
			}
		},
		watch: {
			paramsIsEdit(newValue, oldValue) {
				// if (oldValue && !newValue) this.enumDiscounts = this.enumDiscounts.filter(({ name }) => name)
				if (!newValue) {
					this.enumDiscounts = this.enumDiscounts.filter(item => !!item.name)
					this.cancel()
				}
			}
		},
		created() {
			this.getEnumDiscounts()
			this.getDiscounts()
		},
		computed: {
			setCurrentRoutes() {
				if (this.enum) switch (this.enum) {
					case 'client':
						return {
							get: '/clientsapi/get-client-discounts/?id=',
							update: '/clientsapi/update-client-discounts'
						}
					case 'PngSysProject':
						return {
							get: '/pm-manage/get-project-discounts/?id=',
							update: '/pm-manage/update-project-discounts'
						}
					case 'XTRFProject':
						return {
							get: '/memoqapi/get-project-discounts/?id=',
							update: '/memoqapi/update-project-discounts'
						}
				}

			},
			filteredDiscounts() {
				return this.allDiscounts
						.filter(allItem => !this.enumDiscounts.filter(item => item.name)
								.map(item => item.name)
								.includes(allItem.name))
						.map(item => item.name)
			},
			allDiscountsValue() {
				return this.enumDiscounts.filter(item => item.name).reduce((acc, curr) => {
					acc += curr.value
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

  .discounts {
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
        width: 234px;
        font-size: 14px;
        height: 40px;
        font-family: 'Myriad600';
      }

      &-value {
        width: 50px;
        text-align: center;
        font-size: 14px;
        font-family: 'Myriad600';
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
        width: 220px;
        height: 32px;
        margin: 0 7px;
      }

      &-name {
        width: 234px;
        font-size: 14px;
        display: flex;
        align-items: center;
        height: 40px;
      }

      &-value {
        width: 60px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid $light-border;
        height: 40px;
      }

      &-icons {
        width: 50px;
        border-left: 1px solid $light-border;
        text-align: center;
        padding-top: 4px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
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
</style>
