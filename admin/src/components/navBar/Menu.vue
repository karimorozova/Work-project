<template lang="pug">
  .menu
    .item(v-for="element in elements")

      .title(v-if="isTitle(element)") {{element.name}}

      .group(v-if="isGroup(element)" @click.stop="toggleGroup(element)")
        .group__open(v-if="element.isOpen")
          div {{element.name}}
          i.fas.fa-chevron-down
        .group__close(v-if="!element.isOpen")
          div {{element.name}}
          i.fas.fa-chevron-right

      Menu(v-if="isGroup(element) && openSubMenu(element)" :elements="element.children" :path='path' @closeGroup="closeGroup")

      router-link(v-if="isLink(element)" :to="{ path: element.path}" id="link") {{element.name}}
        i.fas.fa-circle

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
		}
	}
</script>

<style scoped lang="scss">

  a {
    color: inherit;
    text-decoration: none;
    display: block;
  }

  %flexBetween {
    display: flex;
    justify-content: space-between;
  }

  .menu {
    color: wheat;
    margin-left: 12px;
  }

  .group {
    cursor: pointer;

    &__open {
      @extend %flexBetween;
      padding: 6px;
      color: white;

      &:hover {
        color: green;
      }
    }

    &__close {
      @extend %flexBetween;
      padding: 6px;

      &:hover {
        color: green;
      }
    }
  }

  #link {
    padding: 6px;
    width: -webkit-fill-available;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;

    &:hover {
      color: green;
    }
  }

  #link.router-link-active,
  #link.router-link-exact-active {
    color: white !important;

    &:hover {
      color: green;
    }
  }

  .fa-circle {
    font-size: 4px;
    margin-right: 6px;
  }


</style>