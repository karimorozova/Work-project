<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            template(v-if="selectedLeadsource")
                .selected
                    span {{ selectedLeadsource }}
            template(v-if="!selectedLeadsource") 
                span.selected.no-industry Options
            .arrowButton(@click="showLeadsources")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(leadsource, index) in leadsources" @click="changeLeadsource(index)" :class="{chosen: leadsource == selectedLeadsource}")
                span {{ leadsource }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLeadsource: {
            type: String
        }
    },
    data() {
        return {
            leadsources: ["Internet", "Website", "Advertising", "Landing Pages", "Social Media", "Friend"],
            dropped: false,
            errors: []
        }
    },
    methods: {
        showLeadsources() {
            this.dropped = !this.dropped;
        },
        outClick() {
            this.dropped = false;
        },
        changeLeadsource(index) {
            this.$emit("chosenLeadsource", this.leadsources[index])
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {

    }
}
</script>

<style lang="scss" scoped>
.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 191px;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .industry-tooltip {
            width: 40px;
            max-height: 28px;
            display: flex;
            .toolTip {
                position: absolute;
                color: #ff876c;
                font-size: 12px;
                display: none;
                left: 36px;
                top: 8px;
            }
            &:hover {
                .toolTip {
                    display: inline-block;
                }
            }
        }
    }
    .no-industry {
        opacity: 0.5;
    }
    .arrowButton {
        width: 18%;
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
.dropSelect {
    position: relative;
    .drop {
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
            display: flex;
            align-items: center;
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
}

</style>
