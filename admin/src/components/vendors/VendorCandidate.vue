<template lang="pug">
  .candidate
    .candidate__title Candidate:
    .candidate__row
      .candidate__row-key Years of experience:
      .candidate__row-value {{candidateData.experienceYears}}
    .candidate__row
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
	}
</script>
<style lang="scss" scoped>
  @import '../../assets/scss/colors';

  .candidate {
    width: 300px;
    padding: 20px;
    margin-right: 40px;

    &__title {
      font-family: 'Myriad600';
    }

    &__row {
      display: flex;
      padding-top: 15px;

      &-key {
        width: 150px;
        font-size: 14px;
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
