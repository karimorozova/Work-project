<template lang="pug">
.wrapper
  div(@click="close") Close
  div {{ vendorId }}
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    vendorId: { type: String },
  },
  data() {
    return {
      vendorDetails: null,
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    async getVendorDetails() {},
    ...mapActions({
      //   alertToggle: "alertToggle",
      //   updateMatrix: "updateMatrix"
    }),
  },
  created() {
    this.getVendorDetails;
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject",
    }),
  },
  components: {},
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";
.wrapper {
  padding: 25px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
}
</style>
