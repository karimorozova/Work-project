<template lang="pug">
  .areas
    .pm-area
      .user(v-if="job.projectManager._id" )
        .user__image
          img(v-if="job.projectManager.photo && !job.projectManager.photo.includes('https://')" :src="domain+job.projectManager.photo")
          .user__fakeImage(:style="{'--bgColor': getBgColor(job.projectManager._id)[0], '--color':getBgColor(job.projectManager._id)[1]  }" v-else) {{ job.projectManager.firstName[0].toUpperCase() }}
        .user__name {{job.projectManager.firstName + ' ' + job.projectManager.lastName || ''}}

        .user__who Project Manager
        a(:href="'mailto:' + job.projectManager.email")
          .user__email
            .email__icon
              i(class="far fa-envelope")
            .email__text Send a message

    .brief-area(v-if="job.brief || job.vendorBrief" )
      .brief(v-if="job.brief" )
        .brief-area__title General Instruction
        .brief-area__description(v-html="job.brief")
      .brief(v-if="job.vendorBrief" )
        .brief-area__title Individual Instruction
        .brief-area__description(v-html="job.vendorBrief")


</template>

<script>
import getBgColor from "../../../mixins/getBgColor"

export default {
  name: "ProjectManagerBlock",
  mixins: [ getBgColor ],
  props: {
    job: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.brief-area {
  width: 320px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px 25px 1px 25px;

  &__title {
    text-align: center;
    font-family: Roboto600;
    margin-bottom: 5px;
  }

  &__description {
    border: 1px solid $light-border;
    border-radius: 4px;
    padding: 0px 15px;
    overflow-y: auto;
    max-height: 85px;
    margin-bottom: 25px;
  }
}

.pm-area {
  width: 320px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 25px;
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