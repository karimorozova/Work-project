<template lang="pug">
.finance-settings
  Sidebar(title="FINANCE")
    //-   router-view
  button.button(@click="sendFiles") Send files
  .counter(v-if="isSending") {{ filesCounter }} of {{ files.length }}
</template>

<script>
import Sidebar from "../Sidebar";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
        isSending: false,
        filesCounter: 1,
        files: ["website.docx"]
        // files: ["website.pdf", "website.1.pdf", "website.2.pdf", "website.3.pdf", "website.4.pdf"]
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async sendFiles() {
        try {
            this.isSending = true;
            for(let name of this.files) {
                const result = await this.$http.post("/memoqapi/all-files", { name });
                this.filesCounter++;
            }
            this.alertToggle({message: "Files are uploaded to the MemoQ Server", isShow: true, type: "success"});
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
