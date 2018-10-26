<template lang="pug">
.drop-select(v-click-outside="outClick")
    .select
        template(v-if="selectedPerson")
            span.selected {{ selectedPerson }}
        template(v-if="!selectedPerson") 
            span.selected.no-select Select
        .arrow-button(@click="togglePersons")
            img(src="../../assets/images/open-close-arrow-brown.png" :class="{'reverse-icon': isDropped}")
    .drop(v-if="isDropped")
        .drop__item(v-for="(person, index) in persons" @click="setPerson(index)" :class="{chosen: selectedPerson === getPersonFullName(person)}")
            span {{ person.firstName }} {{ person.surname }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedPerson: {
            type: String
        },
        persons: {
            type: Array
        }
    },
    data() {
        return {
            isDropped: false,
            errors: []
        }
    },
    methods: {
        togglePersons() {
            this.isDropped = !this.isDropped;
        },
        outClick() {
            this.isDropped = false;
        },
        getPersonFullName(person) {
            return person.firstName + ' ' + person.surname;
        },
        setPerson(index) {
            this.isDropped = false;
            this.$emit('setPerson', {person: this.persons[index]})
        },
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.select {
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .steps__table & {
            padding-top: 3px;
        }
    }
    .steps__table & {
        border: none;
        border-radius: 0;
        height: 29px;
    }
    .step-vendor & {
        border: 1px solid $light-brown;
        border-radius: 5px;
    }
    .no-select {
        opacity: 0.5;
    }
    .arrow-button {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-left: 1px solid $brown-border;
        cursor: pointer;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
        .steps__table & {
            padding-top: 3px;
            border-left: 1px solid $light-brown;
        }
    }
}
.drop-select {
    position: absolute;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .drop {
        font-size: 14px;
        width: 100%;
        border: 1px solid $light-brown;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: $white;
        z-index: 10;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 6px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: $active-background;
            }
            .project-details__drop-menu & {
                padding: 7px;
            }
        }
        .chosen {
            background-color: $active-background;
        }
        .project-details__drop-menu & {
            border: none;
            border-top: 1px solid $brown-border;
        }
    }
    .project-details__drop-menu & {
        border: 1px solid $brown-border;
        border-radius: 5px;
    }
}

</style>
