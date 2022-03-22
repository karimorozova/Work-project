<template lang="pug">
  .template
    .icons
      .icons__icon(v-if="hasFilterButton")
        IconButton(@clicked="toggleFilters")
          i(v-if="isFilterActive" class="fa-solid fa-filter-circle-xmark")
          i(v-else class="fa-solid fa-filter")
      .icons__icon(v-if="hasClearButton")
        IconButton(@clicked="clearFilters")
          i(class="fa-solid fa-broom")

    .layout-wrapper
      transition(name='show')
        .layout-wrapper__filters(
          :style="{ 'height': innerHeight - 171 + 'px' }"
          v-if="isFilterActive"
        )
          slot(name="filters")

      .layout-wrapper__table(
        :style="{'width': getTableWidth + 'px'}"
      )
        slot(name="table")

</template>

<script>
import IconButton from "./IconButton"

export default {
  name: "LayoutsListWrapper",
  components: { IconButton },
  props: {
    isFilterActive: {
      type: Boolean,
      default: false
    },
    hasFilterButton: {
      type: Boolean,
      default: false
    },
    hasClearButton: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerHeight: 0,
      innerWidth: 0
    }
  },
  mounted() {
    this.innerHeight = window.innerHeight
    this.innerWidth = window.innerWidth
    if (Object.values(this.$route.query).filter(Boolean).length) {
      this.toggleFilters()
    }
  },
  computed: {
    getTableWidth() {
      const menu = 255
      const margins = 100
      const filters = this.isFilterActive ? 286 : 0
      return this.innerWidth - menu - margins - filters
    }
  },
  methods: {
    toggleFilters() {
      this.$emit('toggleFilters')
    },
    clearFilters() {
      this.$emit('clearFilters')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.template {
  position: relative;
}

.icons {
  left: 50px;
  top: -40px;
  position: absolute;
  display: flex;
  gap: 10px;

  &__icon {

  }
}

.layout-wrapper {
  margin: 50px 50px 0 50px;
  display: flex;

  &__table {
    position: relative;
    //border-radius: 2px;
    //padding: 25px;
    //box-shadow: $box-shadow;
    //background: white;
    //height: fit-content;
    //overflow: auto;
    //transition: .1s linear;
  }

  &__filters {
    position: relative;
    width: 275px;
    display: flex;
    justify-content: center;
    padding: 20px 0px;
    background: white;
    overflow: auto;
    border-top: 1px solid $light-border;
    border-bottom: 1px solid $light-border;
    border-left: 1px solid $light-border;

    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0px;
    }
  }
}

.show-enter-active,
.show-leave-enter {
  //transform: translateX(0);
  //transition: all .1s linear;
}

.show-enter,
.show-leave-to {
  //transform: translateX(-100%);
  //transition: all .1s ease-in;
  //transition: .1s ease-in;
}

</style>