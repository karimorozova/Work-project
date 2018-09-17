<template lang="pug">
.restore
  .restore__form
    label.restore__label Enter your email to get the link for reset your password:
    input.restore__input(v-model='notice' placeholder='Enter your email' )
    button.restore__button Send Link
</template>

<script>
export default {
  data() {
    return {
      notice: ""
    };
  }
};
</script>

<style lang="scss">

.restore {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95vh;
  &__form {
    padding: 20px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    label {
      font-size: 20px;
    }
  }
  &__input {
    height: 41px;
    width: 85%;
    font-size: 20px;
    color: #66563d;
    padding-left: 10px;
    border-radius: 8px;
    border: 2px solid #dedede;
    margin: 20px;
    &::-webkit-input-placeholder {
      opacity: 0.38;
    }
    &::-moz-placeholder {
      opacity: 0.38;
    }
    &:-ms-input-placeholder {
      opacity: 0.38;
    }
    &:focus {
      box-shadow: 0 0 4px #66563d;
      outline: none;
    }
  }
  &__button {
      width: 142px;
      height: 35px;
      border-radius: 8px;
      font-size: 20px;
      background-color: #84ca8e;
      color: #66563d;
  }
}

</style>
