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
      )
    .step-info__block
      Files(
        :stepFiles="stepFiles"
        :step="step"
        :projectId="task.projectId"
      )
</template>

<script>
	import Vendor from "../stepinfo/Vendor";
	import Finance from "../stepinfo/finance/Finance";
	import Matrix from "../stepinfo/Matrix";
	import Files from "../stepinfo/Files";
	import {mapGetters, mapActions} from "vuex";

	export default {
		props: {
			vendors: {
				type: Array,
			},
			step: {
				type: Object,
			},
			task: {
				type: Object,
			},
			index: {
				type: [Number, String],
			},
			originallyLanguages: {
				type: Array
			},
			originallyUnits: {
				type: Array
			}
		},
		data() {
			return {
				matrixData: [],
			};
		},
		methods: {
			stepFilesFiller(arr, category) {
				let files = [];
				for (let file of arr) {
					const nameArr = file.split("/");
					const filePath = __WEBPACK__API_URL__ + file.split("./dist")[1];
					const fileName = nameArr[nameArr.length - 1];
					const targetFile = this.task.targetFiles
						? this.task.targetFiles.find((item) => item.fileName === fileName)
						: "";
					files.push({
						check: false,
						fileName: fileName,
						category: category,
						source: filePath,
						target: targetFile ? __WEBPACK__API_URL__ + targetFile.path : "",
					});
				}
				return files;
			},
			refreshFinance({costs}) {
				// console.log("refresh finance", costs);
			},
			closeInfo() {
				this.$emit("closeStepInfo");
			},
			...mapActions({
				alertToggle: "alertToggle",
				updateMatrix: "updateMatrix",
			}),
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
			}),
			stepFiles() {
				let result = [];
				if (this.task.sourceFiles) {
					result.push(
						...this.stepFilesFiller(this.task.sourceFiles, "Source file")
					);
				}
				if (this.task.refFiles) {
					result.push(
						...this.stepFilesFiller(this.task.refFiles, "Reference file")
					);
				}
				return result;
			},
		},
		components: {
			Vendor,
			Finance,
			Matrix,
			Files,
		},
	};
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
