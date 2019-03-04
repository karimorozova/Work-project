<template lang="pug">
  .dropItem
    .dropItem__filters
      .filterBlock
        .filterBlock__item.sourceLangs
          label.inner-label Job Type:
          .filters__drop-menu.job-type
            JobTypeSelect(
            :jobs="jobs"
            :selectedInd="jobTypeFilter"
            @setJobTypeFilter="(option)=>$emit('setJobTypeFilter',option)"
            )
      .filterBlock
        .filterBlock__item.deadline
          label.inner-label Start Date
          input.calendar(type="text" :value="startFilter")
          img(src="../../../../../assets/images/calendar.png" @click="showDetailedCalendar")
        Calendar(v-if="currentFormVisible" @dateFilter="(data)=>$emit('requestOnFilterStartDate',data)")
      .filterBlock
        .filterBlock__item.deadline
          label.inner-label Deadline
          input.calendar(type="text" :value="deadFilter")
          img(src="../../../../../assets/images/calendar.png" @click="showDetailedCalendarOther")
        Calendar(v-if="currentFormVisibleOther" @dateFilter="(data)=>$emit('requestOnFilterDeadline',data)") :class="{switcher: currentFormVisibleOther}")
      .filterBlock
        .filterBlock__item.targetLangs
          label.inner-label Invoice Date
          .filters__drop-menu.invoice-date
            InvoiceDateSelect(
            :jobs="jobs"
            :selectedInd="invoiceDateFilter"
            @setInvoiceDateFilter="(option)=>{$emit('setInvoiceDateFilter',option)}"
            )
</template>

<script>
  import Calendar from "~/components/Calendar";
  import InvoiceDateSelect from "./InvoiceDateSelect.vue";
  import JobTypeSelect from "./JobTypeSelect.vue";

  export default {
    props: {
      jobTypeFilter: {
        type: Object
      },
      invoiceDateFilter: {
        type: Object
      },
      jobs: {
        type: Array
      },
      startFilter: {
        type: String
      },
      deadFilter: {
        type: String
      },
    },
    data() {
      return {
        currentFormVisible: false,
        currentFormVisibleOther: false,
      }
    },
    methods: {
      showDetailedCalendar() {
        this.currentFormVisible = !this.currentFormVisible;
        if (this.currentFormVisible) {
          this.currentFormVisibleOther = false;
        }
      },
      showDetailedCalendarOther() {
        this.currentFormVisibleOther = !this.currentFormVisibleOther;
        if (this.currentFormVisibleOther) {
          this.currentFormVisible = false;
        }
      },
    },
    components: {
      Calendar,
      JobTypeSelect,
      InvoiceDateSelect
    },
  }
</script>

<style lang="scss" scoped>

  .filters {
    padding-top: 10px;

    &__drop-menu {
      position: relative;
      z-index: 1;

      &.invoice-date {
        width: 117px;
        height: 28px;
      }

      &.job-type {
        width: 125px;
        height: 28px;
      }

    }
  }

  .dropItem {
    width: 100%;

    &__filters {
      padding: 0 10px;
      display: flex;
      justify-content: space-between;

      .filterBlock {
        width: 25%;
        position: relative;

        &__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          .inner-label {
            margin-bottom: 0;
          }

          input, span {
            /*padding: 5px;*/
            border: 1px solid #67573e;
            width: 175px;
            height: 20px;
            border-radius: 4px;
          }

          input.calendar {
            width: 160px;
            height: 28px;
            padding: 0 4px;
          }

          span {
            position: relative;
            overflow: hidden;
            cursor: pointer;

            img {
              position: absolute;
              top: 0px;
              right: 0;
              background-color: white;
              padding: 8px;
            }

            .reverseImage {
              transform: rotate(180deg);
            }
          }

          .selector {
            display: flex;
            position: relative;

            &__drop {
              position: absolute;
              background-color: white;
              max-height: 150px;
              overflow: auto;
              right: 0;
              top: 32px;
              width: 99%;
              z-index: 2;
              border: 1px solid #67573e;
              padding-bottom: 5px;
            }
          }
        }

        .request, .deadline {
          position: relative;

          img {
            position: absolute;
            width: 19px;
            right: 2px;
            padding: 4px;
            background-color: white;
            cursor: pointer;
          }
        }

        .status {
          justify-content: flex-start;

          label {
            margin-right: 10px;
          }
        }
      }

      .filterBlock:not(:last-child) {
        margin-right: 10px;
      }
    }
  }

  .switcher {
    position: absolute;
    top: 85px;
    left: 100px;
    z-index: 5;
    @media screen and (max-width: 1580px) {
      left: 0;
    }
    @media screen and (max-width: 1515px) {
      left: -150px;
    }
  }
</style>

