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
        .target__from
          span.target__search-value(v-model="langSearchValue", v-if="isSearching && langSearchValue") {{ langSearchValue }}
          Languages(
            tabIndex="0",
            :languages="targetAll",
            :langSearchValue="langSearchValue",
            @forceMove="forceMoveFromAll",
            @searching="isSearching = true",
            @searchValue="(e) => searchValue(e, 'targetAll')",
            @slice="slice",
            @sortBySearch="(e) => sortBySearch(e, 'targetAll')",
            @clearSearch="(e) => clearSearch(e, 'targetAll')"
          )
        .target__arrows
          Arrows(
            @forward="(e) => moveTargets(e, 'targetAll', 'targetChosen')",
            @back="(e) => moveTargets(e, 'targetChosen', 'targetAll')"
          )
        .target__to
          Languages(tabIndex="1", :languages="targetChosen", @forceMove="forceMoveFromChosen")
</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import Languages from "@/components/finance/langs/Languages"
	import Arrows from "@/components/finance/langs/Arrows"
	import { mapGetters, mapActions } from "vuex"
	import TasksLanguages from "../../../mixins/TasksLanguages"

	export default {
		mixins: [TasksLanguages],
		props: {
			originallyLanguages: {
				type: Array
			},
			sourceLanguages: {
				type: Array
			},
			isRequest: {
				type: Boolean
			},
			setPossibleTargetsAction: {
				type: Boolean
			}
		},
		data() {
			return {
				wordsRates: [],
				hoursRates: [],
				targetAll: [],
				targetChosen: [],
				languagePairs: [],
				langSearchValue: "",
				isSearching: false
			}
		},
		methods: {
			...mapActions({
				storeProject: "setCurrentProject",
				setDataValue: "setTasksDataValue"
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
					const { source, service } = this.tasksData
					const { customer: { services }, industry } = this.currentProject

					this.targetAll = services
							.filter(({ industries, services, sourceLanguage }) =>
									services[0] === service._id &&
									industries[0] === industry._id &&
									sourceLanguage === source._id
							)
							.map(({ targetLanguages }) =>
									this.originallyLanguages.find(({ _id }) => targetLanguages[0] === _id)
							)
				}
			},
			emitTargets() {
				this.$emit("setTargets", { targets: this.targetChosen })
			},
			forceMoveFromAll({ index }) {
				const lang = this.targetAll.splice(index, 1)
				this.targetChosen.push(lang[0])
				this.emitTargets()
				this.sortLanguages("targetChosen")
			},
			forceMoveFromChosen({ index }) {
				const lang = this.targetChosen.splice(index, 1)
				this.targetAll.push(lang[0])
				this.emitTargets()
				this.sortLanguages("targetAll")
			},
			moveTargets(e, from, to) {
				const checked = this[from].filter((item) => item.check)
				this[from] = this[from].filter((item) => !item.check)
				this[to].push(...checked)
				this.sortLanguages(from)
				this.sortLanguages(to)
				this.clearChecks(to)
				this.emitTargets()
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
			runPossibleTargets() {
				this.setPossibleTargets()
				this.targetChosen = []
			}
		},
		watch: {
			setPossibleTargetsAction(val) {
				if (val) this.runPossibleTargets()
			}
		},
		created() {
			this.runPossibleTargets()
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
				tasksData: "getTasksData"
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
			Languages,
			Arrows,
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
    margin-bottom: 35px;

    &__title {
      &-source {
        margin-bottom: 5px;
        position: relative;
        width: 145px;
      }

      &-target {
        margin-bottom: 5px;
        position: relative;
        width: 160px;
      }
    }
  }

  .source {
    margin-bottom: 30px;
    @extend %flex-column;

    &__drop-menu {
      position: relative;
      width: 100%;
      height: 28px;
    }
  }

  .target {
    &__arrows {
      margin: 0 20px;
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
