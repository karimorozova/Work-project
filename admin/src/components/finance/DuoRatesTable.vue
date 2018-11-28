<template lang="pug">
.duorates-table(v-click-outside="clearCurrentActive")
    .table-data
        table.duo-finance(:style="{width: tableWidth}")
            thead
                tr
                    th(v-for="head in tableHeader") {{ head.title }}
            tbody.duo-tbody
                template(v-for="(info, index) in fullInfo" v-if="(sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || sourceSelect[0] == 'All') && (targetSelect.indexOf(info.targetLanguage.symbol) != -1 || targetSelect[0] == 'All')")
                    tr(v-for="(indus, indusInd) in info.industry" v-if="indus.rate != 0 && (filterIndustry.indexOf(indus.name) != -1 || industryFilter[0].name == 'All')")
                        td.drop-option 
                            template(v-if='currentActive !== index && (sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || !info.sourceLanguage.symbol || sourceSelect[0] == "All")') {{ info.sourceLanguage.lang }}
                            .inner-component(v-if="currentActive === index")
                                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[currentSource.symbol]" @chosenLang="changeSource" @scrollDrop="scrollDrop")
                        td.drop-option 
                            template(v-if='currentActive !== index && (sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || !info.targetLanguage.symbol || targetSelect[0] == "All" || sourceSelect[0] == "All")') {{ info.targetLanguage.lang }}
                            .inner-component(v-if="currentActive === index")
                                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[currentTarget.symbol]" @chosenLang="changeTarget" @scrollDrop="scrollDrop")
                        td.drop-option              
                            span(v-if="!indus.icon && currentActive !== index") {{ indus.name }}
                            .drop-option__image
                                img(v-if="indus.icon && currentActive !== index" :src="indus.icon")
                                span.title-tooltip {{ indus.name }}
                            .inner-component(v-if="currentActive === index")
                                IndustrySelect(:parentIndex="index" :who="entity" :selectedInd="industrySelected" :filteredIndustries="infoIndustries" @chosenInd="changeIndustry" @scrollDrop="scrollDrop")
                        td
                            input(v-if="currentActive !== index" type="checkbox" :checked="indus.active" :value="indus.active" disabled)
                            input(v-else type="checkbox" :checked="isIndustryActive" v-model="isIndustryActive")
                        td(:class="{'add-shadow': currentActive === index}") 
                            input.rates(:value="indus.rate" @input="changeRate" :readonly="currentActive !== index")
                        td.icons-field
                            template(v-for="(icon, key) in icons") 
                                img.crudIcon(:src="icon.image" @click="action(index, key, indusInd)" :class="{'active-icon': isActive(key, index)}")
    .add-row
        .add-row__plus(@click="addNewRow")
            span +
</template>

<script>
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import ServiceSingleSelect from "../ServiceSingleSelect";
import ClickOutside from "vue-click-outside";

export default {
    props: {
        entity: {
            type: Object
        },
        fullInfo: {
            type: Array
        },
        sourceSelect: {
            type: Array
        },
        targetSelect: {
            type: Array
        },
        industryFilter: {
            type: Array
        },
        filterIndustry: {
            type: Array
        },
        serviceSelect: {
            type: Object
        },
        isEditing: {
            type: Boolean
        },
        isValidationError: {
            type: Boolean
        }
    },
    data() {
        return {
            direction: 'duo',
            industrySelected: [{name: 'All'}],
            isIndustryActive: true,
            heads: [
                { title: "Source Language" },
                { title: "Target Language" },
                { title: "Industry" },
                { title: "Active" },
                { title: "" }
            ],
            changedRate: '',
            currentSource: {},
            currentTarget: {},
            currentActive: -1,
            icons: {
                save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, 
                edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, 
                delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            }
        }
    },
    methods: {
        isActive(key, index) {
            if(this.currentActive === index) {
                return key === "save" || key === "delete";
            }
            if(this.currentActive !== index) {
                return key === "edit" || key === "delete";
            }
        },
        handleScroll() {
            let element = document.querySelector('.duo-tbody');
            element.scrollTop = element.scrollHeight;
        },
        scrollDrop(data) {
            if(data.drop) {
                let tbody = document.querySelector('.duo-tbody');
                setTimeout(() => {
                    const offsetBottom = data.offsetTop + data.offsetHeight*2;
                    const scrollBottom = tbody.scrollTop + tbody.offsetHeight;
                    if (offsetBottom > scrollBottom) {
                        tbody.scrollTop = offsetBottom + data.offsetHeight*2 - tbody.offsetHeight;
                    }
                }, 100)
            }
        },
        clearCurrentActive() {
            if(this.currentActive === -1) {
                return
            }
            if(!this.isEditing && !this.isValidationError) {
                this.changedRate = '';
                this.currentSource = {};
                this.currentTarget = {};
                if(!this.fullInfo[this.currentActive].id) {
                    this.$emit("deleteUnsavedAddedRow", {index: this.currentActive});
                }
                this.currentActive = -1;
            }
        },
        changeRate(event) {
            this.changedRate = +event.target.value;
        },
        changeSource({lang}) {
            this.currentSource = lang;
        },
        changeTarget({lang}) {
            this.currentTarget = lang;
        },
        changeIndustry({industry}) {
            if(this.industrySelected[0].name == 'All') {
                this.industrySelected.splice(0, 1, industry)
            } else {
                const index = this.industrySelected.findIndex(item => item._id === industry._id);
                if(index !== -1) {
                    this.industrySelected.splice(index, 1);
                } else {
                    this.industrySelected.push(industry);
                }
            }
            if(!this.industrySelected.length || industry.name == 'All') {
                this.industrySelected = [];
                this.industrySelected.push({
                crud: true,
                name: 'All',
                rate: 0.1
                })
            }
        },
        addNewRow() {
            if(this.currentActive !== -1) {
                return this.$emit("showEditingError");
            }
            this.$emit("addNewRow");
            this.editRate(this.fullInfo.length-1);
            setTimeout( () => {
                this.handleScroll();
            },100);
        },
        action(index, key, indusInd) {
            if(this.currentActive !== -1) {
                if(index !== this.currentActive) {
                    this.$emit("showEditingError")
                    return;
                }
            }
            if(key === "save" ) {
                return this.checkForErrors(index);
            }

            if(key === "edit") {
                return this.editRate(index);
            }

            if(key === "delete") {
                return this.deleteRate(index, indusInd); 
            }
        },
        checkForErrors(index) {
            let validErrors = [];
            let regex = /^[0-9.]+$/;
            if(!this.currentSource.symbol) validErrors.push("Please, choose the source language!");
            if(!this.currentTarget.symbol) validErrors.push("Please, choose the target language!");
            if(!regex.test(this.changedRate)) validErrors.push("Please set the correct rate value!");
            if(validErrors.length) {
                this.$emit('showValidationErrors', { validErrors })
                return validErrors.length;
            }
            this.saveRate(index);
        },
        async saveRate(index) {
            let info = {
                service: this.serviceSelect,
                sourceLanguage: this.currentSource,
                targetLanguage: this.currentTarget,
                form: "Duo",
                industry: []  
            };
            for(let elem of this.industrySelected) {
                elem.rate = this.changedRate;
                elem.active = true;
                info.industry.push(elem)
            };
            await this.$emit("saveCombination", { info });
            this.clearCurrentActive();
        },
        editRate(index) {
            this.currentActive = index;
            this.currentSource = this.fullInfo[index].sourceLanguage;
            this.currentTarget = this.fullInfo[index].targetLanguage;
            for(let elem of this.fullInfo[index].industry) {
                this.industrySelected = [];
                this.industrySelected.push(elem)  
            }
            this.changedRate = this.fullInfo[index].industry[0].rate;
        },
        async deleteRate(index, indusInd) {
            this.currentActive = -1;
            const industry = [this.fullInfo[index].industry[indusInd]];
            this.$emit("deleteCombination", { industry, index });
        }
    },
    computed: {
        infoIndustries() {
            let result = [];
            if(this.industrySelected.length) {
                for(let elem of this.industrySelected) {
                    result.push(elem.name);
                }
            }
            return result;
        },
        tableHeader() {
            let result = [];
            for(let i = 0; i < 5; i++) {
                result.push(this.heads[i])
            }
            result.splice(-1, 0, {title: this.serviceSelect.title});
            return result;
        },
        tableWidth() {
            let result = 850;
            let cols = this.tableHeader.length;
            if(cols > 6) {
                let count = cols - 6;
                result += 150*count;
            }
            result += 'px';
            return result;
        }
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        ServiceSingleSelect
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>
.table-data {
    max-width: 872px;
    overflow-x: scroll;
}
.duo-finance {
    border-collapse: collapse;
    width: 868px;
    thead, tbody {
        border: 1px solid #BFB09D;
        display: block;
        width: 100%;
    }
    tbody {
        height: 184px;
        overflow-y: scroll;
        transition: all 0.3s;
    }
}
tr {
    display: block;
}
th, td {
    padding: 5px;
    padding-right: 0;
    font-size: 14px;
    font-weight: normal;
    white-space: nowrap;
    width: 142px;
    &:first-child, &:nth-of-type(2) {
        min-width: 160px;
    }
    &:last-child {
        width: 140px;
    }
    &:nth-of-type(4) {
        min-width: 67px;
        width: 67px;
    }
    &:nth-of-type(3) {
        min-width: 178px;
    }
}
th {
    background-color: #988C7E;
    color: white;
    border-right: 1px solid #FFF;
    &:last-child {
        border-right: none;
        width: 157px;
    }
}
td {
    border-right: 1px solid #BFB09D;
    border-bottom: 1px solid #BFB09D;
}
.icons-field{
    text-align: center;
}
.crudIcon {
    margin: 0 5px;
    opacity: .5;
    cursor: pointer;
}
.active-icon {
    opacity: 1;
}
.add-row {
    margin-top: 10px;
    margin-left: 25px; 
    &__plus {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid #BFB09D;
        span {
            font-size: 28px;
            color: #BFB09D;
            opacity: .7;
        }
    }
}
.rates {
    border: none;
    outline: none;
    width: 114px;
}
.drop-option {
    .inner-component {
        position: relative;
        background-color: #fff;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 3;
    }
    &__image {
        max-height: 21px;
        width: 30px;
        .title-tooltip {
            position: absolute;
            display: none;
            color: #D15F45;
            font-size: 12px;
            top: 8px;
            left: 35px;
        }
        &:hover {
            .title-tooltip {
                display: block;
            }
        }
        img {
            max-width: 21px;
        }
    }
}
.add-shadow {
    box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
}
</style>
