<template lang="pug">
  .menu
    .menu__items(v-for="element in elements")
      span(v-if="element.type === 'title'" class="title") {{element.name}}
      .group__text(v-if="element.type === 'group'" @click.stop="toggleGroup(element)")
        span {{element.name}}
        i.fas.fa-chevron-down(v-if="element.isOpen")
        i.fas.fa-chevron-left(v-else)
      Menu(v-if="element.type === 'group' && openSubMenu(element)" class="group" :elements="element.children" :path='path' @closeGroup="closeGroup")
      router-link(v-if="element.type === 'link'" class="link" :class="{'red-color': element.isOpen}" :to="{ path: element.path}") {{element.name}}

</template>

<script>
export default {
  name: "Menu",
  props: {
    elements: {
      type: Array,
      default: []
    },
    path: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
    }
  },
  methods: {
    toggleGroup(element) {
      if (element.parent && !element.isOpen) this.closeChild(this.elements)

      element.isOpen = !element.isOpen

    },

    closeChild(currentElement) {
      for (let i = 0; i < currentElement.length; i++) {
        currentElement[i].isOpen = false
        if(currentElement[i].type === 'group') {
           this.closeChild(currentElement[i].children)
        }
      }
    },
    closeGroup() {
      this.elements.forEach(elem => elem.isOpen = false )
    },
    openSubMenu(element) {
      return  element.isOpen === true
    },
    openCurrentPath(currentElement, path) {
      if (path.length < 1) return
      const currentPath = path.shift()

      for (let i = 0; i < currentElement.length; i++) {
        if (currentPath === currentElement[i].path) {
          currentElement[i].isOpen = true
          if(currentElement[i].type === 'group') {
            this.openCurrentPath(currentElement[i].children, path)
          }
        }
      }
    },

  },
  created() {
    if(this.elements.some(element => element.hasOwnProperty('parent'))) {
      let path = this.$route.path.split('/')
      path.shift()
      this.openCurrentPath(this.elements, path)
    }
  },
  watch: {

  }
}
</script>

<style scoped lang="scss">
.link.router-link-active,
.link.router-link-exact-active {
  background-color: indianred;
}
.menu {
  font-size: 14px;
  /*font-family: 'Myriad600', sans-serif;*/
  text-transform: uppercase;
  color: #fcfcfc;
  &__items {
    /*margin: 5px 0;*/
  }
  .link {
    text-decoration: none;
    color: #4BA5A5;
  }
  .title {
    color: #cccccc;
  }
}
.group {
  padding-left: 15px;
  cursor: pointer;
  color: #ebbb46;
  &__text {
    display: flex;
    justify-content: space-between;
  }
}
</style>