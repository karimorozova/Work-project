<template lang="pug">
  .container(v-if="vendor")
    .group(v-if="!isShowPendingCompetencies")
      .title.with-button Pending Competencies
        Button(value="Create" customClass="width-191" @clicked="showPendingCompetenciesModal")
      PendingCompetencies(
        :pendingCompetenciesData="vendor.pendingCompetencies"
      )
    .group(v-else)
      .title.with-button Create Pending Competencies
        Button(value="Close" customClass="width-191" @clicked="hidePendingCompetenciesModal")
      PendingCompetenciesModal

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
	import PendingCompetencies from "../../../components/overall/internal/PendingCompetencies"
	import PendingCompetenciesModal from "../competencies/index"
	import Competencies from "../../../components/overall/internal/Competencies"
	import DiscountChart from "../../../components/overall/internal/DiscountChart"
  import Button from "../../../components/overall/Button";

	export default {
	  data(){
	    return {
	      isShowPendingCompetencies: false
      }
    },
		components: {Button, DiscountChart, Competencies, Rates, PendingCompetencies,PendingCompetenciesModal },
    methods: {
      showPendingCompetenciesModal() {
        this.isShowPendingCompetencies = true
      },
      hidePendingCompetenciesModal() {
        this.isShowPendingCompetencies = false
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
    padding: 30px;
    position: relative;
  }

  .title {
    margin: 20px 0px;
    font-size: 20px;
  }
  .modal{
    background: white;
    z-index: 3;
  }
  .with-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
