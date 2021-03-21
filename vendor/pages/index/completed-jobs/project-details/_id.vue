<template lang="pug">
  .details
    .title Project Details
    .details__data(v-if="job._id")
      //.details__header
        .details__title Project Details

      .details__info
        .details__main
          MainInfo
        .details__describe
          OtherInfo
      .details__files
        Files
</template>

<script>
	import MainInfo from "./MainInfo"
	import OtherInfo from "./OtherInfo"
	import Files from "../../../components/details/Files"
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {}
		},
		methods: {
			...mapActions({
				getJobs: "getJobs",
				selectJob: "selectJob",
				alertToggle: "alertToggle"
			}),
			async getJobInfo() {
				const { id } = this.$route.params
				try {
					if (!this.allJobs.length) {
						await this.getJobs()
					}
					const currentJob = this.allJobs.find(item => item._id === id)
					await this.selectJob(currentJob)
				} catch (err) {

				}
			}
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob",
				allJobs: "getAllJobs"
			})
		},
		components: {
			MainInfo,
			OtherInfo,
			Files
		},
		mounted() {
			this.getJobInfo()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";
  .title{
    margin: 30px 0 10px;
    font-size: 20px;
  }

  .details {
    color: $main-color;
    width: 100%;
    padding: 30px;

    &__data {
      width: 1040px;
      margin-top: 10px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      box-sizing: border-box;
    }

    &__header {
      padding: 10px 20px;
      border-bottom: 1px solid rgb(197, 191, 181);
    }

    &__title {
      font-size: 20px;
    }

    &__info {
      display: flex;
    }

    &__main {
      width: 70%;
    }

    &__describe {
      width: 30%;
      background-color: #F2EFEB;
    }
  }

</style>
