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
    color: #67573E;
    padding: 30px;
  }

  .title {
    margin: 20px 0px;
    font-size: 20px;
  }
</style>