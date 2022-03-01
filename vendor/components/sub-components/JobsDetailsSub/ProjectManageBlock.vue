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

    .descriptions
      .block
        .block__key Start Date & Time:
        .block__val {{customFormatter(job.start)}}
      .block
        .block__key Source Language:
        .block__val {{job.fullSourceLanguage.lang}}
      .block
        .block__key Target Language:
        .block__val {{job.fullTargetLanguage.lang}}
      .block
        .block__key Industry:
        .block__val {{job.industry.name}}
      .block
        .block__key Project ID:
        .block__val {{job.projectId}}
      .block
        .block__key Job ID:
        .block__val {{job.stepId}}
      .block
        .block__key Project Deadline:
        .block__val
          .short {{customFormatter(job.projectDeadline)}}
      .block
        .block__key Project Name:
        .block__val
          .short {{ job.projectName}}


</template>

<script>
import getBgColor from "../../../mixins/getBgColor"
import GeneralTable from "../../general/GeneralTable"
import moment from "moment"

export default {
  name: "ProjectManagerBlock",
  components: { GeneralTable },
  mixins: [ getBgColor ],
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      domain: '',
      fieldsFiles: [
        {
          label: "File",
          headerKey: "h1",
          key: "file",
          style: { width: "70%" }
        },
        {
          label: "",
          headerKey: "h2",
          key: "icon",
          style: { width: "30%" }
        }
      ]
    }
  },
  methods: {
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    }
  }

}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.block {
  display: flex;
  gap: 10px;
  height: 34px;
  align-items: center;

  &__key {
    color: $dark-border;
    width: 130px;
  }

  &__val {
    width: 170px;
  }
}

.descriptions {
  width: 360px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 25px;
}

.pm-area {
  width: 360px;
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

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 170px;
}
</style>