<template lang="pug">
.vendor-info
  p {{ fullName }}
</template>
<script>
  import { mapActions } from "vuex";

  export default {
    data() {
      return {
        vendor: ""
      }
    },
    methods: {
      async getVendorInfo() {
        try {
          const token = localStorage.getItem("token");
          const result = await this.$axios.$get(`/vendor/info?token=${token}`);
          this.vendor = result;
        } catch(err) {
          this.alertToggle({message: err.response.data, isShow: true, type: "error"});
        }
      },
      ...mapActions({
        alertToggle: "alertToggle"
      })
    },
    computed: {
      fullName() {
        if(this.vendor) {
          return this.vendor.firstName + " " + this.vendor.surname;
        }
      }
    },
    mounted() {
      this.getVendorInfo()
    }
  };
</script>

<style lang="scss">

</style>
