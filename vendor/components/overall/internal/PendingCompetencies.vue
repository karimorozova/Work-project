<template lang="pug">
  .competencies
    .competencies__table
      SettingsTable(
        :fields="fields"
        :tableData="pendingCompetenciesData"
        :tbodyStyle="{'max-height': '288px'}",
        :rowCount="10"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .competencies__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .competencies__data {{ row.sourceLanguage.lang }}

        template(slot="targets", slot-scope="{ row, index }")
          .competencies__data {{ row.targetLanguage.lang }}

        template(slot="industry", slot-scope="{ row, index }")
          .competencies__data {{ row.industry.name }}

        template(slot="step", slot-scope="{ row, index }")
          .competencies__data {{ row.step.title }}

        template(slot="icons" slot-scope="{ row, index }")
          .competencies__icons
            img.competencies__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeActions(index, key)")


</template>

<script>
import {mapActions, mapGetters} from "vuex"
  import crudIcons from "../../../mixins/crudIcons"

	import SettingsTable from "../SettingsTable"
	export default {
	  mixins: [crudIcons],
		props: {
      pendingCompetenciesData: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
						headerKey: "headerSource",
						key: "source",
						width: "20%",
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerTarget",
						key: "targets",
						width: "20%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "20%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "20%",
						padding: "0"
					},
          {
            label: "",
            headerKey: "headerIcons",
            key: "icons",
            width: "20%",
            padding: "0"
          },
				],

			}
		},
		methods: {
      ...mapActions([
        "setVendorProp"
      ]),

			makeActions(index, key) {
        console.log(index)
				switch (key) {
					case "delete":
					  const pendingCompetencies = this.pendingCompetenciesData.filter((_, i) => i !== index)
            this.sendRequest(pendingCompetencies)
            this.setVendorProp({prop: "pendingCompetencies", value: pendingCompetencies})
						break
					default:
						// await this.checkErrors(index)
				}
			},

      sendRequest(pendingCompetencies) {
        this.$axios.post('/vendor/pending-competencies', {
          token: this.token,
          pendingCompetencies,
        })
      },


			setDefaults() {
				this.isDeleting = false
				this.currentSource = ""
				this.currentTargets = []
				this.currentIndustries = []
				this.currentSteps = []
			},

			async manageDeleteClick(index) {
				if (!this.competenciesData[index]._id) {
					this.newRow = false
					this.competenciesData.splice(index, 1)
					this.setDefaults()
					return
				}
				this.deleteIndex = index
				this.isDeleting = true
			},

			closeModal() {
				return (this.isDeleting = false)
			},

			async deleteCompetencies() {
				try {
					let currentData = this.competenciesData[this.deleteIndex]
					const result = await this.$http.delete(`/vendorsapi/competencies/${ this.$route.params.id }/${ currentData._id }`)
					this.competenciesData.splice(this.deleteIndex, 1)
					this.$emit("updateRates", true)
					this.closeModal()
					this.alertToggle({
						message: "Competencies are deleted",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error in save Competencies",
						isShow: true,
						type: "error"
					})
				}
			},


			closeErrors() {
				this.areErrors = false
			},

		},

		computed: {
      ...mapGetters({
        token: "getToken"
      }),
      manageIcons() {
        const {cancel, save ,...reuslt} = this.icons
        return reuslt
      }
		},
		components: {
			SettingsTable
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  @import "../../../assets/scss/SettingsTable";

  .competencies {
    width: 1040px;
    height: auto;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    box-sizing: border-box;
    padding: 20px 20px 20px 20px;
    position: relative;

    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
      height: 30px;
      justify-content: center;
    }

    &__icon {
      cursor: pointer;
      margin-right: 8px;
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;
    }

    &__input {
      @extend %table-text-input;
    }
  }
</style>
