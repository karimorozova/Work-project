<template lang="pug">
  .tabs
    .tabs__option(
      v-for="(tab, index) in tabs"
      @click="setTab(index)"
      :class="{'tabs_active': tab === selectedTab}"
    ) {{ tab }}

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
				this.$emit("setTab", { index })
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors";

  .tabs {
    display: flex;

    &__option {
      cursor: pointer;
      border-left: none;
      border-top: 1px solid $border;
      border-right: 1px solid $border;
      min-width: 120px;
      border-bottom: none;
      background-color: $body;
      padding: 1px 15px 0 8px;
      height: 31px;
      display: flex;
      align-items: center;
      color: #6666;

      &:first-child {
        border-left: 1px solid $border !important;
        border-top-left-radius: 4px;
      }

      &:last-child {
        border-top-right-radius: 4px;
      }
    }

    &_active {
      background-color: $white;
      color: $text;
    }
  }
</style>
