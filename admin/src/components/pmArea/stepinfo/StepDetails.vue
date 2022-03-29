<template lang="pug">
  .details(v-if="task.hasOwnProperty('memoqDocs') && task.memoqDocs.length")
    .details__links
      .details__memoqLinks
        .link(v-for="item in task.memoqDocs")
          .link__icon(@click="goToMemoq(item)")
            i.fas.fa-external-link-alt
          .link__title {{ item.DocumentName }}


</template>

<script>
export default {
  name: "StepDetails",
  props: {
    step: {
      type: Object
    },
    task: {
      type: Object
    }
  },
  methods: {
    goToMemoq(item) {
      const { WebTransUrl } = item
      // const domainUrl = !WebTransUrl.includes('memoqweb') ? WebTransUrl.replace('/webtrans', 'memoqweb/webtrans') : WebTransUrl
      window.open(`${ 'https://memoq.pangea.global/memoqwebLegacy/webtrans/' + WebTransUrl.split('/webtrans/').pop() }`, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.details {
  &__links {
    display: flex;
    max-height: 160px;
    overflow: auto;
    margin-top: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__vendorLinks {
    margin-bottom: 20px;
    border-left: 2px solid $light-border;
    padding: 0 10px;
    width: 200px;
  }

  &__memoqLinks {
    border-left: 2px solid $light-border;
    padding: 0 12px;
    height: max-content;
  }
}

.link {
  display: flex;
  height: 32px;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  &__title {
    min-width: 85px;

  }

  &__icon {
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;
    margin-right: 10px;

    &:hover {
      color: $text;
    }
  }
}
</style>
