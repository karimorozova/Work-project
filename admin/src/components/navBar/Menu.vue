<template lang="pug">
  .menu
    .elements(v-for="(element, index) in elements" :key="index")

      .row(v-if="isRow(element)")

      .title(v-if="isTitle(element)")
        .title__row
        .title__text {{element.name}}

      .element(:style="elementPadding")

        .group(v-if="isGroup(element)" @click.stop="toggleGroup(element)")

          span(v-if="element.hasOwnProperty('parent')")
            .group__open(style="margin-left: -8px;" v-if="element.isOpen")
              .group__open-image
                img(:src="require(`../../assets/images/navbar-icons/${element.name}.svg`)")
                div(style="margin-top: 2px;") {{element.name}}
              i.fas.fa-chevron-right
            .group__close(style="margin-left: -8px;" v-if="!element.isOpen")
              .group__close-image
                img(:src="require(`../../assets/images/navbar-icons/${element.name}.svg`)")
                div(style="margin-top: 2px;") {{element.name}}
              i.fas.fa-chevron-down

          span(v-else)
            .group__open(v-if="element.isOpen")
              div {{element.name}}
              i.fas.fa-chevron-right

            .group__close(v-if="!element.isOpen")
              div {{element.name}}
              i.fas.fa-chevron-down

      .element(:style="elementPadding")
        router-link(v-if="isLink(element)" :to="{ path: element.path}" id="link")
          span {{element.name}}
          span.fontIcon__add(v-if="element.name.includes('Add')" )
            //i.fa-regular.fa-square-plus
            | +

      Menu(
        v-if="isGroup(element) && openSubMenu(element)"
        :menuIterator="menuIterator + 1"
        :elements="element.children"
        :path='path'
        @closeGroup="closeGroup"
      )

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
    },
    menuIterator: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      elementPadding: { 'padding-left': 26 * this.menuIterator + 'px' }
    }
  },
  methods: {
    isGroup: ({ type }) => type === 'group',
    isLink: ({ type }) => type === 'link',
    isTitle: ({ type }) => type === 'title',
    isRow: ({ type }) => type === 'row',

    toggleGroup(element) {
      if (element.parent && !element.isOpen) this.closeChild(this.elements)
      element.isOpen = !element.isOpen
    },

    closeChild(currentElement) {
      for (let i = 0; i < currentElement.length; i++) {
        currentElement[i].isOpen = false
        if (currentElement[i].type === 'group') {
          this.closeChild(currentElement[i].children)
        }
      }
    },
    closeGroup() {
      this.elements.forEach(elem => elem.isOpen = false)
    },
    openSubMenu(element) {
      return element.isOpen === true
    },
    openCurrentPath(currentElement, path) {
      if (path.length < 1) return
      const currentPath = path.shift()

      for (let i = 0; i < currentElement.length; i++) {
        if (currentPath === currentElement[i].path) {
          currentElement[i].isOpen = true
          if (currentElement[i].type === 'group') {
            this.openCurrentPath(currentElement[i].children, path)
          }
        }
      }
    }
  },
  created() {
    if (this.elements.some(element => element.hasOwnProperty('parent'))) {
      let path = this.$route.path.split('/')
      path.shift()
      this.openCurrentPath(this.elements, path)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

img {
  margin-right: 14px;
}

a {
  color: inherit;
  text-decoration: none;
  display: block;
}

%flexBetween {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /*letter-spacing: 0.1px;*/
}

%row {
  border-bottom: 1px solid $light-border;
  //margin-top: 10px;
}

.menu {
  color: $text;
  margin: 5px 0 10px 0;
}

.row {
  @extend %row
}

.title {
  &__row {
    @extend %row
  }

  &__text {
    color: #9999;
    font-size: 11px;
    margin-left: 13px;
    margin-top: 5px;
    position: absolute;
    display: flex;
    justify-content: flex-end;
    width: 250px;
    font-family: Myriad300;
    letter-spacing: .7px;
  }
}

.elements {
  position: relative;
}

.element {
  transition: 0.1s cubic-bezier(0.12, 0, 0.39, 0);
}

.element:hover {
  background: $list-hover;
}

.group {
  cursor: pointer;
  font-size: 15px;
  font-family: 'Myriad600';

  &__open {
    @extend %flexBetween;
    padding: 10px 12px 10px 0;

    &-image {
      display: flex;
      align-items: center;
      height: 20px;
      width: 20px;

      img {
        height: 20px;
        width: 20px;
      }
    }
  }

  &__close {
    @extend %flexBetween;
    padding: 10px 12px 10px 0;

    &-image {
      display: flex;
      align-items: center;
      height: 20px;
      width: 20px;

      img {
        height: 20px;
        width: 20px;
      }
    }
  }
}

#link {
  padding: 10px 0px;
  width: -webkit-fill-available;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  align-items: center;
  font-family: 'Myriad400';
  font-size: 15px;
  /*letter-spacing: 0.1px;*/
}

#link.router-link-active,
#link.router-link-exact-active {
  color: $red !important;
}

.fa-chevron-right,
.fa-chevron-down {
  font-size: 13px;
}

.fontIcon {
  &__add {
    font-size: 16px;
    margin-right: 10px;
  }
}

</style>