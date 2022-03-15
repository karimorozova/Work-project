<template lang="pug">
  .navbar-list-wrapper
    .items
      .item(
        ref="item"
        v-for="item in items"
        @click="openCurrentLink(item._id)"
      )
        .item__1(:class="{'selected': item._id === $route.params.id}") {{ item.item1 }}
        .item__2 {{ item.item2 }}
        .item__3 {{ item.item3 }}
        .item__4(v-if="item.item4" ) {{ item.item4 }}
</template>

<script>

export default {
  name: 'NavbarList',
  props: {
    items: {
      type: Array
    },
    basicLink: {
      type: String
    }
  },
  data() {
    return {}
  },
  methods: {
    openCurrentLink(id) {
      this.$router.push({ path: `${ this.basicLink }` + id })
    },
    setScrollBySelectedElement() {
      this.$nextTick(() => {
        const _idx = this.items.findIndex(({ _id }) => _id === this.$route.params.id)
        this.$refs.item[_idx].scrollIntoView({ block: "center" })
      })
    }
  },
  computed: {},
  created() {
    this.setScrollBySelectedElement()
  },
  components: {}

}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.items {
  margin-top: 46px;
  margin-bottom: 46px;
}

.item {
  padding: 14px 12px 12px 18px;
  border-bottom: 1px solid $light-border;
  transition: .1s ease-out;

  &__1 {
    margin-bottom: 6px;
  }

  &__2,
  &__3,
  &__4 {
    color: #6666;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-bottom: 2.5px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  &:hover {
    background: $list-hover;
    cursor: pointer;
  }
}

.navbar-list-wrapper {
  position: fixed;
  left: 255px;
  top: 0px;
  bottom: 0;
  width: 155px;
  z-index: 39;
  box-sizing: border-box;
  background: white;
  border-right: 1px solid $light-border;

  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0px;
  }
}

.selected {
  color: $red;
}


</style>