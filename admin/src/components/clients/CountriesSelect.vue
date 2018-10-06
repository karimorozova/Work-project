<template lang="pug">
    .countries-list
        .drop-select(v-click-outside="outCountries")
            .select
                template(v-if="countrySelected")
                    .selected
                        span {{ countrySelected }}
                template(v-if="!countrySelected")
                    span.selected.no-country Country
                .arrow-button(@click="openCountries")
                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: countriesDropped}")
            .search-country(v-if="countriesDropped")
                input.search(type="text" v-model="countrySearch" placeholder="Search")
            .drop(v-if="countriesDropped")
                .drop__item.country-name(v-for="(country, ind) in foundCountries" @click="chooseCountry(ind)")
                    span {{ country.name }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        countrySelected: {
            type: String
        },
        countries: {
            type: Array
        }
    },
    data() {
        return {
            countriesDropped: false,
            countrySearch: ""
        }
    },
    methods: {
        chooseCountry(ind) {
            this.$emit('chosenCountry', this.foundCountries[ind].name);
        },
        openCountries() {
            this.countriesDropped = !this.countriesDropped;
        },
        outCountries() {
            this.countriesDropped = false;
        }
    },
    computed: {
        foundCountries() {
            let result = this.countries;
            if(this.countrySearch) {
                result = result.filter(item => {
                    if(item.name.toLowerCase().indexOf(this.countrySearch.toLowerCase()) != -1) {
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
    .search-country {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        z-index: 10;
        .search {
            width: 99%;
            outline: none;
            border: none;
            padding: 5px 2px;
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
    }
}

</style>
