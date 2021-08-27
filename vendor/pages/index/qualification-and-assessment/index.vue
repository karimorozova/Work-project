<template lang="pug">
  .container(v-if="vendor")
    .title Qualifications Test Status
    Qualifications(
      :qualificationData="vendor.qualifications"
    )
    .title Assessment
    Assessment(
      :assessmentData="vendor.assessments"
    )

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Qualifications from "../../../components/overall/internal/Qualifications"
	import Assessment from "../../../components/overall/internal/Assessment"

	export default {
		components: { Assessment, Qualifications },
		computed: {
			...mapGetters({
				vendor: "getVendor"
			})
		}
	}
</script>

<style lang="scss" scoped>
  .container {
  }

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }
</style>