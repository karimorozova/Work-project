<template lang="pug">
  .projectToXtrf
    .projectToXtrf__buttons
      Button.margin-bottom(v-if="true" value="Send tasks to XTRF" color="#47A6A6" :outline="true"  @clicked="sendTo" :isDisabled="isDisable")
      .xtrf-tasks(v-for="xtrfTask of project.xtrfLinks")
        span {{ xtrfTask.taskId}} : &nbsp;
        a( target="_blank" :href="xtrfTask.link")
          i(class="fas fa-link")
        | &nbsp;&nbsp;
        i(class="fas fa-sync-alt cursor-pointer" @click="updateFinance(xtrfTask.xtrfId, xtrfTask.taskId)")

      //a( target="_blank" :href="project.xtrfLink || ''")
        //Button(value="Go to XTRF Project")
      //br
      //Button(v-if="project.xtrfLink" value="Update Fiance / Close Jobs & Project" @clicked="updateFinance")



    .projectToXtrf__info
      span If a step has the same language pair, they will be grouped. Accounts payable and receivable will be added.
      .dont-close-text If the project is not closed, click the button again.
</template>

<script>
	import Button from "../Button"
	import axios from "axios"
	import { mapActions } from "vuex"

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				isDisable: false
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async updateFinance(xtrfId, taskId) {
				try {
					await this.$http.post('/pm-manage/updateXtrfTasks/' + this.$route.params.id, {xtrfId, taskId})
					this.alertToggle({
						message: "Updated",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error on updating finance",
						isShow: true,
						type: "error"
					})
				}
			},
			sendTo() {
				this.isDisable = true
				axios
						.post('/pm-manage/createXtrfTasksWithFinance/' + this.$route.params.id)
						.then((res) => res.data)
						.then((data) => {
							if (!!data) {
							// 	const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
								this.alertToggle({
									// message: "Send success" + notFoundVendorsMessage,
									message: "Send success",
									isShow: true,
									type: "success"
								})
								this.$emit('refreshProject')
							} else {
								// this.alertToggle({
								// 	message: data.message,
								// 	isShow: true,
								// 	type: "error"
								// })
							}
						})
						.finally(() => this.isDisable = false)
			}
		},
		components: { Button }
	}
</script>

<style scoped lang="scss">
  .xtrf-tasks {
    margin: 10px 0;

    &__group {
      display: flex;
      justify-content: space-between;
    }
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .projectToXtrf {
    box-sizing: border-box;
    padding: 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    min-width: 400px;
    width: 400px;
    background: white;
    border-radius: 4px;
    margin-bottom: 40px;


    &__info {
      margin-top: 10px;
      margin-bottom: 2px;
      letter-spacing: .6px;
      font-size: 11px;
      opacity: .5;
      .dont-close-text {
        margin: 5px 0 0 0;
      }
    }

    a {
      text-decoration: none;
      color: inherit;
    }

    .margin-bottom {
      margin-bottom: 10px;
    }
  }
</style>