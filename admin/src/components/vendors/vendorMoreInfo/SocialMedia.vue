<template lang="pug">
  .main
    .vendorInformation__description
      .social-wrapper
        label.title Please enter any other platform of communication, so we can reach you, in case we need
        label.title It can be extra email, extra phone number etc.
      SocialMediaRow(
        :social-media="socialMedia"
        @changeItemPosition="changeItemPosition"
        @add="addSocialMedia"
        @remove="removeSocialMedia"
        @update="updateVendorSocialMediaValue"
      )

</template>

<script>
import { mapActions } from "vuex"
import SocialMediaRow from "./SocialMediaList"

export default {
  name: 'SocialMedia',
  components: { SocialMediaRow },
  data() {
    return {
      socialMedia: []
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    changeItemPosition(sortedArr) {
      this.socialMedia = sortedArr
      this.saveVendorSocialMedia('socialMedia')
    },
    addSocialMedia(item) {
      console.log(this.socialMedia)
      this.socialMedia.push(item)
    },
    removeSocialMedia(index) {
      this.socialMedia.splice(index, 1)
      this.saveVendorSocialMedia('socialMedia')
    },
    updateVendorSocialMediaValue({ value, prop, index }) {
      this.socialMedia[index][prop] = value
      this.saveVendorSocialMedia('socialMedia')
    },
    async getVendorSocialMedia() {
      try {
        const res = await this.$http.get(`/vendorsapi/vendor-socialMedia/${ this.$route.params.id }`)
        this.socialMedia = res.data.socialMedia
      } catch (err) {
        console.log(err)
      }
    },
    async saveVendorSocialMedia(prop) {
      try {
        const res = await this.$http.put(`/vendorsapi/vendor-socialMedia-manage/${ this.$route.params.id }`, {
          prop,
          value: this[prop]
        })
        this.socialMedia = res.data.socialMedia
        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (e) {
        console.log(e)
        this.alertToggle({ message: "Cannot save info", isShow: true, type: "error" })
      }
    }
  },
  async created() {
    await this.getVendorSocialMedia()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.vendorInformation__description {
  box-sizing: border-box;
  padding: 25px 25px 25px 0;
}

.social-wrapper {
  margin-bottom: 30px;
}

.title {
  font-family: Myriad400;
  margin-bottom: 5px;
  display: block;
}

</style>

