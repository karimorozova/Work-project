<template lang="pug">
    .general-info
        .general-info__block
            .block-item
                label.block-item__label.block-item_relative Company Name:
                    Asterisk(:customStyle="asteriskStyle")
                input(type="text" placeholder="Company Name" :value="currentClient.name" @change="(e) => changeProperty(e, 'name')" :class="{'general-info_error-shadow': !currentClient.name && isSaveClicked}")
            .block-item
                label.block-item__label Website:
                input(type="text" placeholder="Website" :value="currentClient.website" @change="(e) => changeProperty(e, 'website')")
            .block-item
                label.block-item__label.block-item_relative Industry:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.industries.length}")
                    MultiClientIndustrySelect(:selectedInd="currentClient.industries" :filteredIndustries="selectedIndNames" @chosenInd="setIndustries")
            .block-item
                label.block-item__label.block-item_relative Status:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.status}")
                    ClientStatusSelect(:selectedStatus="currentClient.status" @chosenStatus="setStatus")
        .general-info__block
            .block-item
                label.block-item__label Contract:
                .contract
                    .contract__upload
                        input.upload(type="file" @change="contractLoad")
                    .contract__download
                        a(v-if="currentClient.contract" :href="currentClient.contract")
                            img(src="../../../assets/images/Other/Download-icon.png")
                label.block-item__label NDA:
                .nda
                    .nda__upload
                        input.upload(type="file" @change="ndaLoad")
                    .nda__download
                        a(v-if="currentClient.nda" :href="currentClient.nda")
                            img(v-if="currentClient.nda" src="../../../assets/images/Other/Download-icon.png")
            .block-item
                label.block-item__label.block-item_relative Account Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.accountManager}")
                    AMSelect(:selectedManager="currentClient.accountManager" @chosenManager="(manager) => setManager(manager, 'accountManager')"  group="Account Managers")
            .block-item
                label.block-item__label.block-item_relative Sales Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_medium-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.salesManager}")
                    AMSelect(:selectedManager="currentClient.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')" group="Sales")
            .block-item
                label.block-item__label.block-item_relative Project Manager:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.projectManager}")
                    AMSelect(:selectedManager="currentClient.projectManager" @chosenManager="(manager) => setManager(manager, 'projectManager')"  group="Project Managers")
</template>

<script>
import Asterisk from "@/components/Asterisk";
import MultiClientIndustrySelect from '../MultiClientIndustrySelect';
import ClientStatusSelect from '../ClientStatusSelect';
import AMSelect from '../AMSelect';
import { mapGetters, mapActions} from "vuex";

export default {
    props: {
        isSaveClicked: {type: Boolean}
    },
    data() {
        return {
            asteriskStyle: {"top": "-4px"},
        }
    },
    methods: {
        ...mapActions([
            "storeClientProperty",
        ]),
        changeProperty(e, prop) {
            this.storeClientProperty({prop, value: e.target.value});
        },
        setIndustries({industry}) {
            let industries = [...this.currentClient.industries];
            const position = industries.findIndex(item => item._id === industry._id);
            if(position !== -1) {
                industries.splice(position, 1);
            } else {
                industries.push(industry);
            }
            this.storeClientProperty({prop: 'industries', value: industries});
        },
        setStatus({status}) {
            this.storeClientProperty({prop: 'status', value: status})
        },
        setManager({manager}, prop) {
            this.storeClientProperty({prop, value: manager});
        },
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
    },
    computed: {
        ...mapGetters({
            currentClient: "getCurrentClient"
        }),
        selectedIndNames() {
            let result = [];
            if(this.currentClient.industries && this.currentClient.industries.length) {
                for(let ind of this.currentClient.industries) {
                    result.push(ind.name);
                }
            }
            return result;
        }
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

.general-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__block {
        width: 35%;
    }
    &_error-shadow {
        box-shadow: 0 0 5px $red;
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
            cursor: pointer;
            font-size: 0;
        }
    }
    &__download {
        width: 40%;
        cursor: pointer;
    }
}

</style>
