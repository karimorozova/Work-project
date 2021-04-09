<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedManager")
                .selected
                    span {{ getFullName(selectedManager) }}
            template(v-if="!selectedManager")
                span.selected.no-manager Options
            .arrow-button(@click="showManagers")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(manager, index) in currentUsers(users) " @click="changeManager(index)" :class="{'chosen': manager._id == selectedManager._id}")
                span {{ getFullName(manager) }}
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters } from "vuex"

export default {
    props: {
        selectedManager: {
            type: [Object, String]
        },
        group: {
            type: String
        }
    },
    data() {
        return {
            dropped: false,
            errors: []
        }
    },
    methods: {
    	  currentUsers(users){
		       return users.filter(item => {
		       	if(this.group){
			        return item.group.name === this.group
            }
		       	return item
           })
        },
        showManagers() {
            this.dropped = !this.dropped;
        },
        outClick() {
            this.dropped = false;
        },
        changeManager(index) {
            this.$emit("chosenManager", { manager: this.currentUsers(this.users)[index]});
            this.outClick();
        },
        getFullName(manager) {
            const firstName = manager.firstName || "";
            const lastName = manager.lastName || "";
            return `${firstName} ${lastName}`;
        }
    },
    directives: {
        ClickOutside
    },
	computed: {
      ...mapGetters({
	        users: "getUsers"
      })
	},
}
</script>

<style lang="scss" scoped>
.select {
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 80%;
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
    }
}
.drop-select {
    position: absolute;
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 100%;
    overflow: hidden;
    z-index: 6;
    box-sizing: border-box;
    .drop {
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 186px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: ease 0.2s;
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
