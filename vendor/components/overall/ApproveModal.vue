<template lang="pug">
  .approve-modal
    .approve-modal__text {{ text }}
    .approve-modal__buttons
      .approve-modal__button(@click.stop="approve")
        Button(:value="approveValue")
      .approve-modal__button(@click.stop="notApprove")
        Button(:value="notApproveValue")
    span.approve-modal__close(@click.stop="close") &#215;
</template>

<script>
import Button from "./Button"
import SelectSingle from "./SelectSingle"

export default {
  props: {
    text: {
      type: String
    },
    approveValue: {
      type: String
    },
    notApproveValue: {
      type: String
    }
  },
  data() {
    return {}
  },
  methods: {
    approve() {
      this.$emit("approve")
    },
    notApprove() {
      this.$emit("notApprove")
    },
    close() {
      this.$emit("close")
    },
    onKeyDown(e) {
      e.keyCode === 27 && this.notApprove()
      e.keyCode === 13 && this.approve()
    }
  },
  components: {
    Button,
    SelectSingle
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeyDown)
  },
  async created() {
    document.addEventListener('keydown', this.onKeyDown)
  }
}
</script>

<style lang="scss">
@import "../../assets/scss/colors.scss";

.approve-modal {
  position: relative;
  padding: 20px;
  box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  background-color: $white;
  font-size: 16px;

  &__buttons {
    margin-top: 10px;
    display: flex;
  }

  &__button {
    margin: 5px;
  }

  &__close {
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }
}
</style>
