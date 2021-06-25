<template lang="pug">
  .instructions
    .tabs
      Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTab")
    .table(v-if="isGeneral")
      Table(
        :allInstructions="instructions"
        :instructions="generalInstructions"
        :isSpecific="false"
        @fitlerInstructions="fitlerInstructions"
        @refreshInstructions="getInstructions")
    .table(v-if="!isGeneral")
      Table(
        :allInstructions="instructions"
        :instructions="specificInstructions"
        :isSpecific="true"
        @fitlerInstructions="fitlerInstructions"
        @refreshInstructions="getInstructions")
</template>

<script>
	import Tabs from "@/components/Tabs"
	import Table from "./instructions/Table"
	import { mapActions } from "vuex"

	export default {
		data() {
			return {
				isGeneral: true,
				tabs: [ "General", "Specific" ],
				selectedTab: "General",
				instructions: []
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			setTab({ index }) {
				this.isGeneral = index === 0
				this.selectedTab = this.tabs[index]
			},
			async getInstructions() {
				try {
					const result = await this.$http.get("/api/instructions")
					this.instructions = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting instructions", isShow: true, type: "error" })
				}
			},
			fitlerInstructions() {
				this.instructions = this.instructions.filter(item => item._id)
			}
		},
		computed: {
			generalInstructions() {
				return this.instructions.filter(item => !item.isSpecific)
			},
			specificInstructions() {
				return this.instructions.filter(item => item.isSpecific)
			}
		},
		components: {
			Tabs,
			Table
		},
		created() {
			this.getInstructions()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .instructions {
    @extend %setting-table;
    width: 700px;
    border-radius: 4px;
    margin: 50px;
  }

</style>

