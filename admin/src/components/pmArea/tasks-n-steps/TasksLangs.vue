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
	import LanguagesSelect from "@/components/LanguagesSelect"
	import SelectSingle from "@/components/SelectSingle"
	import { mapGetters, mapActions } from "vuex"
	import taskData from "@/mixins/taskData"
	import TasksLanguages from "../../../mixins/TasksLanguages"


	export default {
		mixins: [taskData, TasksLanguages],
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
				setDataValue: "setTasksDataValue",
				alertToggle: "alertToggle"
			}),
			setLanguage({ option }) {
				this.$emit("setTargets", {
					targets: [this.originallyLanguages.find(item => item.lang === option)]
				})
				const { symbol } = this.originallyLanguages.find(item => item.lang === option)
				this.$emit("setSourceLanguage", { symbol: symbol })
			}
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
				tasksData: "getTasksData"
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
			LanguagesSelect,
			SelectSingle,
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .tasks-langs {
    margin-bottom: 40px;

    &__title {
      position: relative;
    }

    &__item {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
    }

    &__drop-menu {
      position: relative;
      width: 191px;
      height: 28px;
      margin-left: 20px;
    }

    &__input {
      width: 191px;
    }
  }

  .asterisk {
    color: red;
  }
</style>
