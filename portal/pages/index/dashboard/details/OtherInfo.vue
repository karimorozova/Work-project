<template lang="pug">
  .other-info
    .other-info__header
      .other-info__photo
        img.other-info__image(v-if="project.accountManager && project.accountManager.photo" :src="domain+project.accountManager.photo")
        img.other-info__image.other-info_no-photo(v-else src="../../../../assets/images/man.png")
      .other__info__item
        LabelValue(title="Account Manager" :value="fullManagerName" customClass="pair_column-flex")
    .other-info__item
      LabelValue(title="Services" :value="getServices()" customClass="pair_column-flex align-centered")
    .other-info__item
      LabelValue(title="Industry" :value="getIndustryName()" customClass="pair_column-flex")
    .other-info__item
      LabelValue(title="Requested On" :value="getFormattedDate(project.startDate)" customClass="pair_column-flex")
    .other-info__item
      LabelValue(title="Suggested Deadline" :value="getFormattedDate(project.deadline)" customClass="pair_column-flex")
</template>

<script>
	import LabelValue from "~/components/LabelValue";
	import moment from "moment";
	import { mapGetters, mapActions } from "vuex";

	export default {
		data() {
			return {
				domain: ""
			}
		},
		methods: {
			getIndustryName() {
				if(this.project.hasOwnProperty('fromXTRF')) {
					return this.project.domain;
				} else {
					return this.project.industry.name
				}
			},
			getFormattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			getServices() {
				if(this.project.status === 'Requested') {
					return this.project.service.title;
				}
				return this.getProjectServices();
			},
			getProjectServices() {
				if(this.project.hasOwnProperty('fromXTRF')) {
					return "--"
				} else {
					let projectServices = "";
					const { tasks } = this.project;
					const tasksServices = tasks.map(item => item.service._id).filter((item, index, arr) => {
						return arr.indexOf(item) === index;
					});
					projectServices = this.allServices.reduce((init, cur) => {
						if(tasksServices.indexOf(cur._id) !== -1) {
							init = !init ? init + cur.title : init + ', ' + cur.title
						}
						return init;
					}, "");
					return projectServices;
				}
			}
		},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
				allServices: "getAllServices"
			}),
			fullManagerName() {
				let result = "";
				if(this.project.accountManager) {
					result = this.project.accountManager.firstName + " " + this.project.accountManager.lastName;
				}
				return result;
			}
		},
		components: {
			LabelValue
		},
		mounted() {
			this.domain = process.env.domain;
		}
	}
</script>


<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .other-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 350px;
    box-sizing: border-box;
    padding: 20px 0;

    &__item {
      margin-top: 20px;
    }

    &__header {
      width: 100%;
      padding: 0 20px 20px;
      box-sizing: border-box;
      border-bottom: 1px solid $light-brown;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &__photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid #c5bfb5;
      margin-bottom: 10px;
      box-sizing: border-box;
      display: -webkit-box;
      -webkit-box-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      align-items: center;
      overflow: hidden;

    }

    &__image {
      max-width: 33px;
      max-height: 33px;
      object-fit: contain;
    }

    &_no-photo {
      margin-right: 2px;
    }
  }

</style>
