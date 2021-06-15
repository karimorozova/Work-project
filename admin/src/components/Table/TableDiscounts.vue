<template lang="pug">
  .discounts
    .discounts__table
      SettingsTable(
        :fields="fields"
        :tableData="discounts"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteIndustry"
        @notApprove="cancel"
        @closeModal="cancel"
      )
        template(slot="headerName" slot-scope="{ field }")
          .discounts__header {{ field.label }}
        template(slot="headerValue" slot-scope="{ field }")
          .discounts__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .discounts__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .discounts__header {{ field.label }}

        template(slot="name" slot-scope="{ row, index }")
          .discounts__data(v-if="currentActive !== index") {{ row.name }}
          .discounts__editing-data(v-else)
            input.discounts__input(type="text" v-model="currentName")

        template(slot="value" slot-scope="{ row, index }")
          .discounts__data(v-if="currentActive !== index") {{ row.value }} &#37;
          .discounts__editing-data(v-else)
            input.discounts__input(type="number" v-model="currentValue")

        template(slot="active" slot-scope="{ row, index }")
          .discounts__data.discounts_centered(:class="{'discounts_active': currentActive === index}")
            img.discounts__checkbox(
              v-if="row.isActive" src="../../assets/images/latest-version/checkbox-brown-1.png"
              @click="toggleActive(index)"
              :class="{'discounts_opacity': currentActive === index}"
            )
            img.discounts__checkbox(
              v-else
              src="../../assets/images/latest-version/checkbox-brown-0.png"
              @click="toggleActive(index)"
              :class="{'discounts_opacity': currentActive === index}"
            )
        template(slot="icons" slot-scope="{ row, index }")
          .discounts__icons
            img.discounts__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'discounts_opacity': isActive(key, index)}")

    Add(@add="addData")

</template>

<script>
	import SettingsTable from "./SettingsTable";
	import Add from "../Add";
	import { mapActions } from "vuex";
	import crudIcons from "@/mixins/crudIcons";

	export default {
		mixins: [crudIcons],
		data() {
			return {
				fields: [
					{ label: "Name", headerKey: "headerName", key: "name", width: "50%", padding: "0" },
					{ label: "Value", headerKey: "headerValue", key: "value", width: "14%", padding: "0" },
					{ label: "Active", headerKey: "headerActive", key: "active", width: "14%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "22%", padding: "0" },
				],
				discounts: [],
				currentName: "",
				currentValue: null,
				currentActive: -1,
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1
			}
		},
		methods: {
			toggleActive(index) {
				if(this.currentActive !== index) return;
				this.discounts[index].isActive = !this.discounts[index].isActive;
			},
			async makeAction(index, key) {
				if(this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing();
				}
				if(key === "save") {
					await this.checkErrors(index);
				}
				if(key === "edit") {
					this.setEditionData(index);
				}
				if(key === "cancel") {
					if(this.currentActive === -1) return;
					this.cancel();
					await this.getDiscounts();
				}
				if(key === "delete") {
					if(!this.discounts[index]._id) {
						this.discounts.splice(index, 1);
						return this.cancel();
					}
					this.deleteIndex = index;
					this.isDeleting = true;
				}
			},
			setEditionData(index) {
				this.currentActive = index;
				this.currentName = this.discounts[index].name;
				this.currentValue = +this.discounts[index].value;
			},
			async checkErrors(index) {
				if(this.currentActive === -1) return;
				this.errors = [];
				if(!this.currentName) this.errors.push("Name should not be empty!");
				if(!this.currentValue) this.errors.push("Value should not be empty!");
				if(this.errors.length) {
					this.areErrors = true;
					return
				}
				await this.saveChanges(index);
				this.cancel();
			},
			closeErrors() {
				this.areErrors = false;
			},
			async saveChanges(index) {
				const id = this.discounts[index]._id;
				const data = {
					name: this.currentName,
					value: this.currentValue,
					isActive: this.discounts[index].isActive,
				};
				try {
					!id ? await this.createNew(data) : await this.updateIndustry(id, data);
					await this.getDiscounts();
					this.alertToggle({ message: "Saved", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Error on saving discount", isShow: true, type: "error" });
				}
			},
			async createNew(newData) {
				try {
					await this.$http.post('/pm-manage/create-discount', {
						newDiscountObj: newData
					})
				} catch (err) {
					this.alertToggle({ message: "Error on saving discount", isShow: true, type: "error" });
				}
			},
			async updateIndustry(id, newData) {
				try {
					await this.$http.post('/pm-manage/update-discounts', {
						_id: id,
						values: newData
					})
				} catch (err) {
					this.alertToggle({ message: "Error on saving discount", isShow: true, type: "error" });
				}
			},
			async deleteIndustry() {
				try {
					await this.$http.post('/pm-manage/delete-discount', {
						_id: this.discounts[this.deleteIndex]._id
					});
					this.discounts.splice(this.deleteIndex, 1);
					this.alertToggle({ message: "Discount removed", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Error on removing Discount", isShow: true, type: "error" });
				}
				this.cancel();
			},
			cancel() {
				this.currentActive = -1;
				this.currentName = '';
				this.currentValue = null;
				this.isDeleting = false;
			},
			addData() {
				if(this.currentActive !== -1) return this.isEditing();
				this.discounts.push({
					name: "",
					value: "",
					isActive: true,
				});
				this.setEditionData(this.discounts.length - 1);
				this.$nextTick(() => this.scrollToEnd());
			},
			async getDiscounts() {
				try {
					const result = await this.$http.get("/pm-manage/discounts");
					this.discounts = result.data;
				} catch (err) {
					this.alertToggle({ message: "Error on getting Discounts", isShow: true, type: "error" });
				}
			},
			...mapActions({
				alertToggle: "alertToggle"
			}),
			scrollToEnd() {
				const element = this.$el.querySelector('.table__tbody');
				element.scrollTop = element.scrollHeight
			},
		},
		computed: {},
		components: {
			SettingsTable,
			Add
		},
		mounted() {
			this.getDiscounts();
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  input {
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .discounts {
    @extend %setting-table;
    width: 650px;

    &__data {
      @extend %table-data;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
    }

    &__icon {
      @extend %table-icon;
    }

    &__checkbox {
      width: 22px;
      height: 22px;
      cursor: pointer;
      opacity: 0.5;
    }

    &_centered {
      justify-content: center;
    }

    &_flex {
      display: flex;
      justify-content: space-around;
    }

    &__main-icon, &__file-preview {
      width: 22px;
      height: 22px;
    }

    &__link {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 22px;
    }

    &_opacity {
      opacity: 1;
    }

    &_active {
      box-shadow: inset 0 0 8px $brown-shadow;
    }
  }

</style>
