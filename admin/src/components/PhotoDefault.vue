<template lang="pug">
   .user
        .user__image(v-if="user.photo" :style="{ '--width': width, '--height': height }")
              img(:src="user.photo.includes('http') ? user.photo : `${domain}${user.photo}`")
        .user__fakeImage(:style="{'--bgColor': getBgColor(user._id)[0], '--color':getBgColor(user._id)[1], '--width': width, '--height': height  }" v-else) {{ user.firstName[0].toUpperCase() }}
        
</template>

<script>
    import getBgColor from "../mixins/getBgColor"
    import { mapGetters, mapActions } from "vuex"
    export default {
        name: "PhotoDefault",
        mixins: [getBgColor],
        props: {
            height: {
                type: String,
                default: '32px'
            },
            width: {
                type: String,
                default: '32px'
            },
            user: {
                type: Object,
                default: {
                    photo: '',
                    _id: '',
                }
            }
        },
        data() {
            return {
                domain: '',
            }
        },
        
        created() {
            this.domain = this.$domains.admin
        }
    }
</script>

<style lang="scss" scoped>
.user {

  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }

}

</style>