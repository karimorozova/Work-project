<template lang="pug">
.ratio
    .ratio__title Currency ratio:          
    .ratio__element 1 &euro;
    .ratio__element =
    .ratio__element
        .ratio__input 
            input(type="number" v-model="currencyUsd")
            span.ratio__input-symbol &#36;
    .ratio__element =
    .ratio__element
        .ratio__input
            input(type="number" v-model="currencyGbp")
            span.ratio__input-symbol &pound;
    .ratio__element
        .ratio__button(@click="saveCurrency")
            img(src="../../../assets/images/Other/save-icon-qa-form.png")


</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      currencyUsd: null,
      currencyGbp: null
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    saveCurrency() {
      console.log(this.currencyUsd);
      console.log(this.currencyGbp);
      try {
      } catch (err) {}
    }
  }
};
</script>
<style lang="scss" scoped>
.ratio {
  padding-top: 20px;
  padding-left: 20px;
  display: flex;
  align-items: center;
  &__input{
      &-symbol{
          margin-left: 4px;
      }
  }
  &__button {
    cursor: pointer;
    height: 20px;
    margin-left: 2px;
  }
  &__element{
      margin-left: 10px;
  }
}
input {
  color: #67573e;
  height: 22px;
  border-radius: 5px;
  width: 30px;
  border: 1px solid #67573e;
}
input {
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
input:focus {
  outline: none;
}
</style>