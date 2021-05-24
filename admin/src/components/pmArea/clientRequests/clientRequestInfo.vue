<template lang="pug">
  .layout(v-if="currentClientRequest._id")
    .content(v-if="currentClientRequest.status === 'Client Request'")
      FormLayout
    .content(v-else)
      ProjectLayout
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import FormLayout from "./FormLayout"
import ProjectLayout from "./ProjectLayout"

export default {
  data(){
    return {
      clientRequest: {}
    }
  },
  methods: {
    ...mapActions(["setCurrentClientRequest"]),
    async getClientRequest() {
      const { id } = this.$route.params;
      try {
        if(!this.currentClientRequest._id) {
          const curClientRequest = await this.$http.post(`/clients-requests/by-id/${ id }`);
          console.log(curClientRequest.data)
          this.clientRequest = curClientRequest.data;
          this.setCurrentClientRequest(curClientRequest.data);
        }
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      currentClientRequest: "getCurrentClientRequest"
    }),
  },
  components: { ProjectLayout, FormLayout },
  created() {
    if(!this.getCurrentClientRequest) {
      this.getClientRequest();
    }
  }
}
</script>

<style scoped lang="scss">

</style>