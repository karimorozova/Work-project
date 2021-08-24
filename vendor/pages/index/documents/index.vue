<template lang="pug">
  .container(v-if="vendor")
    .title Documents
    Documents(
      :documentsData="vendor.documents"
      :vendorId="vendor._id"
    )

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Documents from "../../../components/overall/internal/Documents"

	export default {
		components: { Documents },
		computed: {
			...mapGetters({
				vendor: "getVendor"
			})
		}
	}
</script>

<style lang="scss" scoped>
  .container {
    color: #67573E;
    padding: 20px 40px;
  }

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }
</style>