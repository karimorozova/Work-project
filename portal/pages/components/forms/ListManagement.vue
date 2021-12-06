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

      .list__item(v-for="(item, index) in filteredList" @click="moveItem(item)") {{ item }}

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
			moveItem(item) {
				const el = this.list.find(it => it === item)
				this.$emit('moveItem', el)
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
  @import '../../../assets/scss/colors';


  .search {
    //display: flex;
    //justify-content: flex-end;
    position: relative;

    &__button {
      background: #fff;
      border-radius: 4px;
      height: 30px;
      width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $border;
      font-size: 12px;
      position: absolute;
      top: -38px;
      right: 0;
      cursor: pointer;
      transition: .2s ease-out;
      border: 1px solid $border;

      &:hover {
        color: $text;
      }
    }
  }

  .list {
    width: 220px;
    box-sizing: border-box;
    border: 1px solid $border;
    border-radius: 4px;
    height: 117px;
    overflow-y: auto;

    &__item {
      cursor: pointer;
      padding: 0 7px;
      height: 28px;
      border-bottom: 1px solid #ededed;
      display: flex;
      align-items: center;
      transition: 0.1s cubic-bezier(0.12, 0, 0.39, 0);

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
      background: $table-list;
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

  i {
    margin-top: 1px;
  }
</style>
