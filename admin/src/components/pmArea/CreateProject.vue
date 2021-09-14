<template lang="pug">
  .create-project
    Project(
      :project="project"
      @projectCreated="projectCreated"
      @setValue="setValue"
    )
</template>

<script>
	import Project from "./Project"
	import { mapActions } from 'vuex'

	export default {
		data() {
			return {
				project: {
					clientProjectNumber: "",
					template: "",
					projectName: "",
					customer: { name: "" },
					brief: "",
					notes: "",
					industry: "",
					startDate: new Date(),
					deadline: "",
					billingDate: ""
				}
			}
		},
		methods: {
			...mapActions([ "setCurrentProject" ]),
			setValue({ option, prop }) {
				this.project = { ...this.project, [prop]: option }
			},
			projectCreated({ project, customer }) {
				this.project = project
				this.project.customer = customer
				this.setCurrentProject(this.project)
				this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ project._id }`)
			}
		},
		components: {
			Project
		}
	}
</script>

<style lang="scss" scoped>
  .create-project {
    //width: 100%;
    margin: 50px;
  }
</style>
