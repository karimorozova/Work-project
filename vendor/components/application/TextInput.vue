<template lang="pug">
  .text-input
    .text-input__label {{ label }}:
    input.text-input__input(:type="type" :name="name" placeholder="Value"  @input="setValue" @click="selectAll")
    span.text-input__example(v-if="example") {{ example }}

</template>

<script>
export default {
  props: {
    label: {
      type: String
    },
    name: {
      type: String
    },
    example: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    },
    selectWhenClicked: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    setValue({ target: { value, name } }) {
      this.$emit("setValue", { property: name, value: value })
    },
    selectAll(e) {
      if (this.selectWhenClicked) e.target.select()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.text-input {
  display: flex;
  flex-direction: column;

  &__label {
    font-size: 14px;
    margin-bottom: 4px;
  }

  &__input {
    padding: 0px 7px;
    border: 1px solid $border;
    border-radius: 4px;
    outline: none;
    height: 32px;
    width: 220px;
    box-sizing: border-box;
  }

  &__example {
    font-size: 14px;
    opacity: 0.5;
    margin-top: 5px;
  }
}

</style>
