<template lang="pug">
  .terms
    .terms__check
      CheckBox(
        :isChecked="job.isVendorRead"
        :isReadonly="isReadonly"
        @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)"
      )
    span.terms__text I have read the instructions and downloaded the reference files
</template>

<script>
	import CheckBox from "~/components/CheckBox";
	import { mapActions } from "vuex";

	export default {
		props: {
			job: {
				type: Object
			},
			allJobs: {
				type: Array,
			}
		},
		data() {
			return {
				project: null
			}
		},
		methods: {
			...mapActions({
				setStepTermsAgreement: "setStepTermsAgreement"
			}),
			async toggle(e, bool) {
				if(this.job.status === "Started"){
					bool = true;
        }
				try {
						await this.setStepTermsAgreement({ jobId: this.job._id, value: bool });
				} catch (err) {}
			},
			async getProjectById() {
				try {
					const result = await this.$axios.get(`pm-manage/project?id=${ this.job.project_Id }`)
					this.project = result.data;
				} catch (e) {
				}
			},
		},
		computed: {
			isReadonly() {
				if(this.project) {
          const statuses = ['Started', 'Approved', 'In progress'];

          const { taskId, stepId } = this.job;
          const { steps } = this.project;
          const stepCurrentByTask = steps.filter(item => item.taskId === taskId);
          const currentIndex = stepCurrentByTask.findIndex(item => item.stepId === stepId);

          if (statuses.indexOf(this.job.projectStatus) === -1 || this.job.status === 'Completed') {
            return true;
          } else if (currentIndex === 0) {
            return false;
					} else if(currentIndex === 1) {
						return stepCurrentByTask[0].status !== "Completed";
					} else {
						return true;
					}
				}
			}

		},
		async created() {
			await this.getProjectById()
		},
		components: {
			CheckBox
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .terms {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;

    &__text {
      margin: 10px 0;
      /*font-size: 14px;*/
    }

    &__check {
      margin-right: 10px;
    }
  }

</style>
