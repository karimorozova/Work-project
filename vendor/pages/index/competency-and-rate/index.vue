<template lang="pug">
  .container(v-if="vendor")
    .title Pending Competencies
    .button
      Button(value="Create Competency" @clicked="redirectToModal")
    PendingCompetencies(
      :pendingCompetenciesData="vendor.pendingCompetencies"
    )

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
	import { mapGetters } from "vuex"
	import Rates from "../../../components/overall/internal/Rates"
	import PendingCompetencies from "../../../components/overall/internal/PendingCompetencies"
	import PendingCompetenciesModal from "../competencies/index"
	import Competencies from "../../../components/overall/internal/Competencies"
	import DiscountChart from "../../../components/overall/internal/DiscountChart"
  import Button from "../../../components/overall/Button";

	export default {
		components: {Button, DiscountChart, Competencies, Rates, PendingCompetencies,PendingCompetenciesModal },
    methods: {
		  redirectToModal() {
		    this.$router.push('competencies')
		  }
    },
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
    padding: 20px 40px;
    position: relative;
  }

  .title {
    margin: 30px 0px 10px;
    font-size: 20px;
  }
  .button {
    position: absolute;
    top: 30px;
    right: 40px;
  }
</style>
