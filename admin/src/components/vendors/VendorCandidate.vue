<template lang="pug">
.candidate
    .candidate__title Candidate
    .candidate__row
        .candidate__row-key Years of experience:
        .candidate__row-value {{candidateData.experienceYears}}
    .candidate__row
        .candidate__row-key Internet access:
        .candidate__row-value {{candidateData.internetAccess}}
    .candidate__row
        .candidate__row-key CAT experience:
        .candidate__row-value {{candidateData.catExperience}}
    .candidate__row
        .candidate__row-key Software experience:
        .candidate__row-value 
          p(v-for="item in candidateData.softwares") {{item}}
    .candidate__row
        .candidate__row-key Availability:
        .candidate__row-value {{candidateData.availability}}
</template> 
<script>
export default {
  props: {
    candidateData: {
      type: Object
    }
  }
};
</script>
<style lang="scss" scoped>
.candidate {
  margin: 20px 10px 40px;
  width: 300px;
  background: #fff;
  box-shadow: 0 0 10px #67573e9d;
  padding: 40px;

  &__title {
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid #67573e;
    padding-bottom: 5px;
  }
  &__row {
    display: flex;
    padding-top: 15px;

    &-key {
      width: 150px;
      font-size: 16px;
    }
    &-value {
      width: 150px;
      font-size: 16px;
      p {
        display: block;
        margin-top: 3px;
        margin-bottom: 6px;
      }
    }
  }
}
</style>