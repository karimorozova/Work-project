<template lang="pug">
  .block
    .block__header(v-if="user._id")
      .block__header-left
      .block__header-right

        div(v-click-outside="clickOutside")
          .header__user(@click="toggleMenu")
            .user__name {{ user.firstName || '' }} {{ user.surname || '' }}

            .user__image(v-if="user.photo" )
              img(:src="domain+user.photo")
            .user__fakeImage(:style="{'--bgColor': getBgColor(user._id)[0], '--color':getBgColor(user._id)[1]  }" v-else) {{ user.firstName[0].toUpperCase() }}

          .header__dropbox(v-if="isDropBox")
            .dropbox__item(@click="signOut()")
              .dropbox__item-icon
                i.fas.fa-power-off
              .dropbox__item-text Logout

</template>

<script>
import Button from "./general/Button"
import { mapActions, mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import getBgColor from "../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  components: { Button },
  directives: {
    ClickOutside
  },
  data() {
    return {
      isDropBox: false,
      domain: ''
    }
  },
  created() {
    this.domain = process.env.domain
  },
  methods: {
    ...mapActions([
      "logout"
    ]),

    signOut() {
      this.logout()
      this.$router.push('/login')
    },
    clickOutside() {
      this.isDropBox = false
    },
    toggleMenu() {
      this.isDropBox = !this.isDropBox
    }
  },
  computed: {
    ...mapGetters({
      user: "getVendor"
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.block {

  &__header {
    height: 46px;
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    background: white;
    border-bottom: 1px solid $light-border;
    position: relative;
    z-index: 40;

    &-right {
      display: flex;
      align-items: center;
      position: relative;
    }

    &-left {
      display: flex;
      align-items: center;
      position: relative;
    }
  }
}

.header {
  &__button {
    margin-left: 40px;
  }

  &__user {
    cursor: pointer;
    margin-left: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__dropbox {
    position: absolute;
    background: white;
    right: 0;
    top: 60px;
    width: 200px;
    z-index: 5555;
    border-radius: 4px;
    box-shadow: $box-shadow;
  }
}

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

  &__name {
    margin-right: 10px;
    font-family: 'Roboto600';
  }

}

.dropbox {
  &__item {
    display: flex;
    padding: 10px 14px;
    transition: 0.1s cubic-bezier(0.12, 0, 0.39, 0);
    align-items: center;

    &-icon {
      margin-right: 7px;
      font-size: 16px;
    }

    &:hover {
      cursor: pointer;
      background: $list-hover;
    }
  }
}
</style>