<template lang="pug">
  .step-info
    span.step-info__close(@click="closeInfo") +
    .step-info__block.size Step ID - {{ step.stepId }}
    .step-info__block
      Vendor(
        :index="index"
        :step="step"
        :vendors="vendors"
        :vendor="step.vendor"
        :originallyLanguages="originallyLanguages"
      )
    .step-info__block
      Finance(
        :step="step"
        @refreshFinance="refreshFinance"
        :originallyUnits="originallyUnits"
        :projectCurrency="projectCurrency"
      )
    .step-info__block
      Files(
        :stepFiles="stepFiles"
        :step="step"
        :projectId="task.projectId"
        :originallyUnits="originallyUnits"
      )
</template>

<script>
	import Vendor from "../stepinfo/Vendor"
	import Finance from "../stepinfo/finance/Finance"
	import Matrix from "../stepinfo/Matrix"
	import Files from "../stepinfo/Files"
	import { mapGetters, mapActions } from "vuex"

	export default {
		props: {
			vendors: {
				type: Array
			},
			step: {
				type: Object
			},
			task: {
				type: Object
			},
			index: {
				type: [ Number, String ]
			},
			originallyLanguages: {
				type: Array
			},
			originallyUnits: {
				type: Array
			},
			projectCurrency: {
				type: String
			}
		},
		data() {
			return {
				matrixData: [],
				delivery: null
			}
		},
		methods: {
			stepFilesFiller(arr, category) {
				let files = []
				for (let file of arr) {
					const nameArr = file.split("/")
					const filePath = file.includes('dist') ? __WEBPACK__API_URL__ + file.split("./dist")[1] : __WEBPACK__API_URL__ + file
					const fileName = nameArr[nameArr.length - 1]
					files.push({ fileName: fileName, category: category, link: filePath })
				}
				return files
			},
			refreshFinance({ costs }) {
				// console.log("refresh finance", costs);
			},
			async getDeliveryFiles() {
				try {
					const result = await this.$http.post("/pm-manage/delivery-data", {
						projectId: this.currentProject._id,
						taskId: this.task.taskId
					})
					this.delivery = result.data
				} catch (err) {
				}
			},
			closeInfo() {
				this.$emit("closeStepInfo")
			},
			...mapActions({
				alertToggle: "alertToggle",
				updateMatrix: "updateMatrix"
			})
		},
		mounted() {
			this.getDeliveryFiles()
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			}),
			stepFiles() {
				let result = []
				if (this.task.sourceFiles) result.push(...this.stepFilesFiller(this.task.sourceFiles, "Source"))
				if (this.task.refFiles) result.push(...this.stepFilesFiller(this.task.refFiles, "Reference"))
				if (this.currentProject.status !== 'Closed') {
					if (this.task.targetFiles) result.push(...this.stepFilesFiller(this.task.targetFiles.map(i => i.path), "Target"))
				} else {
					if (this.delivery) {
						console.log(this.delivery)
						result.push(...this.stepFilesFiller(this.delivery.files.map(i => i.path), "Target"))
					}
				}
				console.log(result)
				return result
			}
		},
		components: {
			Vendor,
			Finance,
			Matrix,
			Files
		}
	}
</script>

<style lang="scss" scoped>
  .step-info {
    padding: 20px;
    position: relative;

    &__block {
      margin-bottom: 20px;
    }

    &__close {
      position: absolute;
      top: 3px;
      right: 8px;
      transform: rotate(45deg);
      font-size: 24px;
      font-weight: 600;
      cursor: pointer;
    }
  }

  .size {
    font-size: 20px;
  }
</style>
