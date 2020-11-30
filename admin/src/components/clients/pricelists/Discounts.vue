<template lang="pug">
  .discounts
    .discounts__block
      .discounts__title
        .discounts__title-name Discount/Surcharge total:
        .discounts__title-value {{allDiscountsValue}}  &#37;

      .discounts__lists
        .discounts__list(v-for="(item, index) in clientDiscounts")

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

          .discounts__list-icons(v-if="ratesParamsIsEdit")
            img.icon(v-if="item._id" :src="icons.delete.icon" @click="deleteDiscount(item._id)")
            img.icon(v-else :src="icons.save.icon" @click="checkErrors()")
          .discounts__list-icons(v-else)
            img.opacity(:src="icons.delete.icon")

    .discounts__add(v-if="ratesParamsIsEdit")
      Add(@add="addData")

</template>

<script>
	import crudIcons from "@/mixins/crudIcons";
	import SelectSingle from "../../SelectSingle"
	import Add from "../../Add";
	import { mapActions } from 'vuex';

	export default {
		mixins: [crudIcons],
		props: {
			ratesParamsIsEdit: {
				type: Boolean
			}
		},
		data() {
			return {
				icons: {
					save: { icon: require("../../../assets/images/Other/save-icon-qa-form.png") },
					delete: { icon: require("../../../assets/images/Other/delete-icon-qa-form.png") }
				},
				textMargin: { 'padding-left': '5px' },
				clientDiscounts: [],
				allDiscounts: [],
				currentActive: -1,
				currentDiscount: {},
				areErrors: false,
				errors: [],
			}
		},
		methods: {
			...mapActions(['alertToggle']),

			setDiscount({ option }) {
				this.currentDiscount = this.allDiscounts.find(item => item.name === option);
			},
			setEditionData(index) {
				this.currentActive = index;
				this.currentDiscount = this.clientDiscounts[index];
			},
			addData() {
				if(this.currentActive !== -1) return this.isEditing();
				this.clientDiscounts.push({
					name: "",
					value: "",
					isActive: true,
				});
				this.setEditionData(this.clientDiscounts.length - 1);
				// this.$nextTick(() => this.scrollToEnd());
			},
			// scrollToEnd() {
			// 	const element = this.$el.querySelector('.discounts__lists');
			// 	element.scrollTop = element.scrollHeight
			// },
			cancel() {
				this.currentActive = -1;
				this.currentDiscount = {};
			},
			async checkErrors() {
				if(this.currentActive === -1) return;
				this.errors = [];
				// if(!this.currentName) this.errors.push("Name should not be empty!");
				// if(!this.currentValue) this.errors.push("Value should not be empty!");
				if(this.errors.length) {
					this.areErrors = true;
					return
				}
				await this.saveChanges();
			},
			async saveChanges() {
				this.clientDiscounts = this.clientDiscounts.filter(({ name }) => name);
				const updatedArray = this.clientDiscounts;
				updatedArray.push(this.currentDiscount);
				try {
					const result = await this.$http.post('/clientsapi/update-client-discounts', { _id: this.$route.params.id, updatedArray });
					this.alertToggle({ message: "Discount/Surcharges Saved!", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Error on saving Discount/Surcharges", isShow: true, type: "error" });
				} finally {
					this.cancel();
				}
			},
			async deleteDiscount(id) {
				this.clientDiscounts = this.clientDiscounts.filter(item => item._id.toString() !== id.toString());
				try {
					const result = await this.$http.post('/clientsapi/update-client-discounts', { _id: this.$route.params.id, updatedArray: this.clientDiscounts, });
					this.alertToggle({ message: "Discount/Surcharges Saved!", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Error on deleting", isShow: true, type: "error" });
				} finally {
					this.cancel();
				}
			},
			async getClientDiscounts() {
				try {
					const result = await this.$http.get(`/clientsapi/get-client-discounts/?id=${ this.$route.params.id }`);
					this.clientDiscounts = result.data.discounts;
				} catch (err) {
					this.alertToggle({ message: "Error on getting Client Discounts", isShow: true, type: "error" });
				}
			},
			async getDiscounts() {
				try {
					const result = await this.$http.get("/pm-manage/discounts");
					this.allDiscounts = result.data;
				} catch (err) {
					this.alertToggle({ message: "Error on getting All Discounts", isShow: true, type: "error" });
				}
			},
		},
		created() {
			this.getClientDiscounts();
			this.getDiscounts();
		},
		computed: {
			filteredDiscounts() {
				return this.allDiscounts
						.filter(allItem => !this.clientDiscounts.filter(item => item.name)
								.map(item => item.name)
								.includes(allItem.name))
						.map(item => item.name);
			},
			allDiscountsValue() {
				return this.clientDiscounts.filter(item => item.name).reduce((acc, curr) => {
					acc += curr.value;
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
    &__block {
      border-top: 2px solid #938676;
      border-left: 2px solid #938676;
      border-right: 2px solid #938676;
      border-bottom: 1px solid #938676;
      width: 360px;
    }

    &__title {
      height: 30px;
      line-height: 30px;
      padding-left: 5px;
      background: #f4f0ee;
      border-bottom: 1px solid #938676;
      display: flex;

      &-name {
        width: 245px;
        font-size: 14px;

      }

      &-value {
        width: 55px;
        text-align: center;
        font-size: 14px;

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
      height: 30px;
      line-height: 30px;
      border-bottom: 1px solid #938676;

      &-dropMenu {
        position: relative;
        width: 250px;
      }

      &-name {
        width: 250px;
        font-size: 14px;
      }

      &-value {
        width: 55px;
        font-size: 14px;
        text-align: center;
      }

      &-icons {
        width: 55px;
        border-left: 1px solid #938676;
        text-align: center;
        padding-top: 4px;
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