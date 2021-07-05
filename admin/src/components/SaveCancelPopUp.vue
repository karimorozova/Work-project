<template lang="pug">
  .pop-up-window
    .pop-up-window__body
      .pop-up-window__bottons
        Button.btn(:value="btnAcceptText || 'Save'" @clicked="accept")
        Button.btn(:outline="true" :value="btnCancelText || 'Cancel'" @clicked="cancel")
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
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    background-color: white;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 600;
    animation-duration: 0.3s;
    animation-name: slidein;
  }
  .pop-up-window__body {
    display: flex;
    align-items: center;
    position: relative;
    left: 310px;
    height: 80px;
  }
  .pop-up-window__bottons {
    padding-right: 15px;
    /*border-right: 1px solid #ccc;*/
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
