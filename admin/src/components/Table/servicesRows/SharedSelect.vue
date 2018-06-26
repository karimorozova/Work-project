<template lang="pug">
    .sharedSelect
        select.first(name="Options")
            option.second(v-for="(sel, ind) in selectBool" :ind="sel.id") {{ sel }}
</template>

<script>
export default {
  props: {
    selectBool: {
      type: Array
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.sharedSelect {
  flex-basis: 16%;
  .first {
    border: 1px solid #9a8f80;
    width: 100%;
    background-color: #fff;
    outline: none;
    padding: 13px 0 13px 6px;
    color: #68573e;
  }
  .second {
    background-color: #fff;
  }
  .second:not(:checked) {
    background-color: #fff;
  }
  .second:checked {
    background-color: #fff;
  }
}
</style>