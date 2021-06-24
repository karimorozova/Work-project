<template lang="pug">
  .menu
    .menu__item(v-for="element in elements")

      .item__title(v-if="isTitle(element)") {{element.name}}

      .item__group(v-if="isGroup(element)" @click.stop="toggleGroup(element)")
        .item__group-open(v-if="element.isOpen")
          div {{element.name}}
          i.fas.fa-chevron-down
        .item__group-close(v-if="!element.isOpen")
          div {{element.name}}
          i.fas.fa-chevron-right

      Menu(v-if="isGroup(element) && openSubMenu(element)" :elements="element.children" :path='path' @closeGroup="closeGroup")

      .item__link(v-if="isLink(element)")
        router-link(:to="{ path: element.path}") {{element.name}}

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
			return {}
		},
		methods: {
			isGroup: ({ type }) => type === 'group',
			isLink: ({ type }) => type === 'link',
			isTitle: ({ type }) => type === 'title',

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
		},
		watch: {}
	}
</script>

<style scoped lang="scss">

  %hoverItem {
    background-color: #222;
    cursor: pointer;
    color: white;
  }

  .item {
    &__group {
      &-open {

      }

      &-close {

      }
    }
  }

  /*  .menu {
      font-size: 14px;
      text-transform: uppercase;
      !*color: #fcfcfc;*!
      color: wheat;

      &__items {
        !*margin: 5px 0;*!
      }

      .link {
        text-decoration: none;
        color: wheat;
        padding: 10px;
        display: block;

        &:hover {
          @extend %hoverItem;
        }
      }

      !*.title {*!
      !*  color: #cccccc;*!
      !*}*!
    }*/

  /*  .group {
      cursor: pointer;
      color: #ebbb46;

      &__text {
        padding: 10px;
        display: flex;
        justify-content: space-between;

        &:hover {
          @extend %hoverItem;
        }
      }

      &__textOpen {
        padding: 10px;
        display: flex;
        justify-content: space-between;
        color: white;
        background-color: #222;
        cursor: pointer;
      }
    }*/

  .link.router-link-active,
  .link.router-link-exact-active {
    background-color: #222;
    color: white !important;
  }

</style>