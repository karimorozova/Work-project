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
  min-height: 209px;
  margin-bottom: 30px;
  width: 309px;
  background: #fff;
  box-shadow: 0 0 15px #67573e9d;
  padding: 20px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #67573e;
    padding-bottom: 5px;
  }
  &__row {
    display: flex;
    padding-top: 15px;

    &-key {
      width: 150px;
      font-size: 14px;
      font-weight: 600;
    }
    &-value {
      width: 150px;
      font-size: 14px;
      p {
        display: block;
        margin-top: 3px;
        margin-bottom: 6px;
      }
    }
  }
}
</style>