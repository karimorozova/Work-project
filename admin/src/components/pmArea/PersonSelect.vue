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
        .drop__item(v-for="(person, index) in extendedPersons" @click="setPerson(index)" :class="{chosen: selectedPerson === getPersonFullName(person)}")
            span(v-if="person.firstName") {{ person.firstName }} {{ person.surname }}
            span.drop__last-item(v-if="person === 'Show all' || person === 'Hide all'") {{ person }}
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
        },
        isExtended: {
            type: Boolean
        },
        isAdditionalShow: {
            type: Boolean,
            default: false
        },
        index: {
            type: Number
        }
    },
    data() {
        return {
            isDropped: false,
            errors: []
        }
    },
    methods: {
        togglePersons(event) {
            let elementsObj = event.composedPath();
            let tr = elementsObj.find(item => {
                if(item.localName == "tr" || (item.className && item.className.indexOf("table__body-row") !== -1)) {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.isDropped = !this.isDropped;
            this.$emit('scrollDrop', {drop: this.isDropped, offsetTop: top, offsetHeight: height})
        },
        outClick(){
            this.isDropped = false;
            this.$emit('scrollDrop', {drop: this.isDropped, offsetTop: 0, offsetHeight: 0})
        },
        getPersonFullName(person) {
            return person.firstName + ' ' + person.surname;
        },
        setPerson(index) {
            if(this.extendedPersons[index] === "Show all") {
                return this.$emit('togglePersonsData', { isAll: true })
            }
            if(this.extendedPersons[index] === "Hide all") {
                return this.$emit('togglePersonsData', { isAll: false })
            }
            this.isDropped = false;
            this.$emit('setPerson', {person: this.extendedPersons[index]})
        },
    },
    directives: {
        ClickOutside
    },
    computed: {
        extendedPersons() {
            let result = [...this.persons];
            if(this.isAdditionalShow) {
                this.isExtended ? result.push("Hide all") : result.push("Show all");
            }
            return result;
        }
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
        .steps__vendor-menu & {
            padding-top: 3px;
        }
    }
    .steps__vendor-menu & {
        border: none;
        border-radius: 0;
        height: 29px;
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
        .steps__vendor-menu & {
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
        flex-direction: column;
        background-color: $white;
        box-sizing: border-box;
        z-index: 10;
        &__item {
            align-items: center;
            padding: 6px 3px 6px 6px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: $active-background;
            }
        }
        .chosen {
            background-color: $active-background;
        }
        .project-details__drop-menu &, .step-vendor & {
            border: none;
            border-top: 1px solid $brown-border;
        }
        &__last-item {
            font-style: italic;
        }
    }
    .project-details__drop-menu &, .step-vendor & {
        border: 1px solid $brown-border;
        border-radius: 5px;
    }
}

</style>
