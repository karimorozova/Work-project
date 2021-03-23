<template lang="pug">
  .native-language
    .native-language__title {{ label }}
    .drop-relative
      .drop-select(v-click-outside="outClick")
        .select(@click="toggleLangs")
          span.selected.chosen-lang(v-if="selectedLang.lang") {{ selectedLang.lang }}
          span.selected(v-else) {{ placeholder }}
          .arrow-button
            img(src="../../../assets/images/arrow_open.png" :class="{'reverse-icon': droppedLang}")
        input.search(v-if="droppedLang" v-model="searchLang" placeholder="Search")
        .drop(v-if="droppedLang")
          .drop__item(v-for="(language, index) in removeEnglishLang(filteredLangs)" @click="chooseLang(index)" :class="{'active-lang': selectedLang.lang == language.lang}")
            span {{ language.lang }}
</template>

<script>
	import ClickOutside from "vue-click-outside"
	import { mapGetters, mapActions } from "vuex"
  import removeLang from "../../../mixins/removeLang";

	export default {
	  mixins: [removeLang],
		props: {
			selectedLang: {
				type: Object,
				default: () => {
					return { lang: "" }
				}
			},
			label: {
				type: String,
				default: ""
			},
			placeholder: {
				type: String,
				default: ""
			},
			parentIndex: {
				type: Number
			}
		},
		data() {
			return {
				languages: [],
				droppedLang: false,
				errors: [],
				searchLang: ''
			}
		},
		methods: {
			...mapActions({
				getAllLanguages: 'getAllLanguages'
			}),
			toggleLangs(event) {
				let elementsObj = event.composedPath()
				let tr = elementsObj.find(item => {
					if (item.localName == "tr") {
						return item
					}
				})
				let top = 0
				let height = 0
				if (tr) {
					top = tr.offsetTop
					height = tr.offsetHeight
				}
				this.droppedLang = !this.droppedLang
				this.$emit('scrollDrop', { drop: this.droppedLang, offsetTop: top, offsetHeight: height })
			},
			outClick() {
				this.droppedLang = false
				this.searchLang = ""
			},
			chooseLang(index) {
				this.$emit("chooseLang", { lang: this.filteredLangs[index], index: this.parentIndex })
				this.outClick()
			},

		},
		computed: {
			...mapGetters({
				allLanguages: 'getLangs'
			}),
			filteredLangs() {
				let result = this.removeEnglishLang(this.allLanguages.filter(item => {
					if (item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
						return item
					}
				}))
				return result
			}
		},
		directives: {
			ClickOutside
		},
		created() {
			this.getAllLanguages()
		},
		mounted() {
		}
	}
</script>

<style lang="scss" scoped>

  .native-language__title {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .drop-relative {
    position: relative;
    height: 42px;
  }
  .drop-select {
    position: absolute;
    width: 100%;
    left: 0;
    border: 1px solid #c3c5c5;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .drop {
      font-size: 14px;
      width: 100%;
      max-height: 188px;
      overflow-y: scroll;
      overflow-x: hidden;
      flex-direction: column;
      background-color: white;
      z-index: 60;

      &__item {
        align-items: center;
        padding: 6px;
        border-bottom: .5px solid #C4BEB6;
        cursor: pointer;
        transition: ease 0.2s;

        &:last-child {
          border: none;
        }

        &:hover {
          background-color: rgba(191, 176, 157, 0.363);
        }
      }

      .active-lang {
        background-color: rgba(102, 86, 61, 0.7);
        color: #FFF;
      }
    }

    .search {
      z-index: 50;
      width: 100%;
      padding: 10px;
      color: #67573E;
      outline: none;
      box-shadow: inset 0 0 7px #C4BEB6;
      border: 1px solid #c3c5c5;
      box-sizing: border-box;
    }
  }

  .select {
    border-radius: 15px;
    width: 100%;
    /*height: 36px;*/
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    .selected {
      width: 80%;
      padding: 10px;
      font-size: 14px;
      opacity: 0.6;
      max-height: 38px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
    }

    .chosen-lang {
      opacity: 1;
    }

    .arrow-button {
      width: 20%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        padding-right: 2px;
      }

      .reverse-icon {
        transform: rotate(180deg);
      }
    }
  }

</style>
