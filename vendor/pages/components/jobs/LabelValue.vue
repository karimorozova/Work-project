<template lang="pug">
  .pair(:class="customClass")
    label.pair__label {{ title }}
      span.pair__colon(v-if="isColon") :
    span.pair__value {{ value }}
      slot
</template>

<script>
	export default {
		props: {
			title: { type: String },
			value: { type: [String, Number] },
			customClass: { type: String },
			isColon: { type: Boolean }
		}
	}
</script>

<style lang="scss" scoped>

  .pair {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &__label {
      font-family: Myriad600;
    }

    &__value {
      margin-left: 10px;
    }
  }

  .pair_column-flex {
    flex-direction: column;

    .pair__label {
      margin-right: 0;
    }
  }

</style>
