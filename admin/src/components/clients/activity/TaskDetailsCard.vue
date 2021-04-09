<template lang="pug">
  .task
    .header
      .header__icon
        i.fas.fa-tasks
      .header__title Task
    .main-info
      .main-info__check
        i.far.fa-check-circle
      .main-info__data
        .main-info__title Hello Js
      .main-info__date
        span.due Due:
        span 15-15-1515, 20:20
    .details
      .details__header(@click="clickDetails")
        .details__icon
          i.fas.fa-chevron-down(v-if="showDetails")
          i.fas.fa-chevron-right(v-else)
        .details__text Details
      .details__data(v-if="showDetails")
        .blocks
          .block
            .description__priority
              .d-title Priority:
              .description__priorityBlockHigh(v-if="true") High
              .description__priorityBlockRegular(v-else) Regular

            .description__assigned
              .d-title Assigned to:
              .assignedImage
                img(src="../../../assets/images/signin-background.jpg")
          .block(v-if="")
            .description__associated
              .d-title Associated with:
              .description__associatedList
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title Hello PPPP
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title Hellosdfsd LKSJDFsdfsdf
          .block
            .description__details
              .d-title Details:
              .details__data(v-html="'Asdkajskdj aksjdk jaskdjasdj jshdjka'")
</template>

<script>
	export default {
		name: "TaskDetailsCard",
		props: {
			showDetails: false
		},
		data() {
			return {}
		},
		methods: {
			clickDetails() {
				this.showDetails = !this.showDetails
			}
		}
	}
</script>

<style lang="scss" scoped>
  .task {
    width: 650px;
    border: 1px solid #e8e8e8;
    padding: 20px;
    background: #fff;
    height: fit-content;
  }

  .header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #daeded;
    padding-bottom: 10px;

    &__title {
      font-size: 20px;
      margin-left: 10px;
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: #daeded;
      font-size: 20px;
      border-radius: 40px;
      color: #4ba5a5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .main-info {
    display: flex;
    align-items: center;
    padding: 20px 0;

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
      font-size: 22px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
      margin-left: auto;

      & .due {
        margin-right: 5px;
      }
    }
  }

  .details {
    &__header {
      font-size: 16px;
      display: flex;
      cursor: pointer;
      padding-bottom: 5px;
    }

    &__icon {
      color: #48a6a6;
      min-width: 15px;
    }

    &__text {
      margin-left: 5px;
    }

    &__data {
      display: flex;
    }
  }

  .blocks {
    border-top: 1px solid #ccc;
    padding-top: 15px;
    width: 100%;
    display: flex;
  }

  .block {
    margin-right: 30px;
  }

  .description {
    padding: 0px 20px;

    &__priorityBlockHigh {
      display: inline-block;
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
  .d-title{
    margin-bottom: 5px;
  }

</style>
