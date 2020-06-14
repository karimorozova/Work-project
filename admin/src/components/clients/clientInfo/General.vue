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
            .block-item
                label Test:
                .block-item__check-item.checkbox
                    input(type="checkbox" id="test" :checked="currentClient.isTest" @change="setTest")
                    label(for="test")            
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
            "updateClientStatus",
            "alertToggle",
        ]),
        async setTest(){
            const client = {
                id: this.currentClient._id,
                isTest: event.target.checked
            };
        try {
            await this.updateClientStatus(client);
                this.alertToggle({message: "Client status updated", isShow: true, type: "success"});
            } catch (err) {
                this.alertToggle({
                    message: "Server error / Cannot update Client status",
                    isShow: true,
                    type: "error"
                });
            }
        },
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
    &__check-item{
        width: 190px;
    }
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
    #test{
        width: 0;
    }
    .checkbox {
        display: flex;
        height: 28px;
        input[type="checkbox"] {
        opacity: 0;
        + {
            label {
            &::after {
                content: none;
            }
            }
        }
        &:checked {
            + {
            label {
                &::after {
                content: "";
                }
            }
            }
        }
        }
        label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 4px;
        &::before {
            position: absolute;
            content: "";
            display: inline-block;
            height: 16px;
            width: 16px;
            border: 1px solid;
            left: 0px;
            top: 3px;
        }
        &::after {
            position: absolute;
            content: "";
            display: inline-block;
            height: 5px;
            width: 9px;
            border-left: 2px solid;
            border-bottom: 2px solid;
            transform: rotate(-45deg);
            left: 4px;
            top: 7px;
        }
      }
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
