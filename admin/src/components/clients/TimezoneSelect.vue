<template lang="pug">
    .timezones-list
        .drop-select(v-click-outside="outTimezones")
            .select
                template(v-if="timezoneSelected")
                    .selected
                        span {{ timezoneSelected }}
                template(v-if="!timezoneSelected")
                    span.selected.no-country Timezone
                .arrow-button(@click="openTimezones")
                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: timezonesDropped}")
            .search-zone(v-if="timezonesDropped")
                input.search(type="text" v-model="timezoneSearch" placeholder="Search")
            .drop(v-if="timezonesDropped")
                .drop__item(v-for="(timezone, ind) in foundZones" @click="chooseZone(ind)")
                    span {{ timezone.zone }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        timezoneSelected: {
            type: String
        },
        timezones: {
            type: Array
        }
    },
    data() {
        return {
            timezonesDropped: false,
            timezoneSearch: ""
        }
    },
    methods: {
        chooseZone(ind) {
            this.$emit('chosenZone', this.foundZones[ind].zone);
            this.timezonesDropped = false;
        },
        openTimezones() {
            this.timezonesDropped = !this.timezonesDropped;
            if(!this.timezonesDropped) {
                this.timezoneSearch = ""
            }
        },
        outTimezones() {
            this.timezonesDropped = false;
            this.timezoneSearch = ""
        }
    },
    computed: {
        foundZones() {
            let result = this.timezones;
            if(this.timezoneSearch) {
                result = result.filter(item => {
                    if(item.zone.toLowerCase().indexOf(this.timezoneSearch.toLowerCase()) != -1) {
                        return item
                    }
                })
            }
            return result;
        }
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>

.drop-select {
    position: relative;
    .search-zone {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        z-index: 10;
        .search {
            width: 99%;
            outline: none;
            border: none;
            padding: 5px 2px;
            .block-item & {
                width: 98%;
            }
        }
    }
    .drop {
        margin-top: 27px;
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            padding: 5px 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
    }
    .block-item & {
        width: 193px;
    }
}

.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 470px;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 91%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .block-item & {
            width: 82%;
        }
    }
    .no-country {
        opacity: 0.5;
    }
    .arrow-button {
        width: 9%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
        .block-item & {
            width: 18%;
        }
    }
    .block-item & {
        width: 193px;
    }
}

</style>
