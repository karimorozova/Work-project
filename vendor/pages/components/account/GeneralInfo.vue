<template lang="pug">
  .general
    .general__photo-block
      VendorPhoto
    .general__block
      Personal
    .general__block
      OtherInfo
</template>

<script>
	import VendorPhoto from "./general/VendorPhoto"
	import Personal from "./general/Personal"
	import OtherInfo from "./general/OtherInfo"

	export default {
		components: {
			VendorPhoto,
			Personal,
			OtherInfo
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .general {
    box-sizing: border-box;
    padding: 20px;
    box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
    width: 1040px;
    display: flex;
    justify-content: space-between;

    &__photo-block {
      width: 20%;
    }

    &__block {
      width: 32%;

    }
  }

</style>
