<template lang="pug">
.finance-settings
  Sidebar(title="FINANCE")
    //-   router-view
  button.button(@click="downloadPdf") Get pdf
</template>

<script>
import Sidebar from "../Sidebar";
import { mapGetters, mapActions } from "vuex";

export default {
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async downloadPdf() {
        try {
            const result = await this.$http.get("/api/pdf-file");
            const href = result.body;
            let a = document.createElement("a");
            a.href = href;
            a.target = "_blank";
            a.click();
        } catch(err) {
            this.alertToggle({message: err, isShow: true, type: "error"});
        } finally {
            this.isSending = false;
        }
    }
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

.button {
    margin: 100px;
    width: 190px;
    height: 28px;
}

.counter {
    margin: 100px;
    color: red;
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
