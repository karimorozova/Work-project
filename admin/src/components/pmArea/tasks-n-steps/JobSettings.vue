<template lang="pug">
  .hours-steps
    .hours-steps__step
      .hours-steps__block(v-if="currentJob.unit !== 'Packages' &&  currentJob.unit !== 'CAT Wordcount'")
        .hours-steps__title Step {{currentJob.stepCounter}} - {{currentJob.step}}
        .hours-steps__packages
          .hours-steps__packages-item
            .hours-steps__packages-title {{currentJob.unit}}
              input.hours-steps__input(
                type="number" min="1" max="1000"
                :value="currentJob.hours ? currentJob.hours : null" placeholder="Hours" @change="(e) => setHours(e, currentJob.step)")
          .hours-steps__packages-item
            .hours-steps__packages-item
              .hours-steps__sub-title Size
              .hours-steps__drop-menu
                SelectSingle(
                  placeholder="Select"
                  :options="getSizes"
                  :selectedOption="currentJobSize"
                  @chooseOption="setSize"
                )

      .hours-steps__block(v-if="currentJob.unit === 'CAT Wordcount'")
        .hours-steps__title Step {{currentJob.stepCounter}} - {{currentJob.step}}
        .hours-steps__main(v-if="tasksData.stepsAndUnits")
          .hours-steps__label Template
            span.hours-steps__label-red *
          .hours-steps__drop-menu(v-if="tasksData.stepsAndUnits[currentJob.stepCounter - 1]")
            SelectSingle(
              :selectedOption="selectedTemplate"
              :options="allTemplates"
              placeholder="Template"
              @chooseOption="setTemplate"
            )

      .hours-steps__block(v-if="currentJob.unit === 'Packages'")
        .hours-steps__title Step {{currentJob.stepCounter}} - {{currentJob.step}}
        .hours-steps__packages
          .hours-steps__packages-item
            .hours-steps__packages-title Quantity
              input.hours-steps__input(
                type="number" min="1" max="1000"
                :value="currentJob.quantity ? currentJob.quantity : null"  @change="(e) => setQuantity(e, currentJob.step)")
          .hours-steps__packages-item
            .hours-steps__sub-title Size
            .hours-steps__drop-menu
              SelectSingle(
                placeholder="Select"
                :options="getSizes"
                :selectedOption="currentJobSize"
                @chooseOption="setSize"
              )
</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import { mapActions, mapGetters } from 'vuex';
	import taskData from "@/mixins/taskData";
	import SelectSingle from "@/components/SelectSingle";

	export default {
		mixins: [taskData],
		props: {
			currentJob: {
				type: Object
			},
			currentIndex: {
				type: Number
			},
			templates: {
				type: Array,
			},
			originallyUnits: {
				type: Array,
			},
		},
		data() {
			return {
				// templates: [],
				selectedSizes: "",
				// selectedTemplate: "",
				// units: null,
			}
		},
		methods: {
			// async getUnits() {
			// 	try {
			// 		const result = await this.$http.get('/api/units');
			// 		this.originallyUnits = result.data;
			// 	} catch (err) {
			// 		this.alertToggle({message: "Error on getting units", isShow: true, type: "error"});
			// 	}
			// },
			...mapActions({
				setDataValue: "setTasksDataValue",
				alertToggle: "alertToggle"
			}),
			setQuantity(e, step) {
				let oldStepsAndUnits = this.tasksData.stepsAndUnits;
				oldStepsAndUnits[this.currentIndex].quantity = e.target.value;

				let fieldsForDelete = ['template', 'hours'];
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits });
			},
			setHours(e, step) {
				let oldStepsAndUnits = this.tasksData.stepsAndUnits;
				oldStepsAndUnits[this.currentIndex].hours = e.target.value;

				let fieldsForDelete = ['quantity', 'template'];
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits });
			},
			setTemplate({ option }) {
				const value = this.templates.find(item => item.name === option);
				// this.selectedTemplate = value;
				let oldStepsAndUnits = this.tasksData.stepsAndUnits;
				oldStepsAndUnits[this.currentIndex].template = value;
				oldStepsAndUnits[this.currentIndex].size = null;

				let fieldsForDelete = ['quantity', 'hours'];
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false;
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits });
			},
			setSize({ option }) {
				let oldStepsAndUnits = this.tasksData.stepsAndUnits;
				oldStepsAndUnits[this.currentIndex].size = option;
				this.selectedSizes = option;

				let fieldsForDelete = ['template'];
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits });
			},
			// async getMemoqTemplates() {
			// 	try {
			// 		const result = await this.$http.get("/memoqapi/templates");
			// 		this.templates = result.data || [];
			// 	} catch (err) {
			// 		this.alertToggle({message: "Error on getting templates", isShow: true, type: "error"});
			// 	}
			// },
			// setStartedTempalte() {
			// 	if (this.currentJob.unit === "CAT Wordcount") {
			// 		const template = this.templates.find(i => true)
			// 		this.setTemplate({option: template.name})
			// 	}
			// },
		},
		// async created() {
		// await this.getMemoqTemplates();
		// this.setStartedTempalte();
		// await this.getUnits();
		// },
		computed: {
			...mapGetters({
				tasksData: "getTasksData",
			}),
			selectedTemplate() {
				if(this.tasksData) {
					if(this.tasksData.stepsAndUnits.find(obj => obj.hasOwnProperty('template'))) {
						const { name } = this.tasksData.stepsAndUnits.find(obj => obj.hasOwnProperty('template')).template;
						return name
					}
					return ''
				}
			},
			getSizes() {
				if(this.originallyUnits.length) {
					if(this.currentJob.unit !== 'CAT Wordcount') {
						let sizes = this.originallyUnits.filter(item => item.type === this.currentJob.unit)[0].sizes;
						if(!sizes.length) {
							sizes = ["1"];
						}
						return sizes;
					}
				}
			},
			currentJobSize() {
				if(this.originallyUnits.length) {
					let oldStepsAndUnits = this.tasksData.stepsAndUnits;
					oldStepsAndUnits[this.currentIndex].size = this.getSizes.includes(this.currentJob.size) ? this.currentJob.size : null;
					return this.getSizes.includes(this.currentJob.size) ? this.currentJob.size : null;
				}
			},
			allTemplates() {
				if(this.templates.length) {
					return this.templates.map(item => item.name);
				}
			},
		},
		components: {
			LabelVal,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .hours-steps {
    &__block {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
      border: 1px solid $main-color;
      box-sizing: border-box;
      background-color: $active-background;
      padding: 12px 20px 0;
      border-radius: 10px;

    }

    &__label {
      padding: 5px 0;

      &-red {
        color: red;
        font-size: 14px;
        margin-right: 15px;
      }
    }

    &__packages {
      display: flex;
      width: 100%;
      justify-content: space-between;

      &-item {
        display: flex;
      }

      &-title {
        width: 150px;
      }
    }

    &__title {
      position: relative;
      max-width: 100%;
      margin: 10px 0 5px;
      text-align: center;
      font-size: 18px;
    }

    &__sub-title {
      margin-top: 6px;
      margin-right: 10px;
    }

    &__main {
      display: flex;
      width: 100%;
      margin: 7px 0;
      justify-content: center;
    }

    &__drop-menu {
      position: relative;
      border-radius: 6px;
      height: 29px;
      background: #fff;
      margin-bottom: 15px;
      width: 191px;
    }

    &__input {
      color: $main-color;
      width: 75px;
      margin-left: 10px;
      outline: none;
      border: 1px solid $main-color;
      border-radius: 5px;
      box-sizing: border-box;
      padding-left: 5px;
      transition: all 0.2s;
      height: 29px;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    &__stage {
      opacity: 0.8;
    }
  }

</style>
