<template lang="pug">
  .projectWrapper
    .project-table
        .project-table__header
            .project-table__col-1.col_bleach
                span Request On
                img.requestOn(src="../../assets/images/white-arrow.png")
            .project-table__col-2.col_bleach
                span Project ID
                img.projectid(src="../../assets/images/white-arrow.png")
            .project-table__col-3.col_bleach
                span Project Name
            .project-table__col-4.col_bleach
                span Status
            .project-table__col-5.col_bleach
                span Deadline
            .project-table__col-6.col_bleach
                span Total Cost
            .project-table__col-7
                span Download
        .project-table__body
            .project-table__row(v-for="(quote, index) in clientQuotes")
                .project-table__col-1 {{ quote.requestOn }}
                .project-table__col-2 {{ quote.projectId }}
                .project-table__col-3 {{ quote.projectName }}
                .project-table__col-4 {{ quote.status }}
                .project-table__col-5 {{ quote.deadline }}
                .project-table__col-6 {{ quote.totalCost }}   
                .project-table__col-7
                    img(src="../../assets/images/download.png")
</template>

<style lang="scss">
.project-table {
  display: flex;
  width: 100%;
  flex-direction: column;

  &__header {
    display: flex;
    background-color: #998e7e;
    color: white;
    margin-bottom: 5px;

    .col_bleach {
        border-right: 1px solid #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__row {
    display: flex;
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  &__col {
    &-1 {
      flex-basis: 14.2857%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-2 {
      flex-basis: 14.2857%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-3 {
      flex-basis: 28%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-4 {
      flex-basis: 17%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-5 {
      flex-basis: 15%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-6 {
      flex-basis: 9%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
    &-7 {
      flex-basis: 17%;
      border: 1px solid #978D7E;
      padding: 5px;
    }
  }

  &__col-1 {
    .requestOn {
      height: 10px;
      cursor: pointer;
      transform: rotate(180deg);
    }
  }

  &__col-2 {
    .projectid {
        height: 10px;
        cursor: pointer;
    }
  }

  &__col-7 {
    display: flex;
    justify-content: center;

    img {
      width: 19px;
      cursor: pointer;
    }
  }
}
</style>

<script>
import moment from "moment";

export default {
  data() {
    return {
      clientQuotes: [
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        },
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        },
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        }
      ]
    };
  }
};
</script>
