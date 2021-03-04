<template lang="pug">
  .file-list
    .file-list__items(v-for="(file, index) in files")
      .file-list__item
        .file-list__name {{file.name}}
        span.file-list__delete(@click="deleteFile(index)") &#x2715

</template>

<script>
	export default {
		props: {
			files: {
				type: Array
			}
		},
		methods: {
			deleteFile(index) {
				this.files.splice(index, 1)
			}
		}
	}
</script>

<style lang="scss" scoped>
  .file-list {

    &__items {
      position: relative;
    }

    &__name {
      color: #aba294;
    }

    &__item {
      border-radius: 10px;
      border: 1px solid #c3c5c5;
      box-sizing: border-box;
      background-color: transparent;
      font-size: 12px;
      padding: 10px;
      margin: 0;
      width: 100%;
      display: flex;
      -webkit-box-pack: justify;
      justify-content: space-between;
      -webkit-box-align: center;
      align-items: center;
      position: relative;
      margin-top: 5px;
      font-family: -webkit-pictograph;
    }

    &__delete {
      cursor: pointer;
      transform: 0.2s ease;

      &:hover {
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
</style>
