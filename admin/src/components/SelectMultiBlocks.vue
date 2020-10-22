<template lang="pug">
  .multiBlocks
    .multiBlocks__body
      .multiBlocks__body-row
        .multiBlocks__left-block
          .multiBlocks__left-list(v-for="(item) in pickFilteredOptions")
            span  {{ item }}
        .multiBlocks__central-block
        .multiBlocks__right-block
          .multiBlocks__right-list(v-for="(item) in selectedOptions")
            span  {{ item }}

</template>

<script>
	export default {
		props: {
			options: {
				type: Array,
			},
			selectedOptions: {
				type: Array,
			}
		},
		data() {
			return {
				// key: value
			}
		},
		methods: {
			chooseOptions(index) {
				this.$emit("chooseOptions", { option: this.filteredOptions[index] });
				// this.searchFocus();
			},
		},
		computed: {
			pickFilteredOptions() {
				let result = this.options.filter(item => !this.selectedOptions.includes(item));
				return result;
			},
			filteredOptions() {
				let result = this.options;
				if(this.searchValue) {
					return result.filter(item => item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1);
				}
				return result;
			}
		},
	}
</script>
<style lang="scss" scoped>
  .multiBlocks {
    &__body-row {
      display: flex;
      justify-content: center;
    }

    &__central-block {
      width: 90px;
      height: 220px;
    }

    &__left-block {
      border: 1px solid black;
      width: 170px;
      height: 220px;
      overflow-y: auto;
    }

    &__right-block {
      border: 1px solid black;
      width: 170px;
      height: 220px;
      overflow-y: auto;
    }
    &__left-list{
      padding: 2px 3px;
      font-size: 14px;
    }
    &__right-list{
      padding: 2px 3px;
      font-size: 14px;
    }

    &__body {
      width: 450px;
      /*height: 220px;*/
      background: #ffffff;
      box-shadow: 0 0 10px black;
      position: absolute;
      z-index: 9999;
      padding: 20px;
    }
  }
</style>