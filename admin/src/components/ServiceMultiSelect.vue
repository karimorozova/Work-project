<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedServ.length && selectedServ[0].title != 'Select'")
                .selected
                    span(v-for="serv in selectedServ") {{ serv.title }}; 
            template(v-if="!selectedServ.length || selectedServ[0].title == 'Select'") 
                span.selected.no-choice Select
            .arrow-button(@click="showServs")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedServ}")
        .drop(v-if="droppedServ")
            .drop__item(v-for="(service, index) in services" @click="changeServ(index)")
                .checkbox
                    .checkbox__check(:class="{checked: filteredServices.indexOf(service.title) != -1}")
                span.drop__name {{ service.title }}
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        form: {
            type: String
        },
        selectedServ: {
            type: Array
        },
        filteredServices: {
            type: Array,
        },
        parentIndex: {
            type: Number,
            default: 0
        },
        entity: {
            type: Object
        }
    },
    data() {
        return {
            droppedServ: false,
            errors: [],
            services: []
        }
    },
    methods: {
        showServs(event) {
            let elementsObj = event.composedPath();
            let tr = elementsObj.find(item => {
                if(item.localName == "tr") {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.droppedServ = !this.droppedServ;
            this.$emit('scrollDrop', {drop: this.droppedServ, index: this.parentIndex, offsetTop: top, offsetHeight: height})
        },
        async getAllServices() {
            try {
                if(!this.vuexServices.length) {
                    await this.getServices();
                }
            } catch(err) { }
            this.services = this.vuexServices;
            this.services.sort( (a,b) => {
                if(a.title < b.title) return -1;
                if(a.title > b.title) return 1;
            });
            if(this.form === "Mono") {
                this.services = this.services.filter(item => item.languageForm === "Mono")
            } else {
                this.services = this.services.filter(item => {
                    if(item.symbol == 'tr' ||
                        item.symbol == 'pr' || 
                        item.symbol == 'qt') {
                        return item
                    }    
                })
            }
        },
        outClick() {
            this.droppedServ = false;
        },
        changeServ(index) {
            this.$emit("chosenServ", {service: this.services[index], index: this.parentIndex})
        },
        ...mapActions({
            getServices: "getServices"
        })
    },
    computed: {
        ...mapGetters({
            vuexServices: "getVuexServices"
        }) 
    }, 
    directives: {
        ClickOutside
    },
    mounted () {
        this.getAllServices()
    }
}
</script>

<style lang="scss" scoped>
.select {
    width: 100%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #bfb09d;
        width: 80%;
        padding: 0 5px;
        font-size: 14px;
        height: 32px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        .services__drop-menu & {
            height: 28px;
        }
    }
    .arrow-button {
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
        .inner-component & {
            background-color: white;
            box-shadow: inset -1px 0 5px #bfb09d;
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
        height: 100%;
        .selected {
            padding-top: 5px;
        }
    }
    .no-choice {
        opacity: 0.6;
    }
}
.drop-select {
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 5;
    border: 1px solid #67573E;
    border-radius: 5px;
    box-sizing: border-box;
    .drop {
        font-size: 14px;
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 186px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: ease 0.2s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        &__name {
            max-width: 90%;
        }
        .inner-component & {
            max-height: 130px;
            border-bottom: 1px solid #BFB09D;
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        height: 100%;
        z-index: 4;
    }
}
.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid #67573E;
    margin-right: 3px;
    .checked {
        width: 100%;
        height: 100%;
        position: relative;
        &::before {
            content: '';
            position: absolute;
            width: 5px;
            border: 1px solid #67573E;
            top: 6px;
            left: 1px;
            transform: rotate(45deg);
        }
        &::after {
            content: '';
            position: absolute;
            width: 6px;
            border: 1px solid #67573E;
            top: 5px;
            left: 4px;
            transform: rotate(-58deg);
        }
    }
}
</style>
