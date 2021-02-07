<template lang="pug">
  .step-info
    span.step-info__close(@click="closeInfo") +
    .step-info__block.size Step ID - {{ step.stepId }}
    .step-info__block
      Vendor(
        :step="step"
        :vendor="vendor"
        :project="project"
        :index="index"
      )
    .step-info__block
      Finance(
        :step="step"
        @refreshFinance="refreshFinance"
        :originallyUnits="originallyUnits"
        :project="project"
      )
</template>

<script>
	import Vendor from "./other-step-info/Vendor";
	import Finance from "./other-step-info/Finance";
	import { mapGetters, mapActions } from "vuex";

	export default {
		props: {
      step: {
        type: Object,
      },
			project: {
				type: Object,
			},
      index: {
        type: [Number, String],
      },
      vendor: {
      	type: Object
      }
    },
		data() {
			return {
				matrixData: [],
				originallyUnits: [],
				originallyLanguages: [],
			}
		},
		methods: {
      // stepFilesFiller(arr, category) {
      // 	let files = [];
      // 	for (let file of arr) {
      // 		const nameArr = file.split("/");
      // 		const filePath = __WEBPACK__API_URL__ + file.split("./dist")[1];
      // 		const fileName = nameArr[nameArr.length - 1];
      // 		const targetFile = this.task.targetFiles
      // 				? this.task.targetFiles.find((item) => item.fileName === fileName)
      // 				: "";
      // 		files.push({
      // 			check: false,
      // 			fileName: fileName,
      // 			category: category,
      // 			source: filePath,
      // 			target: targetFile ? __WEBPACK__API_URL__ + targetFile.path : "",
      // 		});
      // 	}
      // 	return files;
      // },
      refreshFinance ({ costs }) {
        console.log('refresh finance', costs);
      },
      closeInfo () {
        this.$emit('closeStepInfo');
      },
      ...mapActions({
        alertToggle: 'alertToggle',
        updateMatrix: 'updateMatrix',
      }),
			async getOriginallyLanguages() {
				try {
					const result = await this.$http.get("/api/languages");
					this.originallyLanguages = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Languages",
						isShow: true,
						type: "error",
					});
				}
			},
			async getOriginallyUnits() {
				try {
					const result = await this.$http.get("/api/units");
					this.originallyUnits = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Units",
						isShow: true,
						type: "error",
					});
				}
			},
		},
		computed: {
      ...mapGetters({
        currentProject: 'getCurrentProject',
      }),
      // stepFiles() {
      // 	let result = [];
      // 	if(this.task.sourceFiles) {
      // 		result.push(
      // 				...this.stepFilesFiller(this.task.sourceFiles, "Source file")
      // 		);
      // 	}
      // 	if(this.task.refFiles) {
      // 		result.push(
      // 				...this.stepFilesFiller(this.task.refFiles, "Reference file")
      // 		);
      // 	}
      // 	return result;
      // },
    },
		async created() {
			await this.getOriginallyLanguages();
			await this.getOriginallyUnits();
		},
		components: {
			Vendor,
			Finance,
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
