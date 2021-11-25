<template lang="pug">
  .sender(v-if="user._id && users.length")
    .sender__title New message
    .sender__close(@click="close") &#215;

    .header
      .header__block
        .header__block-title To:
        .header__block-drop
          input(type="text" disabled="true" :value="to")

      .header__block
        .header__block-title From:
        .header__block-drop
          SelectSingle(
            placeholder="Option"
            :hasSearch="true"
            :selectedOption="from"
            :options="users.filter(i => i.isActive).map(i => i.email)"
            @chooseOption="setFrom"
          )

      .header__block
        .header__block-title Template:
        .header__block-drop
          SelectSingle(
            placeholder="Option"
            :hasSearch="true"
            :selectedOption="template"
            :options="['Blank', 'Templates (Soon)']"
            @chooseOption="setTemplate"
          )

    .body
      .body__subject
        input.subject__name(type="text" v-model="editedSubject"  placeholder="Subject")
      .body__details
        ckeditor(v-model="message" :config="editorConfig")
      .body__buttons
        Button(value="Send" @clicked="send")
        Button(value="Close" @clicked="close" :outline="true")
</template>

<script>
import Button from "./Button"
import CKEditor from "ckeditor4-vue"
import SelectSingle from "./SelectSingle"
import { mapActions, mapGetters } from "vuex"

export default {

  props: {
    to: {
      type: String
    },
    subject: {
      type: String
    }
  },
  data() {
    return {
      from: '',
      template: '',
      message: '',
      editedSubject: this.subject,

      editorConfig: {
        allowedContent: true,
        uiColor: "#ffffff",
        height: 240
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle'
    }),
    async send() {
      try {
        await this.$http.post('/pm-manage/send-email-from-to', {
          message: this.message,
          to: this.to,
          from: this.from,
          subject: this.editedSubject
        })
        this.close()
        this.alertToggle({ message: "Message has been sent!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot send message!", isShow: true, type: "error" })
      }
    },
    close() {
      this.from = ''
      this.template = ''
      this.message = ''
      this.$emit('close')
    },
    setTemplate({ option }) {
      this.template = option
      if (option === 'Blank') {
        this.message = ''
      } else {
        this.message = 'Lorem Ipsum is simply dummy text of ' +
            'the printing and typesetting industry. ' +
            'Lorem Ipsum has been the industrys standard dummy ' +
            'text ever since the 1500s, when an unknown printer took ' +
            'a galley of type and scrambled it to make a type specimen book. ' +
            'It has survived not only five centuries, but also the leap into electronic typesetting, ' +
            'remaining essentially unchanged. It was popularised in the 1960s with the release of ' +
            'Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
      }
    },
    setFrom({ option }) {
      this.from = option
    }
  },
  mounted() {
    this.template = 'Blank'
    this.from = this.user.email
    console.log(this.user)
    console.log(this.users)
  },
  computed: {
    ...mapGetters({
      user: "getUser",
      users: "getUsers"
    })
  },
  components: {
    SelectSingle,
    Button,
    ckeditor: CKEditor.component
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.subject {
  &__name {
    border-radius: 0px;
    padding: 25px 20px;
    margin-bottom: -2px;
    border: 1px solid #dddddd;
  }
}

.sender {
  width: 750px;
  background: white;
  padding: 25px;
  box-sizing: border-box;
  box-shadow: $box-shadow;
  border-radius: 4px;
  position: relative;

  &__title {
    font-size: 18px;
    font-family: Myriad600;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
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

.body {
  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 20px 0px;
  position: relative;
  margin-bottom: 20px;
  border-bottom: 2px solid $light-border;


  &__block {
    &-title {
      margin-bottom: 2px;
      height: 16px;
    }

    &-drop {
      width: 220px;
      position: relative;
      height: 32px;
    }
  }
}


input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;
}
</style>
