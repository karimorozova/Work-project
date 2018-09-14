<template lang="pug">
.select-comp
    .select-comp__label {{ label }}:
    .drop-select(v-click-outside="outCompetences")
        .select(@click="toggleCompetences")
            span.selected(v-if="selectedCompetence.length") {{ selectedCompetence.join('; ') }}
            span.selected.no-choice(v-if="!selectedCompetence.length") Select
            .arrow-button
                img(src="../../../assets/images/arrow_open.png" :class="{reverseIcon: compDropped}")
        .drop(v-if="compDropped")
            .drop__item(v-for="(competence, index) in competences" @click="chooseCompetence(index)")
                .checkbox
                    .checkbox__check(:class="{checked: selectedCompetence.indexOf(competence) != -1}")
                span {{ competence }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedCompetence: {
            type: Array
        },
        competences: {
            type: Array
        },
        label: {
            type: String
        },
        refersTo: {
            type: String
        }
    },
    data() {
        return {
            compDropped: false
        }
    },
    methods: {
        outCompetences() {
            this.compDropped = false;
        },
        toggleCompetences() {
            this.compDropped = !this.compDropped;
        },
        chooseCompetence(index) {
            this.$emit("chooseCompetence", {comp: this.competences[index], refersTo: this.refersTo})
        }
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>

.select-comp {
    width: 100%;
    &__label {
        font-size: 12px;
    }
}

.drop-select {
    position: absolute;
    top: 20px;
    width: 100%;
    border: 1px solid #67573E;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.7);
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
            display: flex;
            align-items: center;
            height: 37px;
            padding: 7px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:first-child {
                border-top: .5px solid #BFB09D;
            }
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .active-comp {
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
        width: 90%;
        padding: 3px 10px;
        font-size: 14px;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
    }
    .no-choice {
        opacity: 0.5;
    }
    .arrow-button {
        width: 10%;
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

.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid #67573E;
    margin-right: 3px;
    margin-left: 5px;
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
            left: 3px;
            transform: rotate(-58deg);
        }
    }
}

</style>
