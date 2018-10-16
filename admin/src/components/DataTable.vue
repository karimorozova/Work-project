<template lang="pug">
.table
    .table__thead(:class="{'table_scroll-padding': hasScroll}")
        .table__row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(:name="field.label" :field="field")
    .table__tbody(:class="{'table_bottom-bordered': hasScroll}")
        .table__row(v-for="(row, index) of tableData" @click="onClick(index)")
            .table__tbody-cell(v-for="field of fields" :style="{width: field.width}")
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
        background-color: $thead-background;
        color: $white;
    }
    &__tbody {
    max-height: 180px;
    overflow-y: auto;
    margin-bottom: 20px;
        .table__row {
            cursor: pointer;
            &:nth-of-type(odd) {
                background-color: $table-row-zebra-background;
            }
            &:hover {
                .table__tbody-cell {
                    background-color: $cell-background;
                }
            }
            .steps__table & {
                cursor: default;
            }
        }
        .steps__table & {
            overflow-y: overlay;
            max-height: 300px;
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
        border: 0.5px solid $cell-border;
        border-right: none;
        &:last-child {
            border-right: 0.5px solid $cell-border;
        }
        &:focus-within {
            box-shadow: inset 0 0 5px $cell-border;
        }
        .steps__table & {
            display: flex;
            align-items: center;
            &:nth-of-type(4) {
                padding: 0;
            }
        }
    }
    &__row {
        display: flex;
        flex-wrap: wrap;
    }
    &__row-expanded {
        width: 100%;
        height: 250px;
        background-color: $white;
    }
    &_scroll-padding {
        padding-right: 15px;
    }
    &_bottom-bordered {
        border-bottom: 0.5px solid $cell-border;
    }
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
