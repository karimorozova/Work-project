<template lang="pug">
  .filter

    .filter__item
      label Project Id:
      input(type="text" :value="projectIdValue" @change="projectIdSetFilter" @keyup.13="projectIdSetFilter")

    .filter__item
      label Project Name:
      input(type="text" :value="projectNameValue" @change="projectNameSetFilter" @keyup.13="projectNameSetFilter")

</template>

<script>
	export default {
		props: {
			// projectIdFilter: { type: String }
		},
		data() {
			return {}
		},
		methods: {
			projectIdSetFilter(e) {
				const { value } = e.target
				let query = this.$route.query
				delete query.projectId
				this.$router.replace({ path: this.$route.path, query: { ...query, projectId: value } })
			},
			projectNameSetFilter(e) {
				const { value } = e.target
				let query = this.$route.query
				delete query.projectName
				this.$router.replace({ path: this.$route.path, query: { ...query, projectName: value } })
			}
		},
		computed: {
			projectIdValue() {
				return this.$route.query.projectId || ''
			},
			projectNameValue() {
				return this.$route.query.projectName || ''
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .filter {
    display: flex;
    flex-wrap: wrap;

    &__item {
      margin-bottom: 15px;
      margin-right: 30px;
    }
  }

  label {
    display: block;
    margin-bottom: 2px;
    font-family: 'Myriad600';
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 220px;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }

</style>