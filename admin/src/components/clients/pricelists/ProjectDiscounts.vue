<template lang="pug">
  .discounts
    .discounts__block
      GeneralTable(
        :fields="fields"
        :tableData="discounts"
        :isBodyShort="true"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteDiscount"
        @closeModal="cancel"
        @notApprove="cancel"
      )
        template(slot="headerDiscount" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="discount" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.name }}
          .table__drop(v-else)
            SelectSingle(
              :isTableDropMenu="true",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentDiscount.name || ''",
              :options="filteredDiscounts",
              @chooseOption="setDiscount"
            )
        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")

    .discounts__add(v-if="true")
      Add(@add="addData")

</template>

<script>
	import crudIcons from "@/mixins/crudIcons"
	import SelectSingle from "../../SelectSingle"
	import GeneralTable from "../../GeneralTable"
	import Add from "../../Add"
  import { mapActions, mapGetters } from 'vuex'

	export default {
		mixins: [ crudIcons ],
		props: {
			paramsIsEdit: {
				type: Boolean
			},
			enum: {
				type: String
			},
      test: {
			  type: Array,
        default: () => []
      }
		},
		data() {
			return {
				fields: [
					{
						label: "Discount/Surcharge",
						headerKey: "headerDiscount",
						key: "discount",
						style: { width: "65%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "35%" }
					}
				],
        discounts: this.test,
				allDiscounts: [],
				currentActive: -1,
				currentDiscount: {},
				areErrors: false,
				errors: [],
        isDeleting: false,
        deleteIndex: -1,
			}
		},
		methods: {
			...mapActions([ 'alertToggle', 'setCurrentProject' ]),
      async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				if (key === "save") {
					await this.checkErrors(index)
				}
				if (key === "edit") {
					this.setEditionData(index)
				}
				if (key === "cancel") {
					if (this.currentActive === -1) return
					this.cancel()
          await this.getdiscounts()
				}
				if (key === "delete") {
					if (!this.discounts[index]._id) {
						this.discounts.splice(index, 1)
						return this.cancel()
					}
					this.deleteIndex = index
					this.isDeleting = true
				}
			},
			closeErrors() {
				this.areErrors = false
			},
			setDiscount({ option }) {
				this.currentDiscount = this.allDiscounts.find(item => item.name === option)
			},
			setEditionData(index) {
				this.currentActive = index
				this.currentDiscount = this.discounts[index]
			},
			addData() {
				if (this.currentActive !== -1) return this.isEditing()
				this.discounts.push({
					name: "",
					value: "",
					isActive: true
				})
				this.setEditionData(this.discounts.length - 1)
			},
			cancel() {
				this.currentActive = -1
				this.currentDiscount = {},
        this.deleteIndex = -1
				this.isDeleting = false
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if(!this.currentDiscount.name) this.errors.push("Discount/Surcharge should not be empty!");
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.saveChanges(index)
			},
			updateEnumData(result) {
				this.setCurrentProject(result.data)
			},
			async saveChanges(index) {
				this.discounts = this.discounts.filter(({ name }) => name)
				const updatedArray = this.discounts

        if(!this.currentDiscount._id) updatedArray.push(this.currentDiscount)
        else updatedArray.splice(index, 1, this.currentDiscount)
			
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
				this.discounts = this.discounts.filter((item, index) => index !== this.deleteIndex)
				try {
					const result = await this.$http.post(this.setCurrentRoutes.update, { _id: this.$route.params.id, updatedArray: this.discounts })
					this.updateEnumData(result)
					this.alertToggle({ message: "Discount/Surcharges Saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on deleting", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			},
			async getdiscounts() {
				try {
					// const result = await this.$http.get(this.setCurrentRoutes.get + `${ this.$route.params.id }`)
					this.discounts = this.currentProject.discounts
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
				if (!newValue) {
					this.discounts = this.discounts.filter(item => !!item.name)
					this.cancel()
				}
			}
		},
		created() {
			// this.getdiscounts()
			this.getDiscounts()
		},
		computed: {
		  ...mapGetters({
        currentProject: "getCurrentProject"
      }),
			setCurrentRoutes() {
						return {
							get: '/pm-manage/get-project-discounts/?id=',
							update: '/pm-manage/update-project-discounts'
						}
			},
			filteredDiscounts() {
				return this.allDiscounts
						.filter(allItem => !this.discounts.filter(item => item.name)
								.map(item => item.name)
								.includes(allItem.name))
						.map(item => item.name)
			},
			allDiscountsValue() {
				return this.discounts.filter(item => item.name).reduce((acc, curr) => {
					acc += curr.value
					return acc
				}, 0)
			}
		},
		components: {
			Add,
			SelectSingle,
			GeneralTable
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
    .discounts{
      max-width: 400px;
    }

    .table {
    width: 100%;

    &__data {
      padding: 0 7px;
    }

    &__header {
      padding: 0 7px;
    }

    &__drop {
      position: relative;
      height: 32px;
      max-width: 220px;
      margin: 0 7px;
      width: 100%;
      background: white;
      border-radius: 4px;
    }

    &__icons {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 8px;
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
    }

    &__opacity {
      opacity: 1;
    }

    &__input {
      width: 100%;
      padding: 0 7px;
    }
  }
</style>
