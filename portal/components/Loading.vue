<template lang="pug">
    .loading
      //transition(name="fade")
        //.loading__message Loading
        //.spinner3.spinner-3
        .spinner1.spinner-1(v-if="currentRequests")


</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      // currentRequests: "getRequestsCount"
    })
  }
}
</script>

<style lang="scss" scoped>
//@import "./assets/scss/colors";
//
//.fade-enter-active, .fade-leave-active {
//  transition: opacity .5s;
//}
//
//.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
//{
//  opacity: 0;
//}
//
//.loading {
//  //position: fixed;
//  //top: 10px;
//  //left: 50%;
//  //margin-left: -125px;
//  //width: 250px;
//  ////background-color: palevioletred;
//  //z-index: 90000;
//}
//
//.spinner1 {
//  position: relative;
//  width: 50px;
//  height: 50px;
//
//  &:before,
//  &:after {
//    content: "";
//    display: block;
//    position: absolute;
//    border-width: 2px;
//    border-style: solid;
//    border-radius: 50%;
//  }
//}
//
//.spinner1.spinner-1 {
//  @keyframes rotate-animation {
//    0% {
//      transform: rotate(0deg);
//    }
//
//    100% {
//      transform: rotate(360deg);
//    }
//  }
//
//  @keyframes anti-rotate-animation {
//    0% {
//      transform: rotate(0deg);
//    }
//
//    100% {
//      transform: rotate(-360deg);
//    }
//  }
//
//  &:before {
//    width: 30px;
//    height: 30px;
//    border-bottom-color: $green;
//    border-right-color: $green;
//    border-top-color: rgba(red, 0);
//    border-left-color: rgba(red, 0);
//    top: 0px;
//    left: 0px;
//    animation: rotate-animation 1s linear 0s infinite;
//  }
//
//  &:after {
//    width: 15px;
//    height: 15px;
//    border-bottom-color: $red;
//    border-right-color: $red;
//    border-top-color: rgba(red, 0);
//    border-left-color: rgba(red, 0);
//    top: (30px - 15px) / 2;
//    left: (30px - 15px) / 2;
//    animation: anti-rotate-animation 0.85s linear 0s infinite;
//  }
//}

</style>
