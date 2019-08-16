<template lang="pug">
    .new-general
        .new-general__block
            .block-item
                label.block-item__label.block-item_relative Company Name:
                    Asterisk(:customStyle="asteriskStyle")
                input(type="text" placeholder="Company Name" v-model="client.name" :class="{'client-info_error-shadow': !client.name && isSaveClicked}")
            .block-item
                label.block-item__label Website:
                input(type="text" placeholder="Website" v-model="client.website")
            .block-item
                label.block-item__label.block-item_relative Industry:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'client-info_error-shadow': isSaveClicked && !client.industries.length}")
                    MultiClientIndustrySelect(:selectedInd="client.industries" :filteredIndustries="selectedIndNames" @chosenInd="setIndustries")
            .block-item
                label.block-item__label.block-item_relative Status:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'client-info_error-shadow': isSaveClicked && !client.status}")
                    ClientStatusSelect(:selectedStatus="client.status" @chosenStatus="setStatus")
        .new-general__block
            .block-item
                label.block-item__label Contract:
                .contract
                    .contract__upload
                        input.upload(type="file" @change="contractLoad")
                    .contract__download
                        a(v-if="client.contract" :href="client.contract")
                            img(src="../../../assets/images/Other/Download-icon.png")
                label.block-item__label NDA:
                .nda
                    .nda__upload
                        input.upload(type="file" @change="ndaLoad")
                    .nda__download
                        a(v-if="client.nda" :href="client.nda")
                            img(v-if="client.nda" src="../../../assets/images/Other/Download-icon.png")
            .block-item
                label.block-item__label.block-item_relative Account Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'client-info_error-shadow': isSaveClicked && !client.accountManager}")
                    AMSelect(:selectedManager="client.accountManager" @chosenManager="(manager) => setManager(manager, 'accountManager')")
            .block-item
                label.block-item__label.block-item_relative Sales Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_medium-index(:class="{'client-info_error-shadow': isSaveClicked && !client.salesManager}")
                    AMSelect(:selectedManager="client.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')")
            .block-item
                label.block-item__label.block-item_relative Project Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'client-info_error-shadow': isSaveClicked && !client.projectManager}")
                    AMSelect(:selectedManager="client.projectManager" @chosenManager="(manager) => setManager(manager, 'projectManager')")
</template>

<script>
import Asterisk from "@/components/Asterisk";
import MultiClientIndustrySelect from '../MultiClientIndustrySelect';
import ClientStatusSelect from '../ClientStatusSelect';
import AMSelect from '../AMSelect';

export default {
    props: {
        client: {type: Object},
        isSaveClicked: {type: Boolean}
    },
    data() {
        return {
            asteriskStyle: {"top": "-4px"},
        }
    },
    methods: {
        contractLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.$emit('loadFile', {files: e.target.files, prop: 'contractFiles'})
            };
        },
        ndaLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.$emit('loadFile', {files: e.target.files, prop: 'ndaFiles'})
            }
        },
        setStatus({status}) {
            this.client.status = status;
        },
        setManager({manager}, prop) {
            this.client[prop] = manager;
        },
        setIndustries({industry}) {
            if(!this.client.industries.length) {
                return this.client.industries.push(industry);
            }
            const position = this.client.industries.findIndex(item => item._id === industry._id);
            if(position !== -1) {
                return this.client.industries.splice(position, 1);
            }
            this.client.industries.push(industry);
        },
    },
    components: {
        Asterisk,
        MultiClientIndustrySelect,
        ClientStatusSelect,
        AMSelect
    }
}

</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.new-general {
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__block {
        width: 35%;
    }
}

.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &__label {
        margin-bottom: 0;
    }
    &_relative {
        position: relative;
    }
    &__drop {
        position: relative;
        width: 191px;
        height: 28px;
    }
    &_high-index {
        z-index: 10;
    }
    &_medium-index {
        z-index: 8;
    }
    input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 5px;
        box-sizing: border-box;
        padding: 0 5px;
        outline: none;
        width: 191px;
        height: 30px;
    }
    ::-webkit-input-placeholder {
        opacity: 0.5;
    }
}
.contract, .nda {
    display: flex;
    align-items: center;
    width: 22%;
    justify-content: space-between;
    &__upload {
        position: relative;
        background: url("../../../assets/images/Other/upload-icon.png");
        background-repeat: no-repeat;
        width: 40%;
        height: 22px;
        overflow: hidden;
        .upload {
            padding-left: 0;
            padding-right: 0;
            width: 33px;
            height: 22px;
            border: none;
            outline: none;
            margin-top: -3px;
            margin-right: 2px;
            opacity: 0;
            z-index: 2;
            position: absolute;
            left: -10px;
        }
    }
    &__download {
        width: 40%;
        cursor: pointer;
    }
}

</style>
