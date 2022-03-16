<template lang="pug">
  .container
    .mailBox
      .mailBox__to
        span To:
      .mailBox__mails
        .mailBox__chips(v-for="(item, index) in selectedEmails")
          .chips
            .chips__mail
              span {{item}}
            .chips__close(@click="deleteSelectedEmails(index)")
              span(class="close") &#10006;
        .mailBox__input
          input(
            type="text"
            ref="input"
            v-on:keyup.enter="addSelectedEmailByEnter"
            placeholder="Click to enter or choose an email address..."
          )
    .selectBox(ref="option")
      .selectBox__container(v-if="isAllEmails && availableAllEmails.length")
        .selectBox__body
          .selectBox__option(v-for="(item, index) in availableAllEmails" @click="addSelectedEmails(index)" )
            .selectBox__option-icon
              .user__image(v-if="getContact(item).photo")
                img(:src="getContact(item).photo")
              .user__fakeImage(
                :style="{'--bgColor': getBgColor(getContact(item)._id)[0], '--color':getBgColor(getContact(item)._id)[1]  }"
                v-else
              ) {{ getContact(item).firstName[0].toUpperCase() }}

            .selectBox__option-text  {{item}}
</template>

<script>
import getBgColor from "../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  props: {
    emails: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      isAllEmails: false,
      selectedEmails: [],
      allEmails: []
    }
  },
  methods: {
    getContact(email) {
      return this.emails.find(i => i.email === email)
    },
    addSelectedEmailByEnter() {
      if (this.validEmail(this.$refs.input.value)) if (!this.selectedEmails.includes(this.$refs.input.value)) {
        this.selectedEmails.push(this.$refs.input.value)
        this.emailActions()
      }
      this.clearInput()
    },
    clearInput() {
      this.$refs.input.value = ''
    },
    firstIconSymbol(str) {
      return (str[0]).toUpperCase()
    },
    addSelectedEmails(index) {
      const selectedElem = this.availableAllEmails[index]
      this.selectedEmails.push(selectedElem)
      this.emailActions()
    },
    deleteSelectedEmails(index) {
      this.selectedEmails.splice(index, 1)
      this.emailActions()
    },
    closeOptions() {
      this.isAllEmails = false
    },
    openOptions() {
      this.isAllEmails = true
    },
    validEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    optionsClickOutside(e) {
      if (this.availableAllEmails.length) if (!this.$refs.option.contains(e.target) && this.$refs.input !== document.activeElement && e.target.className !== 'close') this.closeOptions()
    },
    emailActions() {
      this.$emit('emailAction', this.selectedEmails)
    }
  },
  computed: {
    availableAllEmails() {
      return this.allEmails.filter(item => this.validEmail(item)).filter(item => !this.selectedEmails.includes(item))
    }
  },
  beforeDestroy() {
    this.$refs.input.removeEventListener('focusin', () => true, false)
    document.removeEventListener('click', () => true, false)
  },
  created() {
    this.allEmails = this.emails.map(i => i.email)
  },
  mounted() {
    this.$refs.input.addEventListener('focusin', () => this.openOptions())
    document.addEventListener('click', (e) => this.optionsClickOutside(e))
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

.selectBox {
  margin: 15px 30px;
  z-index: 5555;
  position: relative;

  &__container {
    position: absolute;
    background: white;
    width: 100%;
    z-index: 9000;
    border-radius: 2px;
  }

  &__body {
    border: 1px solid $border;
    border-radius: 2px;
    max-height: 260px;
    overflow-y: auto;
  }

  &__option {
    display: flex;
    padding: 10px;
    cursor: pointer;
    transition: .2s ease-out;
    align-items: center;

    &:hover {
      background: $list-hover;
    }

    &-icon {
      //height: 32px;
      //width: 32px;
      //background: $light-border;
      //color: $dark-border;
      //border-radius: 50%;
      //display: flex;
      //align-items: center;
      //justify-content: center;
      //font-family: 'Myriad600';
      //font-size: 16px;
    }

    &-text {
      font-size: 14px;
      margin-left: 12px;
    }
  }
}

.mailBox {
  border-top: 1px solid $light-border;
  border-bottom: 1px solid $light-border;
  display: flex;


  &__to {
    font-family: Myriad600;
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  &__mails {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;
  }

  &__input {
    margin-left: 12px;

    input {
      width: 300px;
      height: 50px;
      outline: none;
      border: none;
      font-size: 14px;
    }
  }

  &__chips {
    padding: 8px 12px;
    margin-left: 15px;
    border: 1px solid $light-border;
    background: $light-background;
    border-radius: 2px;
    min-height: 12px;
    margin-top: 12px;
    width: fit-content;
    cursor: default;

    .chips {
      display: flex;

      &__mail {
        font-size: 14px;
      }

      &__close {
        margin-left: 12px;
        font-size: 14px;
        cursor: pointer;
        color: $dark-border;

        &:hover {
          color: $text;
        }
      }
    }
  }
}
</style>