<template lang="pug">
  .hours-steps
    .hours-steps__step

      .content(v-if="currentJob.unit !== 'Packages' &&  currentJob.unit !== 'CAT Wordcount'")
        .content__title {{currentJob.step}} Job Setting
        .hours-steps__block
          .hours-steps__packages
            .hours-steps__packages-item
              .hours-steps__packages-title {{currentJob.unit}}:
                span.hours-steps__label-red *
                input.hours-steps__input(
                  type="number" min="1" max="1000"
                  :value="currentJob.hours ? currentJob.hours : null"
                  @change="(e) => setHours(e, currentJob.step)"
                )
            .hours-steps__packages-item
              .hours-steps__packages-item
                .hours-steps__sub-title {{ currentJob.step === 'Compliance' ? 'Compliance Template:' : 'Size:' }}
                  span.hours-steps__label-red *
                .hours-steps__drop-menu
                  SelectSingle(
                    placeholder="Select"
                    :options="getSizes"
                    :selectedOption="currentJobSize"
                    @chooseOption="setSize"
                  )

      .content(v-if="currentJob.unit === 'CAT Wordcount'")
        .content__title {{currentJob.step}} Job Setting
        .hours-steps__block
          .hours-steps__main(v-if="tasksData.stepsAndUnits")
            .hours-steps__label Template:
              span.hours-steps__label-red *
            .hours-steps__drop-menu(v-if="tasksData.stepsAndUnits[currentJob.stepCounter - 1]")
              SelectSingle(
                :selectedOption="selectedTemplate"
                :options="allTemplates"
                placeholder="Template"
                @chooseOption="setTemplate"
              )

      .content(v-if="currentJob.unit === 'Packages'")
        .content__title {{currentJob.step}} Job Setting
        .hours-steps__block
          .hours-steps__packages
            .hours-steps__packages-item
              .hours-steps__packages-title Quantity:
                span.hours-steps__label-red *
                input.hours-steps__input(
                  type="number" min="1" max="1000"
                  :value="currentJob.quantity ? currentJob.quantity : null"
                  @change="(e) => setQuantity(e, currentJob.step)"
                )
            .hours-steps__packages-item
              .hours-steps__sub-title Size:
                span.hours-steps__label-red *
              .hours-steps__drop-menu
                SelectSingle(
                  placeholder="Select"
                  :options="getSizes"
                  :selectedOption="currentJobSize"
                  @chooseOption="setSize"
                )

</template>

<script>
	import LabelVal from "@/components/LabelVal"
	import { mapActions, mapGetters } from 'vuex'
	import taskData from "@/mixins/taskData"
	import SelectSingle from "@/components/SelectSingle"

	export default {
		mixins: [ taskData ],
		props: {
			currentJob: {
				type: Object
			},
			currentIndex: {
				type: Number
			},
			templates: {
				type: Array
			},
			originallyUnits: {
				type: Array
			}
		},
		data() {
			return {
				// templates: [],
				selectedSizes: ""
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
				let oldStepsAndUnits = this.tasksData.stepsAndUnits
				oldStepsAndUnits[this.currentIndex].quantity = e.target.value

				let fieldsForDelete = [ 'template', 'hours' ]
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits })
			},
			setHours(e, step) {
				let oldStepsAndUnits = this.tasksData.stepsAndUnits
				oldStepsAndUnits[this.currentIndex].hours = e.target.value

				let fieldsForDelete = [ 'quantity', 'template' ]
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits })
			},
			setTemplate({ option }) {
				const value = this.templates.find(item => item.name === option)
				// this.selectedTemplate = value;
				let oldStepsAndUnits = this.tasksData.stepsAndUnits
				oldStepsAndUnits[this.currentIndex].template = value
				oldStepsAndUnits[this.currentIndex].size = null

				let fieldsForDelete = [ 'quantity', 'hours' ]
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits })
			},
			setSize({ option }) {
				let oldStepsAndUnits = this.tasksData.stepsAndUnits
				oldStepsAndUnits[this.currentIndex].size = option
				this.selectedSizes = option

				let fieldsForDelete = [ 'template' ]
				for (const iterator of fieldsForDelete) {
					oldStepsAndUnits[this.currentIndex].hasOwnProperty(iterator)
							? delete oldStepsAndUnits[this.currentIndex][iterator]
							: false
				}
				this.setDataValue({ prop: "stepsAndUnits", value: oldStepsAndUnits })
			}
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
				tasksData: "getTasksData"
			}),
			selectedTemplate() {
				if (this.tasksData) {
					if (this.tasksData.stepsAndUnits.find(obj => obj.hasOwnProperty('template'))) {
						const { name } = this.tasksData.stepsAndUnits.find(obj => obj.hasOwnProperty('template')).template
						return name
					}
					return ''
				}
			},
			getSizes() {
				if (this.originallyUnits.length) {
					if (this.currentJob.unit !== 'CAT Wordcount') {
						let sizes = this.originallyUnits.filter(item => item.type === this.currentJob.unit)[0].sizes
						if (!sizes.length) {
							sizes = [ "1" ]
						}
						return sizes
					}
				}
			},
			currentJobSize() {
				if (this.originallyUnits.length) {
					let oldStepsAndUnits = this.tasksData.stepsAndUnits
					oldStepsAndUnits[this.currentIndex].size = this.getSizes.includes(this.currentJob.size) ? this.currentJob.size : null
					return this.getSizes.includes(this.currentJob.size) ? this.currentJob.size : null
				}
			},
			allTemplates() {
				if (this.templates.length) {
					return this.templates.map(item => item.name)
				}
			}
		},
		components: {
			LabelVal,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  .content{
    &__title {
      font-size: 16px;
      font-family: 'Myriad600';
      padding: 30px 10px 10px;
    }
  }
  .hours-steps {
    &__block {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-bottom: 2px solid $light-border;
      border-top: 2px solid $light-border;
      box-sizing: border-box;
      background-color: $table-list;
      padding: 15px 10px 18px;
    }

    &__label {

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
        flex-direction: column;
        width: 220px;
      }

      &-title {
      }
    }

    &__title {
      position: relative;
      max-width: 100%;
      text-align: center;
      font-size: 18px;
      margin-bottom: 15px;
    }

    &__sub-title {
    }

    &__main {
      display: flex;
      width: 220px;
      flex-direction: column;
    }

    &__drop-menu {
      position: relative;
      border-radius: 4px;
      height: 32px;
      background: #fff;
      margin-top: 3px;
      width: 220px;
    }

    &__input {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;
      margin-top: 3px;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__stage {
      opacity: 0.8;
    }
  }

</style>
