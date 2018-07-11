<template lang="pug">
.restoreMain
    .restoreWrapper
        .restoreForm(v-if="formVisible")
            .emailWrapper
                label Enter your email to get the link for reset your password:
                input.notice(v-model='notice' placeholder='Enter your email' )
            .buttonWrapper
                span.buttonWrapper__backLabel(@click="backEvent") Back
                button(@click='sendForm' v-model='notice' ) Send Link
</template>

<script>

export default {
  data() {
    return {
      notice: "",
      formVisible: true
    };
  },
  methods: {
    backEvent(){
      this.formVisible = false;
      this.$emit('loginVisible', {forgotLink: true})
    }
  },
  computed: {

  }
};
</script>

<style lang="scss" scoped>
.restoreMain {
  background-image: url("../assets/images/image-background.jpg");
}

.restoreWrapper {
  position: absolute;
  margin-left: -250px;
  left: 50%;
  top: 60%;
  margin-top: -266px;
  width: 436px;

  .restoreForm {
    padding: 1%;
    margin: 0 auto;
    width: 436px;
    background-color: #fff;

    .emailWrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 2%;
      margin-bottom: 3%;

      label {
        padding: 1% 0 3% 9%;
        font-size: 20px;
      }

      .notice {
        height: 41px;
        width: 356px;
        font-size: 20px;
        color: #66563d;
        padding-left: 3%;
        border-radius: 8px;
        border: 2px solid #dedede;
        margin: 1% 0 3% 9%;
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
    }

    .buttonWrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4%;

        button {
            width: 142px;
            height: 35px;
            border-radius: 8px;
            font-size: 20px;
            background-color: #84ca8e;
            color: #66563d;
            margin-right: 5%;
        }

        &__backLabel {
        color: #0000ff;
        font-size: 20px;
        margin-left: 9%;
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}
</style>
