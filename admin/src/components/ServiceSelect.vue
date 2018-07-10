<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            span.selected {{ selectedServ.title }}
            .arrowButton(@click="showServs")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedServ}")
        .drop(v-if="droppedServ")
            span.drop__item(v-for="(service, index) in services" @click="changeServ(index)") {{ service.title }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedServ: {
            type: Object
        }
    },
    data() {
        return {
            services: [],
            droppedServ: false,
            errors: []
        }
    },
    methods: {
        showServs() {
            this.droppedServ = !this.droppedServ;
        },
        async getServices() {
            await this.$http.get('api/services')
            .then(response => {
                let sortedArray = response.data
                sortedArray.sort( (a,b) => {
                    if(a.title < b.title) return -1;
                    if(a.title > b.title) return 1;
                });
                this.services = sortedArray;
            })
            .catch(e => {
                this.errors.push(e)
            })
        },
        outClick() {
            this.droppedServ = false;
        },
        changeServ(index) {
            this.$emit("chosenServ", this.services[index])
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {
        this.getServices()
    }
}
</script>

<style lang="scss" scoped>
.select {
    border: 1px solid #BFB09D;
    border-radius: 5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 3px 5px;
        font-size: 14px;
        opacity: 0.7;
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
        overflow-y: scroll;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 5;
        &__item {
            padding: 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                padding-left: 5px;
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
    }
}
</style>
