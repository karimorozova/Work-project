<template lang="pug">
  .services-wrapper
    .modal(v-if="isModalOpen")
      EditCompany(:editedId="editedId")
    Companies(
      @openModal="toggleModal"
    )

</template>

<script>
import { mapActions } from "vuex"
import Companies from "./Companies"
import EditCompany from "./EditCompany"

export default {
  components: {
    Companies,
    EditCompany,
  },
  data() {
    return {
      selectedTab: "Companies",
      isModalOpen: false,
      editedId: '',
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    toggleModal(id) {
      this.isModalOpen = !this.isModalOpen
      this.editedId = id
      let elem = document.getElementsByTagName('body')[0]
      if (this.isModalOpen) {
        elem.classList.add("hiddenScroll")
      } else {
        elem.classList.remove("hiddenScroll")
      }
    },
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
