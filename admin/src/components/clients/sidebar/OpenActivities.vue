<template lang="pug">
  .openActivities
    .openActivities__title Open Activities
    .openActivities__content
      .openActivities__list(v-for="item in listOfActivity")
        .openActivities__item(v-on:click="openActivityDetails(item)")
          .card
            .card__check(v-on:click.stop="completeActivity")
              i.far.fa-check-circle
            .card__data
              .card__title {{ item.title }}
              .card__date
                span.due Due:
                span {{ item.deadline}}
            .card__icon
              span(v-html="renderIcon(item.entity)")


</template>

<script>
	import { mapGetters } from "vuex"

	export default {
		data() {
			return {}
		},
		methods: {
			renderIcon(entity) {
				switch (entity) {
					case 'task' :
						return '<i class="fas fa-tasks"></i>'
				}
			},
			completeActivity() {
				alert('done')
			},
			openActivityDetails(item) {
				this.$emit('openActivityDetails', item)
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
			listOfActivity() {
				let result = [
					...this.currentClient.tasks.map(item => {
						return { ...item, entity: 'task' }
					})
				]
				return result
			}
		}
	}
</script>

<style lang="scss" scoped>
  .openActivities {
    &__content {
      max-height: 45vh;
      overflow-y: auto;
    }

    &__title {
      font-size: 18px;
    }

    &__item {
      position: relative;
      width: 100%;
    }
  }

  .card {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #E8E8E8;
    margin-top: 5px;
    transition: ease 0.2s;

    &:hover {
      cursor: pointer;
      background: rgba(153, 153, 153, .1);
    }

    &__title {
      font-size: 16px;
      margin-bottom: 2px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
    }

    &__data {
      width: 80%;
    }

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

  .due {
    margin-right: 6px;
  }

</style>