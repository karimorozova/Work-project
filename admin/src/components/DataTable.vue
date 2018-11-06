<template lang="pug">
.table
    .table__thead(:class="{'table_scroll-padding': hasScroll}")
        .table__head-row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(:name="field.headerKey" :field="field")
    .table__tbody(:class="[{'table_bottom-bordered': hasScroll}, bodyClass]")
        .table__body-row(v-for="(row, index) of tableData" @click="onClick(index)" :class="bodyRowClass")
            .table__tbody-cell(v-for="field of fields" :style="{width: field.width, padding: field.padding}" :class="[bodyCellClass, field.cellClass]")
                slot(:name="field.key" :row="row" :index="index")
            transition(name="slide-fade")
                .table__row-expanded(v-if="isExpand && activeIndex === index")
                    slot(name="expanded" :row="row" :index="index")
</template>

<script>
export default {
    props: {
        fields: {
            type: Array
        },
        tableData: {
            type: Array
        },
        hasScroll: {
            type: Boolean
        },
        isExpand: {
            type: Boolean,
            default: false
        },
        activeIndex: {
            type: Number
        },
        bodyClass: {
            type: String
        },
        bodyRowClass: {
            type: String
        },
        bodyCellClass: {
            type: String
        }
    },
    methods: {
        onClick(index) {
            this.$emit("onRowClicked", {index: index})
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/colors.scss';

.table {
    width: 100%;
    overflow: hidden;
    &__thead {
        .table__head-row {
            background-color: $thead-background;
            color: $white;
        }
    }
    &__tbody {
    max-height: 180px;
    overflow-y: overlay;
    margin-bottom: 20px;
        .table__body-row {
            cursor: pointer;
            &:nth-of-type(odd) {
                .table__tbody-cell {
                    background-color: $table-row-zebra-background;
                }
            }
            &:hover {
                .table__tbody-cell {
                    background-color: $cell-background;
                }
            }
        }
        .steps-table-row, .rates-matrix-row {
            cursor: default;
        }
        .vendors-table_height-28 {
            cursor: default;
            height: 32px;
        }
    }
    &__thead-cell {
        box-sizing: border-box;
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 0.5px solid $cell-border;
        border-right: none;
        border-left: 0.5px solid $white;
        &:first-child {
            border-left: 0.5px solid $cell-border;
        }
        &:last-child {
            border-right: 0.5px solid $cell-border;
        }
    }
    &__tbody-cell {
        box-sizing: border-box;
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 1px solid $cell-border;
        border-right: none;
        &:last-child {
            border-right: 0.5px solid $cell-border;
        }
        &:focus-within {
            box-shadow: inset 0 0 5px $cell-border;
        }
    }
    &__head-row, &__body-row {
        display: flex;
        flex-wrap: wrap;
    }
    &__row-expanded {
        width: 100%;
        background-color: $white;
        .table__body-row {
            cursor: default;
            &:nth-of-type(even) {
                .table__tbody-cell  {
                    background-color: $white;
                }
            }
            &:nth-of-type(odd) {
                .table__tbody-cell  {
                    background-color: $table-row-zebra-background;
                }
            }
            &:hover {
                .table__tbody-cell {
                    background-color: $cell-background;
                }
            }
        }
    }
    &_scroll-padding {
        padding-right: 15px;
    }
    &_bottom-bordered {
        border-bottom: 0.5px solid $cell-border;
    }
}
.steps-table-body {
    max-height: 300px;
}
.steps-table-cell {
    display: flex;
    align-items: center;
}
.vendors-table__body {
    max-height: 500px;
    min-height: 150px;
}
.vendors-table_scroll-y {
    overflow-y: auto;
}
.matrix-table {
    max-height: 350px;
}
.rates-matrix-body {
    max-height: 400px;
    margin-bottom: 0;
}
.step-files_centered, .tasks_centered {
    display: flex;
    justify-content: center;
}
.project-finance_no-padding {
    padding: 0;
}
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

</style>
