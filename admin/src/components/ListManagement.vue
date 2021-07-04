<template lang="pug">
  .managment
    .search
      .search__button(@click="toggleShowBox")
        i.fas.fa-filter
    .list
      .list__input(v-if="isSearchBox")
        input(type="text" v-model="searchValue" :placeholder="'🔎︎  Search'" ref="search")
        .list__input-icon(v-if="searchValue")
          span(@click="clearFilter")
            i.fas.fa-times-circle

      .list__item(v-for="(item, index) in filteredList" @click="moveItem(index)") {{ item }}

</template>

<script>
	export default {
		props: {
			list: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				isSearchBox: false,
				searchValue: ''
			}
		},
		methods: {
			moveItem(index) {
				this.$emit('moveItem', index)
			},
			toggleShowBox() {
				this.isSearchBox = !this.isSearchBox
				this.searchValue = ''
			},
			clearFilter() {
				this.searchValue = ''
			}
		},
		computed: {
			filteredList() {
				let result = this.list
				if (this.searchValue) return result.filter(item => item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1)
				return result
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';


  .search {
    display: flex;
    justify-content: flex-end;
    position: relative;

    &__button {
      background: $border;
      border-radius: 4px;
      height: 24px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      position: absolute;
      top: -28px;
      cursor: pointer;
      transition: .2s ease-out;
    }
  }

  .list {
    width: 200px;
    box-sizing: border-box;
    border: 1px solid $border;
    border-radius: 4px;
    height: 257px;
    overflow-y: auto;

    &__item {
      cursor: pointer;
      padding: 0 7px;
      height: 31px;
      border-bottom: 1px solid #ededed;
      display: flex;
      align-items: center;
      transition: .2s cubic-bezier(0.22, 0.61, 0.36, 1);

      &:hover {
        background-color: $list-hover;
      }

      user-select: none;
    }

    &__input {
      width: 100%;
      position: relative;

      &-icon {
        position: absolute;
        top: 7px;
        right: 7px;
        font-size: 16px;
        cursor: pointer;
      }
    }

    input {
      background: $body;
      box-sizing: border-box;
      width: 100%;
      padding: 0 7px;
      outline: none;
      border: none;
      height: 32px;
      color: $text;
      border-bottom: 1px solid $border;
    }
  }

  i{
    margin-top: 1px;
  }
</style>
