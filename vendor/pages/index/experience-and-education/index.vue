<template lang="pug">
  .container(v-if="vendor")
    .title Professional Experience
    ProfessionalExperience(
      :professionalExperienceData="vendor.profExperiences"
      :vendorId="vendor._id"
    )
    .title Education
    Education(
      :educationData="vendor.educations"
      :vendorId="vendor._id"
    )

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import ProfessionalExperience from "../../../components/overall/internal/ProfessionalExperience"
	import Education from "../../../components/overall/internal/Education"

	export default {
		components: { Education, ProfessionalExperience },
		computed: {
			...mapGetters({
				vendor: "getVendor"
			})
		}
	}
</script>

<style lang="scss" scoped>
  .container {
    color: #67573E;
    padding: 30px;
  }

  .title {
    margin: 20px 0px;
    font-size: 20px;
  }
</style>