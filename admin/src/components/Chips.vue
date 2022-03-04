<template lang="pug">
  .chips
    .chip(v-for="(chip,index) in chips") {{chip}}
      span.closebtn(@click="deleteDataInput(index)") &times;
    input(type="text" :placeholder="placeholder" id="myInput" ref="myInput" v-on:keyup.enter="getDataInput")

</template>
<script>
	export default {
		props: {
			chips: {
				type: Array
			},
			placeholder: {
				type: String,
				default: '...'
			}
		},
		data() {
			return {}
		},
		methods: {
			getDataInput() {
				this.$emit("setChips", { data: event.target.value })
				this.$refs.myInput.value = ""
			},
			deleteDataInput(index) {
				this.$emit("deleteChips", { index })
			}
		}
	}
</script>
<style lang="scss" scoped>
  @import "../assets/scss/colors";

  .chips {
    display: flex;

    .chip {
      display: inline-flex;
      padding: 0 10px;
      height: 20px;
      font-size: 14px;
      line-height: 20px;
      border-radius: 2px;
      margin-right: 5px;
      border: 1px solid $border;
    }

    .closebtn {
      padding-left: 10px;
      opacity: 0.7;
      font-weight: bold;
      float: right;
      font-size: 16px;
      cursor: pointer;
    }

    .closebtn:hover {
      opacity: 1;
    }
  }

  input::placeholder {
    font-size: 14px;
  }

  #myInput {
    height: 18px;
    font-size: 14px;
    border-radius: 2px;
    width: 65px;
    border: 1px solid $border;
    background: transparent;
  }

  #myInput:focus {
    outline: none;
  }
</style>