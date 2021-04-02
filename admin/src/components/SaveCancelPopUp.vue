<template lang="pug">
  .pop-up-window
    .pop-up-window__body
      .pop-up-window__bottons
        Button.btn(:value="btnAcceptText || 'Save'" @clicked="accept")
        Button.btn(:value="btnCancelText || 'Cancel'" @clicked="cancel")
      .pop-up-window__text {{text}}
</template>

<script>
import Button from "./Button";
export default {
  props: {
    text: String,
    btnAcceptText: String,
    btnCancelText: String,
  },
  data() {
    return {
    }
  },
  methods: {
    accept() {
      this.$emit('accept')
    },
    cancel() {
      this.$emit('cancel')
    }
  },
  components: {Button}
}
</script>

<style scoped lang="scss">
  .pop-up-window {
    box-shadow: 0 2px 5px rgba(103,87,62,.3),0 2px 6px 2px rgba(103,87,62,.15);
    background-color: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    animation-duration: 0.3s;
    animation-name: slidein;
  }
  .pop-up-window__body {
    display: flex;
    align-items: center;
    padding:  20px 0;
    position: relative;
    left: 335px;
    width: 1000px;
  }
  .pop-up-window__bottons {
    padding-right: 15px;
    border-right: 1px solid #ccc;
    display: flex;
    .btn {
      margin: 0 10px;
    }
  }

  .pop-up-window__text {
    padding-left: 15px;
  }

  @keyframes slidein {
    from {
      bottom: -50px;
    }

    to {
      bottom: 0;
    }
  }
</style>
