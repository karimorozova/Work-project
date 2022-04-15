<template lang="pug">
  .services-wrapper
    Companies

</template>

<script>
import { mapActions } from "vuex"
import Companies from "./Companies"
import EditCompany from "./EditCompany"

export default {
  components: {
    Companies,
  },

}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.services-wrapper {
  background-color: $white;
  padding: 25px;
  box-shadow: $box-shadow;
  position: relative;

  width: 900px;
  box-sizing: border-box;
  border-radius: 2px;
  margin: 50px;
}
.modal {
  position: fixed;
  left: 255px;
  top: 0px;
  box-sizing: border-box;
  width: calc(100% - 255px);
  padding: 50px;
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;
  z-index: 30000;
  height: 100%;
}

</style>
