<template lang="pug">
  .priceFilter
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="step"
        :options="steps"
        placeholder="Step"
        @chooseOption="(e) => setValue(e, 'stepFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="unit"
        :options="units"
        placeholder="Unit"
        @chooseOption="(e) => setValue(e, 'unitFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="size"
        :options="sizes"
        placeholder="Size"
        @chooseOption="(e) => setValue(e, 'sizeFilter')"
      )
</template>
<script>
	import SelectSingle from "../../SelectSingle"

	export default {
		props: {
			step: {
				type: String
			},
			unit: {
				type: String
			},
			size: {
				type: String
			},
			steps: {
				type: Array
			},
			units: {
				type: Array
			},
			sizes: {
				type: Array
			}
		},
		methods: {
			setValue({ option, index }, prop) {
				this.$emit("setFilter", { option, index, prop })
			}
		},
		components: {
			SelectSingle
		}
	}
</script>
<style lang="scss" scoped>
  .priceFilter {
    display: flex;
    position: absolute;
    top: 70px;

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
      margin-right: 20px;
    }
  }
</style>