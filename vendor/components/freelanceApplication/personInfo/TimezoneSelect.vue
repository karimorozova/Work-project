<template lang="pug">
    .timezones-list
        .title Time-zone:
        .dropSelect(v-click-outside="outTimezones")
            .select(@click="openTimezones")
                span.selected(v-if="timezoneSelected") {{ timezoneSelected.split(" ")[0] }}
                span.selected.no-country(v-else) Select
                .arrowButton
                    img(src="../../../assets/images/arrow_open.png" :class="{reverseIcon: timezonesDropped}")
            input.search(v-if="timezonesDropped" type="text" v-model="timezoneSearch" placeholder="Search")
            .drop(v-if="timezonesDropped")
                .drop__item(v-for="(timezone, index) in foundZones" @click="chooseZone(index)" :class="{'active-zone': timezoneSelected == timezone.zone}")
                    span {{ timezone.zone }}
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        timezoneSelected: {
            type: String
        }
    },
    data() {
        return {
            timezonesDropped: false,
            timezoneSearch: ""
        }
    },
    methods: {
        ...mapActions({
            getAllTimezones: 'getAllTimezones'
        }),
        chooseZone(index) {
            this.$emit('chooseZone', {zone: this.foundZones[index].zone});
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
        ...mapGetters({
            timezones: 'getTimezones'
        }),
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
    created() {
        this.getAllTimezones();
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>

.title {
    font-size: 12px;
    margin-bottom: 5px;
}

.dropSelect {
    position: relative;
    width: 214px;
    border: 1px solid #67573E;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.7);
    .search {
        z-index: 50;
        width: 100%;
        padding: 5px 3px;
        color: #67573E;
        outline: none;
        box-shadow: inset 0 0 5px rgba(125, 138, 180, 0.623);
        border: 1px solid rgba(125, 138, 180, 0.466);
        border-right: none;
    }
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            height: 37px;
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
        .active-zone {
            background-color: rgba(102, 86, 61, 0.7);
            color: #FFF;
        }
    }
}

.select {
    border-radius: 15px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    .selected {
        width: 75%;
        padding: 3px 10px;
        font-size: 14px;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
    }
    .no-country {
        opacity: 0.5;
    }
    .arrowButton {
        width: 25%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
    }
}

</style>
