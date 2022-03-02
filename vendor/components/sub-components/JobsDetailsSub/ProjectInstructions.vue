<template lang="pug">
  .instructions(v-if="(job.brief || job.vendorBrief)" )
    .brief-area
      .brief(v-if="job.brief" )
        .brief-area__title General Instruction
        .brief-area__description(v-html="job.brief")

      .brief(v-if="job.vendorBrief" )
        .brief-area__title Individual Instruction
        .brief-area__description(v-html="job.vendorBrief")

</template>

<script>
export default {
  props: {
    job: {
      type: Object
    }
  },
  name: "ProjectInstructions"
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.instructions {
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px 25px 1px 25px;
  margin-bottom: 25px;
  width: 740px;
}

.brief {
  width: 100%;
}

.brief-area {
  display: flex;
  gap: 25px;

  &__title {
    font-size: 14px;
    font-family: Roboto600;
    margin-bottom: 5px;
  }

  &__description {
    border: 1px solid $light-border;
    border-radius: 4px;
    padding: 0px 15px;
    overflow-y: auto;
    max-height: 160px;
    margin-bottom: 25px;
  }
}
</style>