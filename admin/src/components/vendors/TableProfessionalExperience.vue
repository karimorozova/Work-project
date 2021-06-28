<template lang="pug">
  .experience
    SettingsTable(
      :fields="fields"
      :tableData="professionalExperienceData"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      @closeErrors="closeErrors"
      @approve="deleteExperience"
      @notApprove="setDefaults"
      @closeModal="setDefaults"
      :tbodyStyle="{'max-height': '256px'}",
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .experience__head-title {{ field.label }}

      template(slot="duration" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.duration }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" readonly v-model="dateRange")
          div(v-click-outside="closePickers")
            img.experience__calendar(src="../../assets/images/calendar.png" @click="openPickers")
            .experience__datepickers(v-if="isDatepickers")
              .experience__pickers
                Datepicker(
                  :value="fromDate"
                  @selected="(e) => setDate(e, 'fromDate')"
                  calendarClass="vendor__calendar-custom"
                  :inline="true"
                  monday-first=true
                )
                Datepicker(
                  :value="toDate"
                  @selected="(e) => setDate(e, 'toDate')"
                  calendarClass="vendor__calendar-custom"
                  :inline="true"
                  monday-first=true
                )
              .experience__button
                Button(value="Assign" @clicked="setDateRange")

      template(slot="occupation" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.occupation }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentOccupation")

      template(slot="company" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.company }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentCompany")

      template(slot="notes" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.notes }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentNotes")

      template(slot="icons" slot-scope="{ row, index }")
        .experience__icons
          img.experience__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'experience_opacity': isActive(key, index)}")

    Add(@add="addData")
</template>

<script>
	import Datepicker from "../Datepicker"
	import Button from "../Button"
	import SettingsTable from "../Table/SettingsTable"
	import Add from "../Add"
	import crudIcons from "@/mixins/crudIcons"
	import moment from "moment"
	import ClickOutside from "vue-click-outside"
	import { mapGetters, mapActions } from "vuex"

	export default {
		mixins: [ crudIcons ],
		props: {
			vendorId: {
				type: String
			},
			professionalExperienceData: {
				type: Array, default: () => []
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Duration",
						headerKey: "headerDuration",
						key: "duration",
						width: "21.5%",
						padding: "0"
					},
					{
						label: "Occupation / Title",
						headerKey: "headerOccupation",
						key: "occupation",
						width: "21.5%",
						padding: "0"
					},
					{
						label: "Company",
						headerKey: "headerCompany",
						key: "company",
						width: "21.5%",
						padding: "0"
					},
					{
						label: "Notes",
						headerKey: "headerNotes",
						key: "notes",
						width: "21.5%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "14%",
						padding: "0"
					}
				],

				currentActive: -1,
				currentNotes: "",
				currentCompany: "",
				currentOccupation: "",
				dateRange: "",

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,

				isDatepickers: false,
				fromDate: new Date(),
				toDate: new Date()
			}
		},
		computed: {
			...mapGetters({
				currentProfessionalExperience: "getCurrentVendorProfessionalExperience"
			})
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeProfessionalExperience: "storeCurrentVendorProfessionalExperience",
				deleteProfessionalExperience: "deleteCurrentVendorProfessionalExperience"
			}),
			getProfessionalExperience() {
				this.professionalExperienceData = this.currentProfessionalExperience
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index)
						break
					case "cancel":
						this.manageCancelEdition()
						break
					case "delete":
						this.manageDeleteClick(index)
						break
					default:
						await this.checkErrors(index)
				}
			},
			setEditingData(index) {
				this.currentActive = index
				this.currentNotes = this.professionalExperienceData[index].notes
				this.currentCompany = this.professionalExperienceData[index].company
				this.currentOccupation = this.professionalExperienceData[index].occupation
				this.dateRange = this.professionalExperienceData[index].duration
				const RE = /(\d{2}\-\d{2}\-\d{4})/g
				const dates = this.professionalExperienceData[index].duration.match(RE)
			},
			manageCancelEdition() {
				// this.$emit("refreshProfExperiences")
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
				this.isDeleting = false
				this.currentNotes = ""
				this.currentCompany = ""
				this.currentOccupation = ""
				this.dateRange = ""
			},

			async checkErrors(index) {
				this.errors = []
				if (!this.dateRange) this.errors.push("Duration should not be empty!")
				if (!this.currentOccupation)
					this.errors.push("Occupation / Title should not be empty!")
				if (!this.currentCompany)
					this.errors.push("Company should not be empty!")
				if (this.fromDate > this.toDate)
					this.errors.push("Start date must be earlier than end date")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.manageSaveClick(index)
			},

			async manageSaveClick(index) {
				if (this.currentActive === -1) return
				const obj = {
					vendorId: this.vendorId,
					index,
					duration: this.dateRange,
					notes: this.currentNotes,
					company: this.currentCompany,
					occupation: this.currentOccupation
				}
				try {
					await this.storeProfessionalExperience(obj)
					this.alertToggle({
						message: "Professional Experience saved",
						isShow: true,
						type: "success"
					})
				} catch (err) {
				} finally {
					this.manageCancelEdition()
				}
			},
			async manageDeleteClick(index) {
				this.deleteIndex = index
				this.isDeleting = true
			},

			async deleteExperience() {
				try {
					await this.deleteProfessionalExperience({
						vendorId: this.vendorId, index: this.deleteIndex
					})
					this.alertToggle({
						message: "Professional Experience removed",
						isShow: true,
						type: "success"
					})
				} catch (err) {
				} finally {
					this.manageCancelEdition()
				}
			},

			addData() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.professionalExperienceData.push({
					notes: "",
					company: "",
					occupation: "",
					duration: ""
				})
				this.setEditingData(this.professionalExperienceData.length - 1)
			},

			closePickers() {
				this.isDatepickers = false
			},
			openPickers() {
				this.isDatepickers = true
			},
			setDate(e, prop) {
				this[prop] = new Date(e)
			},
			setAnytime(e, prop) {
				this[prop] = prop === "fromDate" ? new Date("2019-01-01") : new Date()
			},
			removeAnytime(e, prop) {
				const today = new Date()
				this[prop] =
						prop === "fromDate"
								? new Date(today.getFullYear(), today.getMonth(), 1)
								: today
			},
			setDateRange() {
				// this.$emit("getFilteredReports", {
				// 	fromDate: this.fromDate,
				// 	toDate: this.toDate
				// })
				this.dateRange =
						moment(this.fromDate).format("DD-MM-YYYY") +
						" / " +
						moment(this.toDate).format("DD-MM-YYYY")
				this.closePickers()
			},
			closeErrors() {
				this.areErrors = false
			}
		},
		components: {
			Datepicker,
			Button,
			SettingsTable,
			Add
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .experience {
    @extend %setting-table;
    padding: 20px;
    border-radius: 4px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;

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
      justify-content: flex-end;
    }

    &__icon {
      @extend %table-icon;
    }

    &_opacity {
      opacity: 1;
    }

    &__calendar {
      cursor: pointer;
      width: 18px;
    }

    &__datepickers {
      z-index: 50;
      background-color: $white;
      position: absolute;
      padding: 20px 0 20px 20px;
      box-sizing: border-box;
      box-shadow: 0 0 10px $brown-shadow;
    }

    &__pickers {
      display: flex;
      justify-content: space-between;
    }

    &__button {
      margin-top: 20px;
      text-align: right;
      margin-right: 20px;
    }
  }
</style>
