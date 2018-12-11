<template lang="pug">
.finance-settings
  Sidebar(title="FINANCE")
  router-view
</template>

<script>
import Sidebar from "../Sidebar";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {

    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    })
  },
  computed: {
    ...mapGetters({

    }) 
  },
  components: {
    Sidebar
  }
};
</script>

<style lang="scss" scoped>

.finance-settings {
  position: relative;
  display: flex;
  min-height: 94vh;
}

@font-face {
  font-family: MyriadPro;
  src: url("../../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../../assets/fonts/MyriadPro-Bold.otf");
}

</style>
