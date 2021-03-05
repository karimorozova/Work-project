<template lang="pug">
  .rates-filters

    .rates-filters__item
      .rates-filters__drop-menu
        SelectSingle(:selectedOption="sourceSelect" placeholder="Source Language" :options="AllSources" @chooseOption="setSourceFilter" customClass="account")

    .rates-filters__item
      .rates-filters__drop-menu
        SelectSingle(:selectedOption="targetSelect" placeholder="Target Language" :options="AllTargets" @chooseOption="setTargetFilter" customClass="account")

    .rates-filters__item
      .rates-filters__drop-menu
        SelectSingle(:selectedOption="stepSelect" placeholder="Step" :options="AllSteps" @chooseOption="setStepFilter" customClass="account")

    .rates-filters__item
      .rates-filters__drop-menu
        SelectSingle(:selectedOption="unitSelect" placeholder="Unit" :options="AllUnits" @chooseOption="setUnitFilter" customClass="account")

    .rates-filters__item
      .rates-filters__drop-menu
        SelectSingle(:selectedOption="industrySelect" placeholder="Industry" :options="AllIndustries" @chooseOption="setIndustryFilter" customClass="account")

</template>

<script>
	import SelectSingle from "../SelectSingle"

	export default {
		props: {
			sourceSelect: { type: String },
			targetSelect: { type: String },
			stepSelect: { type: String },
			unitSelect: { type: String },
			industrySelect: { type: String },

			AllSources: { type: Array },
			AllTargets: { type: Array },
			AllSteps: { type: Array },
			AllUnits: { type: Array },
			AllIndustries: { type: Array }
		},
		data() {
			return {}
		},
		methods: {
			setSourceFilter({ option }) {
				this.$emit("setSourceFilter", { option })
			},
			setTargetFilter({ option }) {
				this.$emit("setTargetFilter", { option })
			},
			setStepFilter({ option }) {
				this.$emit("setStepFilter", { option })
			},
			setUnitFilter({ option }) {
				this.$emit("setUnitFilter", { option })
			},
			setIndustryFilter({ option }) {
				this.$emit("setIndustryFilter", { option })
			}
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  .rates-filters {
    width: 100%;
    display: flex;

    &__item {
      width: 170px;
      height: 50px;
      margin-right: 8px;
    }

    &__drop-menu {
      position: relative;
      width: 100%;
    }

    &_no-display {
      display: none;
    }
  }
</style>