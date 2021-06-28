<template lang="pug">
  .menu
    .elements(v-for="element in elements")

      .title(v-if="isTitle(element)" :style="elementPadding") {{element.name}}

      .element(:style="elementPadding")
        .group(v-if="isGroup(element)" @click.stop="toggleGroup(element)")

          .group__open(v-if="element.isOpen")
            .group__open-image
              img(:src="require(`../../assets/images/navbar-icons/testicon.png`)")
              div {{element.name}}
            i.fas.fa-chevron-down

          .group__close(v-if="!element.isOpen")
            .group__close-image
              img(:src="require(`../../assets/images/navbar-icons/testicon-close.png`)")
              div {{element.name}}
            i.fas.fa-chevron-right

      .element(:style="elementPadding")
        router-link(v-if="isLink(element)" :to="{ path: element.path}" id="link") {{element.name}}
          i.fas.fa-circle

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
				elementPadding: { 'padding-left': 14 * this.menuIterator + 'px' }
			}
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

  img {
    margin-right: 5px;
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
  }

  .menu {
    color: wheat;
  }

  .title {
    font-family: 'Myriad300';
    margin-top: 10px;
    margin-bottom: 2px;
    color: lightgrey;
    letter-spacing: 0.5px;
    font-size: 12px;
  }

  .element {
    transition: .1s linear;
  }

  .element:hover {
    background: #222;
  }

  .group {
    cursor: pointer;
    font-family: 'Myriad600';
    font-size: 14px;

    &__open {
      @extend %flexBetween;
      padding: 8px 14px 8px 0;
      color: white;

      &-image {
        display: flex;
        align-items: center;
      }
    }

    &__close {
      @extend %flexBetween;
      padding: 8px 14px 8px 0;

      &-image {
        display: flex;
        align-items: center;
      }
    }
  }

  #link {
    padding: 8px 14px 8px 0;
    width: -webkit-fill-available;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
  }

  #link.router-link-active,
  #link.router-link-exact-active {
    color: white !important;
  }

  .fa-circle {
    font-size: 4px;
    margin-right: 5px;
    width: 16px;
    text-align: center;
  }

  .fa-chevron-right,
  .fa-chevron-down {
    font-size: 13px;
  }

</style>