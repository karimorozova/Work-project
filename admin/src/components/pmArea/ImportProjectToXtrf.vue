<template lang="pug">
  .projectToXtrf
    .projectToXtrf__buttons
      Button(v-if="!project.isSendToXtrf && !project.xtrfLink" value="Send project to XTRF" @clicked="sendTo" :isDisabled="isDisable")

      a(v-else target="_blank" :href="project.xtrfLink")
        Button(value="Go to XTRF Project")
      br
      Button(v-if="project.xtrfLink" value="Update Fiance / Close Jobs & Project" @clicked="updateFinance")

    .projectToXtrf__info
      span If a step has the same language pair, they will be grouped. Accounts payable and receivable will be added.
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
			async updateFinance() {
				try {
					await this.$http.get('/projectsapi/updateXtrfProject/' + this.$route.params.id)
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
						.get('/projectsapi/createXtrfProjectWithFinance/' + this.$route.params.id)
						.then((res) => res.data)
						.then((data) => {
							if (data.isSuccess) {
								const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
								this.alertToggle({
									message: "Send success" + notFoundVendorsMessage,
									isShow: true,
									type: "success"
								})
								this.$emit('refreshProject')
							} else {
								this.alertToggle({
									message: data.message,
									isShow: true,
									type: "error"
								})
							}
						})
						.finally(() => this.isDisable = false)
			}
		},
		components: { Button }
	}
</script>

<style scoped lang="scss">
  .projectToXtrf {
    box-sizing: border-box;
    padding: 20px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
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
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  }
</style>