<template lang="pug">
  .tabs
    .tabs__option(v-for="(tab, index) in tabs" @click="setTab(index)" :class="{'tabs_active': tab === selectedTab}") {{ tab }}
</template>

<script>
	export default {
		props: {
			tabs: {
				type: Array
			},
			selectedTab: {
				type: String
			}
		},
		methods: {
			setTab(index) {
				this.$emit('setTab', { index })
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .tabs {
    display: flex;

    &__option {
      padding: 5px 7px;
      min-width: 110px;
      font-size: 14px;
      border: 1px solid #938676;
      border-bottom: none;
      border-top-right-radius: 10px;
      background-color: #f2efeb;
      cursor: pointer;
      opacity: 0.6;
      z-index: 0;
    }

    &_active {
      background-color: $white;
      opacity: 1;
    }
  }
</style>
