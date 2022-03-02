<template lang="pug">
  .dropsManagers
    .dropsManagers__body
      .dropsManagers__body-item
        .dropsManagers__body-title Delivery Review 1 Manager:
        .drops__name(v-if="!canUpdateDr1Manager") {{ `${ dr1Manager.firstName } ${ dr1Manager.lastName }` }}
        .drops__menu(v-else)
          SelectSingle(
            :options="managersNames"
            :selectedOption="selectedDr1Manager"
            @chooseOption="(e) => setManager(e, 'dr1Manager')"
          )
      .dropsManagers__body-item
        .dropsManagers__body-title Delivery Review 2 Manager:
        .drops__name(v-if="!canUpdateDr1") {{ dr2Manager.firstName + ' ' + dr2Manager.lastName }}
        .drops__menu(v-else)
          SelectSingle(
            :options="managersNames"
            :selectedOption="selectedDr2Manager"
            @chooseOption="(e) => setManager(e, 'dr2Manager')"
          )
</template>

<script>
	import SelectSingle from "@/components/SelectSingle"
	import DataTable from "@/components/DataTable"
	import { mapActions } from "vuex"
	import reviewManagers from "@/mixins/reviewManagers"

	export default {
		mixins: [ reviewManagers ],
		props: {
			project: { type: Object },
			user: { type: Object },
			dr1Manager: { type: Object },
			dr2Manager: { type: Object },
			deliveryTask: { type: Object }
		},
		data() {
			return {
				managers: [],
				fields: [
					{ label: "Delivery Review 1", headerKey: "headerDr1", key: "dr1", width: "50%", padding: 0 },
					{ label: "Delivery Review 2", headerKey: "headerDr2", key: "dr2", width: "50%", padding: 0 }
				]
			}
		},
		methods: {
			...mapActions([ "alertToggle" ]),
			setManager({ option }, prop) {
				const managerIndex = this.managersNames.indexOf(option)
				this.$emit("assignManager", {
					manager: this.managers[managerIndex],
					prop
				})
			}
		},
		computed: {
			selectedDr1Manager() {
				return this.dr1Manager ? `${ this.dr1Manager.firstName } ${ this.dr1Manager.lastName }` : ""
			},
			selectedDr2Manager() {
				return this.dr2Manager ? `${ this.dr2Manager.firstName } ${ this.dr2Manager.lastName }` : ""
			},
			isAdmin() {
				return this.user.group.name === "Administrators" || this.user.group.name === "Developers"
			},
			canUpdateDr1() {
				return this.isAdmin || this.user._id.toString() === this.dr1Manager._id.toString()
			},
			canUpdateDr1Manager() {
				if (this.isAdmin) return true
				return !this.deliveryTask.instructions.some(({ isChecked, isNotRelevant }) => isChecked || isNotRelevant) && this.user._id.toString() === this.dr1Manager._id.toString()
			}
		},
		components: {
			SelectSingle,
			DataTable
		},
		created() {
			this.getManagers()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .dropsManagers {
    margin-bottom: 20px;
    background: $table-list;
    padding: 15px;

    &__body {
      display: flex;
      justify-content: space-around;

      &-item {
        display: flex;
        height: 32px;
        align-items: center;
      }

      &-title {
        margin-right: 15px;
      }
    }
  }

  .drops {
    width: 100%;
    box-sizing: border-box;
    position: relative;

    &__menu {
      position: relative;
      height: 32px;
      width: 220px;
      background: white;
    }
  }

</style>
