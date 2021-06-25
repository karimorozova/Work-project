<template lang="pug">
  .reasons
    SettingsTable(
      :fields="fields"
      :tableData="reasons"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      @closeErrors="closeErrors"
      @approve="deleteReason"
      @notApprove="setDefaults"
      @closeModal="setDefaults"
    )
      .reasons__head-title(slot="headerTitle" slot-scope="{ field }") {{ field.label }}
      .reasons__head-title(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
      template(slot="title" slot-scope="{ row, index }")
        .reasons__data(v-if="currentActive !== index") {{ row.reason }}
        .reasons__editing-data(v-else)
          input.reasons__input(type="text" v-model="currentReason")
      template(slot="icons" slot-scope="{ row, index }")
        .reasons__icons
          img.reasons__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'reasons_opacity': isActive(key, index)}")
    Add(@add="addReason")
</template>

<script>
	import SettingsTable from "./SettingsTable"
	import Add from "../Add"
	import { mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"

	export default {
		mixins: [ crudIcons ],
		data() {
			return {
				fields: [
					{ label: "Reason", headerKey: "headerTitle", key: "title", width: "65%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "35%", padding: "0" }
				],
				reasons: [],
				currentActive: -1,
				currentReason: "",
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1
			}
		},
		methods: {
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.currentActive = index
						this.currentReason = this.reasons[index].reason
						break
					case "cancel":
						this.cancelEdition(index)
						break
					case "delete":
						this.manageDeleteClick(index)
						break
					default:
						await this.checkErrors(index)
				}
			},
			manageDeleteClick(index) {
				if (!this.reasons[index]._id) {
					this.reasons.splice(index, 1)
					return this.setDefaults()
				}
				this.deleteIndex = index
				this.isDeleting = true
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if (!this.currentReason || !this.isReasonUnique(index)) this.errors.push("Reason should not be empty and be unique!")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.saveReason(index)
				this.setDefaults()
			},
			isReasonUnique(index) {
				const duplicateIndex = this.reasons.findIndex((item, ind) => {
					if (index !== ind && item.reason.toLowerCase() === this.currentReason.toLowerCase().trim()) {
						return item
					}
				})
				return duplicateIndex === -1
			},
			closeErrors() {
				this.areErrors = false
			},
			cancelEdition(index) {
				if (!this.reasons[index]._id) {
					this.reasons.splice(index, 1)
				}
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
				this.currentReason = ""
				this.isDeleting = false
			},
			async saveReason(index) {
				this.reasons[index].reason = this.currentReason
				try {
					await this.$http.post("/api/reason", { reason: this.reasons[index] })
					await this.getReasons()
					this.alertToggle({ message: "Reason saved", isShow: true, type: 'success' })
				} catch (err) {
					this.alertToggle({ message: "Error on creating new reason", isShow: true, type: 'error' })
				}
			},
			async deleteReason() {
				const index = this.deleteIndex
				const id = this.reasons[index]._id
				try {
					await this.$http.delete(`/api/reason/${ id }`)
					this.reasons.splice(index, 1)
					this.alertToggle({ message: "Reason deleted", isShow: true, type: 'success' })
				} catch (err) {
					this.alertToggle({ message: "Error on Reason deleting", isShow: true, type: 'error' })
				}
				this.setDefaults()
			},
			async getReasons() {
				try {
					const result = await this.$http.get("/api/reasons")
					this.reasons = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Reasons.", isShow: true, type: "error" })
				}
			},
			addReason() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.reasons.push({ reason: "" })
				this.currentActive = this.reasons.length - 1
			},
			...mapActions({
				alertToggle: "alertToggle"
			})
		},
		components: {
			SettingsTable,
			Add
		},
		mounted() {
			this.getReasons()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .reasons {
    @extend %setting-table;
    width: 500px;
    border-radius: 4px;
    margin: 50px;

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

    &_opacity {
      opacity: 1;
    }
  }

</style>
