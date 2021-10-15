<template lang="pug">
  .services-wrapper
    .tabs
      Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTab")

    .table(v-if="isServices")
      ServicesTable(
        :allSteps="steps"
        @setUnitFilter="setUnitFilter"
      )
    .table(v-if="isSteps")
      StepsTable(
        :steps="steps"
        @setStepsWithId="setStepsWithId"
        @updateSteps="updateSteps"
      )
    .table(v-if="isUnits")
      TableUnits

</template>

<script>
	import ServicesTable from "./services/ServicesTable"
	import StepsTable from "./services/StepsTable"
	import Tabs from "@/components/Tabs"
	import { mapActions } from "vuex"
	import TableUnits from "./TableUnits"

	export default {
		data() {
			return {
				isServices: true,
				isSteps: false,
				isUnits: false,
				tabs: [ "Services", "Steps", "Units" ],
				selectedTab: "Services",
				steps: [],
				unitFilter: ""
			}
		},
		methods: {
			...mapActions({
				setSteps: "setStepsFromDataBase",
				alertToggle: "alertToggle"
			}),
			setTab({ index }) {
				this.isServices = index === 0
				this.isSteps = index === 1
				this.isUnits = index === 2
				this.selectedTab = this.tabs[index]
			},
			setUnitFilter({ unit }) {
				this.unitFilter = unit
			},
			setStepsWithId() {
				this.steps = this.steps.filter(item => item._id)
			},
			async updateSteps() {
				await this.getSteps()
			},
			async getSteps() {
				try {
					const result = await this.$http.get("/api/steps")
					this.steps = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Steps from DB", isShow: true, type: "error" })
				}
			}
		},
		components: {
			TableUnits,
			ServicesTable,
			StepsTable,
			Tabs
		},
		created() {
			this.getSteps()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .services-wrapper {
    background-color: $white;
    padding: 25px;
    box-shadow: $box-shadow;
    position: relative;

    width: 1000px;
    box-sizing: border-box;
    border-radius: 4px;
    margin: 50px;
  }

</style>
