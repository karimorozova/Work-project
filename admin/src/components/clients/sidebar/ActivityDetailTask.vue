<template lang="pug">
  .activityDetail
    .activityDetail__header
      .header
        .header__icon
          i.fas.fa-tasks
        .header__title Task
        .header__status Upcoming
        .header__crud
          span.icon(@click="")
            i.fas.fa-pencil-alt
          span.icon(@click="close")
            i.fas.fa-times-circle

    .activityDetail__content
      .card
        .card__check
          i.far.fa-check-circle
        .card__data
          .card__title Hello Js
          .card__date
            span.due Due:
            span 15-15-1515, 20:20

      .description
        .side

          .side__left
            .description__priority
              .d-title Priority:
              .description__priorityBlockHigh(v-if="true") High
              .description__priorityBlockRegular(v-else) Regular

            .description__assigned
              .d-title Assigned to:
              .assignedImage
                img(src="../../../assets/images/signin-background.jpg")

          .side__right
            .description__associated
              .d-title Associated with:
              .description__associatedList
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title Hello PPPP
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title Hellosdfsd LKSJDFsdfsdf

            .description__details
              .d-title Details:
              .details__data(v-html="'Asdkajskdj aksjdk jaskdjasdj jshdjka'")


</template>

<script>
	export default {
		methods: {
			close() {
				this.$emit('closeActivityDetailsTask')
			}
		}

	}
</script>

<style lang="scss" scoped>
  .side {
    width: 100%;
    display: flex;

    &__left {
      width: 30%;
    }

    &__right {
      width: 70%;
    }
  }

  .associatedUser {
    border: 1px solid #e8e8e8;
    margin-bottom: 5px;
    display: flex;

    &__title {
      padding: 5px;
    }

    &__block {
      width: 5px;
      background: #e8e8e8;
    }
  }

  .description {
    padding: 0px 20px;

    &__priorityBlockHigh {
      padding: 5px 12px;
      background: #D15F45;
      color: white;
      width: fit-content;
    }

    &__priorityBlockRegular {
      padding: 5px 12px;
      background: #48a6a6;
      color: white;
      width: fit-content;
    }

    &__priority {
      margin-bottom: 20px;
    }

    &__associated {
      margin-bottom: 15px;
    }
  }

  .card {
    display: flex;
    align-items: center;
    padding: 20px;

    &__check {
      height: 22px;
      font-size: 22px;
      width: 22px;
      margin-right: 10px;
      color: rgba(0, 0, 0, .6);
      cursor: pointer;
      transition: ease 0.2s;

      &:hover {
        cursor: pointer;
        color: #4ba5a5;
      }
    }

    &__title {
      font-size: 20px;
      margin-bottom: 2px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
    }
  }

  .activityDetail {
    &__header {
      background: #48A6A6;
      color: white;
      padding: 5px 20px;
    }
  }

  .header {
    display: flex;
    align-items: center;

    &__crud {
      position: absolute;
      right: 20px;
    }

    &__status {
      border: 1px solid white;
      padding: 5px;
      margin-left: 40px;
    }

    &__title {
      font-size: 18px;
      margin-left: 10px;
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: white;
      font-size: 20px;
      border-radius: 40px;
      color: #4ba5a5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .icon {
    margin-left: 10px;
    font-size: 16px;
    color: white;
    transition: ease 0.2s;
    cursor: pointer;
  }

  .assignedImage {
    height: 50px;
    width: 50px;
    border-radius: 50px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50px;
    }
  }

  .due {
    margin-right: 6px;
  }

  p {
    margin: 0 !important;
  }

  .d-title {
    margin-bottom: 5px;
  }
</style>