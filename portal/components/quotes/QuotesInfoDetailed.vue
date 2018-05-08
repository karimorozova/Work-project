<template lang="pug">
    .qoutesInfoDetailedWrapper
        .container
            .container__label
                .container__label-title QuotesInfo
            .container__info
                .container__info-first
                    .projid
                    .requsted
                    .deadline
                .container__info-second
                    .projname
                    .status
                    .totalcost
            .container__id ProjectID
            .container__buttons
                button APPROVE QUOTE
                button REJECT QUOTE
</template>

<style lang="scss" scoped>
.qoutesInfoDetailedWrapper {
  height: 32vh;
  width: 63%;
  box-shadow: 0 0 6px #000;
}

.container {
  display: flex;
  flex-direction: column;
//   background-color: lightgray;
  max-width: 919px;
//   height: 50vh;

  &__label {
    display: flex;
    justify-content: flex-start;

    &-title {
      padding: 2% 0 2% 2%;
      color: #67573e;
      border-bottom: 1px solid #c5bfb7;
      width: 100%;
    }
  }

  &__info {
    flex-direction: column;
  }
}
</style>

<script>
export default {
  data() {
    return {
      quotesInfoDetailed: {
        title: "Project ID",
        createdDate: "2018 04 11 [27]",
        requested: "Requested On",
        requstedDate: "01-Apr-2018",
        deadline: "Deadline",
        deadlineDate: "11-Apr-2018",
        projectName: "1Market "
      }
    };
  }
};
</script>
