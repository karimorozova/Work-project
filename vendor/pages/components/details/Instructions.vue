<template lang="pug">
  .instructions
    .instructions__titles
      .instructions__title Project instruction:
      .instructions__subtitle  please read carefully

    .instructions__textarea
      .instructions__text(disabled v-html="job.brief" )

    .instructions__titles(v-if="job.vendorBrief")
      .instructions__title Personal brief:

    .instructions__textarea(v-if="job.vendorBrief")
      .instructions__text(disabled v-html="job.vendorBrief" )

</template>

<script>
export default {
  props: {
    job: { type: Object }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.instructions {
  padding: 0px 25px 25px 25px;

  &__titles {
    display: flex;
    gap: 15px;
    align-items: baseline;
  }

  &__title {
    font-size: 18px;
    padding: 20px 0 5px 0;
    font-family: Myriad600;
  }

  &__subtitle {
    color: $red;
    text-transform: uppercase;
    font-family: 'Myriad600';
  }


  &__textarea {
    border: 2px solid rgb(197, 191, 181);
    border-radius: 4px;
  }

  &__text {
    padding: 2px 0px 2px 15px;
    overflow-y: auto;
    min-height: 70px;
    max-height: 200px;
    border: none;
    outline: none;
    width: calc(100% - 10px);
    height: 100%;
    background: transparent;
    resize: none;
  }
}

</style>
