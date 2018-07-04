<template lang="pug">
.errorsMessage
  .message
    span {{ dataForRemoveAction.spanTitle }}
    .buttonsBlock
      button.confirm(@click="confirmRemoveComp(ind)") {{ dataForRemoveAction.buttonConf }}
      button.cancel(@click="cancelRemoveComp") {{ dataForRemoveAction.buttonCanc }}
</template>

<script>
export default {
  props: {
    table: {
      type: Object
    },
    dataForRemoveAction: {
      type: Object
    },
    indexToRemove: {
      type: Number
    }
  },
  data() {
    return {
      indexToRemoveComp: this.indexToRemove
    };
  },
  methods: {
    confirmRemoveComp(ind) {
      let vari = this.indexToRemoveComp;
    //  this.table.body.splice(vari, 1);
      this.$emit("confirmFromRemove");
    },
    cancelRemoveComp() {
      this.$emit("cancelFromRemove");
    }
  },
  watch: {
    indexToRemove() {
      this.indexToRemoveComp = this.indexToRemove;
    }
  }
};
</script>

<style lang="scss" scoped>
.errorsMessage {
  width: 300px;
  max-height: 160px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  background-color: white;
  color: red;
  z-index: 20;
  border: 1px solid red;
  box-shadow: 0 0 15px red;
  text-align: center;
  padding-bottom: 15px;
  padding-top: 0;
  font-size: 18px;
  .message {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    span {
      margin-top: 28px;
      margin-bottom: 24px;
    }
    .buttonsBlock {
      display: flex;
      justify-content: space-around;
      width: 100%;
      .confirm,
      .cancel {
        border: 0;
        width: 114px;
        height: 40px;
        border-radius: 12px;
        background-color: #ff876c;
        -webkit-box-shadow: 1px 1px 5px rgba(102, 86, 61, 0.6);
        box-shadow: 1px 1px 5px rgba(102, 86, 61, 0.6);
        font-size: 14px;
        color: #fff;
        outline: none;
        cursor: pointer;
      }
    }
  }
}
</style>