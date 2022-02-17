<template lang="pug">
  .pm-area
    .user(v-if="projectManager._id" )
      .user__image
        img(v-if="projectManager.photo && !projectManager.photo.includes('https://')" :src="domain+projectManager.photo")
        .user__fakeImage(:style="{'--bgColor': getBgColor(projectManager._id)[0], '--color':getBgColor(projectManager._id)[1]  }" v-else) {{ projectManager.firstName[0].toUpperCase() }}
      .user__name {{projectManager.firstName + ' ' + projectManager.lastName || ''}}

      .user__who Project Manager
      a(:href="'mailto:' + projectManager.email")
        .user__email
          .email__icon
            i(class="far fa-envelope")
          .email__text Send a message
</template>

<script>
import getBgColor from "../../../mixins/getBgColor"

export default {
  name: "ProjectManagerBlock",
  mixins: [ getBgColor ],
  props: {
    projectManager: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.pm-area {
  width: 300px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__name {
    margin-top: 5px;
    font-family: Roboto600;
  }

  &__who {
    margin-top: 5px;
    color: #3333;
  }

  &__email {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  &__fakeImage {
    cursor: default;
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
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    margin-bottom: 5px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>