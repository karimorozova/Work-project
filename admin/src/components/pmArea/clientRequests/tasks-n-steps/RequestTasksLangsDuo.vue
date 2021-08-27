<template lang="pug">
  .tasks-langs
    .source
      .tasks-langs__title-source Source Language:
        span.asterisk *
      .source__drop-menu
        SelectSingle(
          placeholder="Language",
          :options="possibleSourceLanguages",
          :selectedOption="sourceLanguages.length ? sourceLanguages[0] : ''",
          @chooseOption="setSource"
        )
    .target
      .tasks-langs__title-target Target Language(s):
        span.asterisk *
      .select-lang-wrapper
        ListManagement(
          :list="targetAll.map(i=> i.lang)"
          @moveItem="moveFromAll"
        )
        ListManagementButtons(
          @moveAll="moveAll"
          @removeAll="removeAll"
        )
        ListManagement(
          :list="targetChosen.map(i=> i.lang)"
          @moveItem="moveFromChosen"
        )
</template>

<script>
	import SelectSingle from "../../../SelectSingle"
	import { mapGetters, mapActions } from "vuex"
	import TasksLanguages from "../../../../mixins/TasksLanguages"
	import ListManagement from "../../../ListManagement"
	import ListManagementButtons from "../../../ListManagementButtons"

	export default {
		mixins: [ TasksLanguages ],
		props: {
			currentTaskId: { type: String },
			originallyLanguages: {
				type: Array
			},
			sourceLanguages: {
				type: Array
			},
			setPossibleTargetsAction: {
				type: Boolean
			}
		},
		data() {
			return {
				targetAll: [],
				targetChosen: [],
				languagePairs: [],
				langSearchValue: "",
				isSearching: false
			}
		},
		methods: {
			moveFromAll(index) {
				const lang = this.targetAll.splice(index, 1)
				this.targetChosen.push(lang[0])
				this.emitTargets()
				this.sortLanguages("targetChosen")
			},
			moveFromChosen(index) {
				const lang = this.targetChosen.splice(index, 1)
				this.targetAll.push(lang[0])
				this.emitTargets()
				this.sortLanguages("targetAll")
			},
			moveAll() {
				this.setPossibleTargets()
				this.targetChosen = this.targetAll
				this.targetAll = []
				this.emitTargets()
			},
			removeAll() {
				this.setPossibleTargets()
				this.targetChosen = []
				this.emitTargets()
			},
			...mapActions({
				storeProject: "setCurrentProject",
				setDataValue: "setTasksDataValueRequest"
			}),
			sortLanguages(arrProp) {
				this[arrProp].sort((a, b) => {
					if (a.lang < b.lang) return -1
					if (a.lang > b.lang) return 1
				})
			},
			setSource({ option }) {
				const { symbol } = this.originallyLanguages.find((item) => item.lang === option)
				this.$emit("setSourceLanguage", { symbol: symbol })
				this.targetChosen = []
			},

			setPossibleTargets() {
				if (this.tasksData.hasOwnProperty('service')) {
					this.targetAll = [ ...this.currentProject.requestForm.targetLanguages ]
				}
			},
			emitTargets() {
				this.$emit("setTargets", { targets: this.targetChosen })
			},
			searchValue({ value }, prop) {
				this.langSearchValue += value.toLowerCase()
				this[prop].filter(item => item.lang.toLowerCase().indexOf(this.langSearchValue) !== -1)
			},
			slice() {
				this.langSearchValue = this.langSearchValue.slice(0, -1)
			},
			clearChecks(prop) {
				this[prop].forEach((item) => (item.check = false))
				this.langSearchValue = ""
			},
			clearSearch(e, prop) {
				this.clearChecks(prop)
			},
			sortBySearch({ value }, prop) {
				if (!value) return this.sortLanguages(prop)
				const val = value.toLowerCase()
				for (let index in this[prop]) {
					const n = val.length
					if (this[prop][index].lang.toLowerCase().slice(0, n) === val) {
						let replaceLang = this[prop].splice(index, 1)
						this[prop].unshift(replaceLang[0])
					}
				}
			},
			runPossibleTargetsForEditing() {
				const { taskData: { targets } } = this.currentProject.tasksAndSteps.find(item => item.taskId === this.currentTaskId)
				this.targetAll = [ ...this.currentProject.requestForm.targetLanguages.filter(item => !targets.map(item => item.lang).includes(item.lang)) ]
				this.targetChosen.push(...targets)
				this.$emit("setTargets", { targets: this.targetChosen })
				this.$emit("endOfSettingTaskData")
			},
			runPossibleTargets() {
				this.setPossibleTargets()
				this.targetChosen = []
			}
		},
		watch: {
			setPossibleTargetsAction(val) {
				if (val && !this.currentTaskId) this.runPossibleTargets()
				if (val && this.currentTaskId) this.runPossibleTargetsForEditing()
			}
		},
		created() {
			this.runPossibleTargets()
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentClientRequest",
				tasksData: "getTasksDataRequest"
			}),
			possibleSourceLanguages() {
				if (this.currentProject._id) {
					if (this.tasksData.hasOwnProperty('service')) {
						return this.getClientLanguagesByServices('sourceLanguage').map(item => item.lang)
					}
				}
			}
		},
		components: {
			ListManagementButtons,
			ListManagement,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  %flex-row {
    display: flex;
    align-items: center;
  }

  %flex-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .tasks-langs {
    padding: 0 10px;

    &__title {
      &-source {
        margin-bottom: 3px;
        position: relative;
      }

      &-target {
        margin-bottom: 3px;
        position: relative;
      }
    }
  }

  .source {
    margin-bottom: 20px;
    @extend %flex-column;

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }
  }

  .target {
    &__arrows {
    }

    &__from {
      position: relative;
    }

    &__search-value {
      position: absolute;
      top: -20px;
      font-size: 14px;
      left: 100%;
    }
  }

  .select-lang-wrapper {
    @extend %flex-row;
    justify-content: space-between;
  }

  .asterisk {
    color: red;
  }
</style>
