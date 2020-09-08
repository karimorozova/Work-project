<template lang="pug">
  .tasks-langs
    .tasks-langs__item
      .tasks-langs__title Target Language:
        Asterisk(:customStyle="asteriskStyle")
      .tasks-langs__drop-menu
        SelectSingle(
          placeholder="Language",
          :options="targets.map((i) => i.lang)",
          :selectedOption="selectedLang ? selectedLang : ''",
          @chooseOption="setLanguage"
        )
</template>

<script>
	import LanguagesSelect from "@/components/LanguagesSelect";
	import Asterisk from "@/components/Asterisk";
	import SelectSingle from "@/components/SelectSingle";
	import {mapGetters, mapActions} from "vuex";
	import taskData from "@/mixins/taskData";

	export default {
		mixins: [taskData],
		props: {
			originallyLanguages: {
				type: Array,
			},
		},
		data() {
			return {
				targets: [],
				selectedLang: null,
				languagePairs: [],
				asteriskStyle: {top: "-4px"},
			};
		},
		methods: {
			...mapActions({
				storeProject: "storeProject",
				setDataValue: "setTasksDataValue",
				alertToggle: "alertToggle",
			}),
			setLanguage({option}) {
				this.selectedLang = option;
				this.setDataValue({
					prop: "targets",
					value: [this.currentProject.customer.targetLanguages.find((item) => item.lang === option)],
				});
			},
			async getClientLanguages() {
				this.targets = this.currentProject.customer.targetLanguages;
			},
			getStartedTargetLanguage() {
				if(this.currentProject._id){
					if (this.currentProject.customer.targetLanguages.length === 1) {
						this.setLanguage({option: this.currentProject.customer.targetLanguages[0].lang})
					}
				}
			},
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
				tasksData: "getTasksData",
			}),
		},
		created() {
			this.getClientLanguages();
			this.getStartedTargetLanguage();
		},
		components: {
			LanguagesSelect,
			SelectSingle,
			Asterisk,
		},
	};
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
</style>
