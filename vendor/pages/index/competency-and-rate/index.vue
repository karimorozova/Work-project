<template lang="pug">
  .container(v-if="vendor")
    .title Competencies
    Competencies(
      :competenciesData="vendor.competencies"
    )
    .title Rates
    Rates
    .title Discount Chart
    DiscountChart(
      v-if="vendor.matrix"
      :matrix="Object.values(vendor.matrix)"
    )

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Rates from "../../../components/overall/internal/Rates"
	import Competencies from "../../../components/overall/internal/Competencies"
	import DiscountChart from "../../../components/overall/internal/DiscountChart"

	export default {
		components: { DiscountChart, Competencies, Rates },
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