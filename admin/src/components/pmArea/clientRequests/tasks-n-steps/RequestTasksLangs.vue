<template lang="pug">
  .tasks-langs
    .tasks-langs__item
      .tasks-langs__title Target Language:
        span.asterisk *
      .tasks-langs__drop-menu
        SelectSingle(
          placeholder="Language",
          :options="possibleTargetLanguages",
          :selectedOption="targetLanguages.length ? targetLanguages[0].lang : ''",
          @chooseOption="setLanguage"
        )
</template>

<script>
	import SelectSingle from "@/components/SelectSingle"
	import { mapGetters, mapActions } from "vuex"
	import taskData from "@/mixins/taskData"
	import TasksLanguages from "../../../../mixins/TasksLanguages"


	export default {
		mixins: [ taskData, TasksLanguages ],
		props: {
			originallyLanguages: {
				type: Array
			},
			targetLanguages: {
				type: Array
			}
		},
		data() {
			return {
				targets: [],
				languagePairs: []
			}
		},
		methods: {
			...mapActions({
				setDataValue: "setTasksDataValueRequest",
				alertToggle: "alertToggle"
			}),
			setLanguage({ option }) {
				const language = this.originallyLanguages.find(item => item.lang === option)
				this.$emit("setTargets", { targets: [ language ] })
				this.$emit("setSourceLanguage", { symbol: language.symbol })
			}
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
				tasksData: "getTasksDataRequest"
			}),
			possibleTargetLanguages() {
				if (this.currentProject._id) {
					if (this.tasksData.hasOwnProperty('service')) {
						return this.getClientLanguagesByServices('targetLanguages').map(i => i.lang)
					}
				}
			}
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .tasks-langs {
    padding: 0 10px;

    &__title {
      position: relative;
    }

    &__item {
      display: block;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      margin-top: 3px;
      height: 32px;

    }

    &__input {
      width: 220px;
    }
  }

  .asterisk {
    color: red;
  }
</style>
