<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedManager")
                .selected
                    span {{ selectedManager.username }}
            template(v-if="!selectedManager") 
                span.selected.no-manager Options
            .arrow-button(@click="showManagers")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(manager, index) in managers" @click="changeManager(index)" :class="{chosen: manager._id == selectedManager._id}")
                span {{ manager.username }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedManager: {
            type: [Object, String]
        }
    },
    data() {
        return {
            managers: [],
            dropped: false,
            errors: []
        }
    },
    methods: {
        showManagers() {
            this.dropped = !this.dropped;
        },
        outClick() {
            this.dropped = false;
        },
        changeManager(index) {
            this.$emit("chosenManager", { manager: this.managers[index]});
            this.outClick();
        },
        async getManagers() {
            try {
            const result = await this.$http.get('/users')
            this.managers = result.data;
            } catch(err) {
                console.log(err);
            }  
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {
        this.getManagers()
    }
}
</script>

<style lang="scss" scoped>
.select {
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
    }
    .no-manager {
        opacity: 0.5;
    }
    .arrow-button {
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
.drop-select {
    position: absolute;
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 100%;
    overflow: hidden;
    z-index: 6;
    .drop {
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
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
