<template lang="pug">
.request
    .request__all-info
        .request__info-row.request_right-padding-20
            input.request__name(type="text" :value="request.projectName" placeholder="Project Name" @change="(e) => setRequestTextValue(e, 'projectName')")
            .request__date
                LabelValue(label="Start Date & Time" :isRequired="isRequiredField" customClass="project_margin")
                    Datepicker(
                        v-model="request.startDate" 
                        :highlighted="highlighted" 
                        monday-first=true 
                        inputClass="datepicker-custom" 
                        calendarClass="calendar-custom" 
                        :format="customFormatter" 
                        :disabled="disabled" 
                        ref="start")
                img.request__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .request__date
                LabelValue(label="Requested Deadline" :isRequired="isRequiredField" customClass="project_margin")
                    Datepicker(
                        v-model="request.deadline" 
                        :highlighted="highlighted" 
                        monday-first=true 
                        :inputClass="deadlineClass" 
                        calendarClass="calendar-custom" 
                        :format="customFormatter" 
                        :disabled="disabled" 
                        :disabledPicker="this.request.isDeadlineApproved"
                        ref="deadline")
                img.request__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")
                i.request__check-icon.fa.fa-check-circle(@click="approveDeadline" :class="{'request_green': request.isDeadlineApproved}")
        .request__info-row.request_right-padding-20
            .request__client
                LabelValue(label="Client Name" :isRequired="isRequiredField" customClass="project_margin")
                    .request__client-link(v-if="request._id")
                        .request__link(@click="goToClientInfo") {{ customerName }}
                    //- .request__drop-menu(v-else)
                    //-     SelectSingle(
                    //-         :selectedOption="customerName"
                    //-         :options="clients"
                    //-         :hasSearch="isSearchClient"
                    //-         placeholder="Name"
                    //-         @chooseOption="(e) => setValue(e, 'customer')"
                    //-     )
            .request__industry
                LabelValue(label="Industry" :isRequired="isRequiredField" customClass="project_margin")
                    .request__drop-menu
                        SelectSingle(
                            :selectedOption="industryName"
                            :options="industriesList"
                            @chooseOption="setIndustry"
                            placeholder="Industry"
                        )
            .request__number
                LabelValue(label="Client Project Number" customClass="project_margin")
                    input.request__input-text(type="text" :value="request.clientProjectNumber" placeholder="Project Number" @change="(e) => setRequestTextValue(e, 'clientProjectNumber')")
        .request__info-row.request_no-margin
            .request__textarea
                LabelValue(label="Project Brief" customClass="project_textarea")
                    textarea.request__text(type="text" rows="10" v-model="request.brief")
                i.request__check-icon.fa.fa-check-circle.request_left-90(@click="approveBrief" :class="{'request_green': request.isBriefApproved}")
            .request__textarea
                LabelValue(label="Internal Notes" customClass="project_textarea")
                    textarea.request__text(type="text" rows="10" v-model="request.notes")
    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrors")
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import ValidationErrors from "../ValidationErrors";
import Datepicker from "../Datepicker";
import LabelValue from "./LabelValue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        request: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            industries: [],
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            highlighted: {
                days: [6, 0]
            },
            startDate: new Date(),
            deadline: "",
            selectedIndustry: "",
            isSearchClient: true,
            isRequiredField: true,
            errors: [],
            areErrorsExist: false,
            clients: []
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "approveRequestProp",
            "setCurrentProject",
            "setRequestValue"
        ]),
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY, HH:mm');
        },
        async setIndustry({option}) {
            await this.setRequestValue({id: this.request._id, prop: 'industry', value: option});
        },
        async setRequestTextValue(e, prop) {
            const { value } = e.target;
            try {
                await this.setRequestValue({id: this.request._id, prop, value});
            } catch(err) {
                this.alertToggle({message: "Server Error / Cannot update Project", isShow: true, type: "error"})
            }
        },
        closeErrors() {
            this.areErrorsExist = false;
        },
        checkProjectName() {
            const regex = /^[A-Za-z][A-Za-z0-9\-\_ ]+((([A-Za-z0-9])+([\-\_])?)* *)*$/;
            return regex.test(this.request.projectName);
        },
        async getIndustries() {
            const industries = await this.$http.get('/api/industries');
            this.industries = industries.body;
        },
        startOpen() {
            this.$refs.start.showCalendar();
        },
        deadlineOpen() {
            this.$refs.deadline.showCalendar();
        },
        goToClientInfo() {
            const route = this.$router.resolve({path: `/clients/details/${this.request.customer._id}`});
            window.open(route.href, "_blank");
        },
        async approveDeadline() {
            try {
                await this.approveRequestProp({id: this.request._id, prop: "isDeadlineApproved"});
            } catch(err) { }
        },
        async approveBrief() {
            try {
                await this.approveRequestProp({id: this.request._id, prop: "isBriefApproved"});
            } catch(err) { }
        },
        async getCustomers() {
            try {
                if(!this.clients.length) {
                    let result = await this.$http.get(`/active-clients?status=Active`);
                    this.clients = [...result.body];
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting customers", isShow: true, type: "error"});
            }
        },
    },
    computed: {
        customerName() {
            return this.request.customer ? this.request.customer.name : ""
        },
        industryName() {
            if(this.request.industry) {
                return this.request.industry.name
            }
            return "";
        },
        industriesList() {
            let result = this.industries;
            if(this.request.customer) {
                const industries = this.request.customer.industries;
                if(industries[0].name) {
                    return result = industries;
                }
                return result = result.filter(item => industries.indexOf(item._id) !== -1);
            }
            return result;
        },
        deadlineClass() {
            return this.request.isDeadlineApproved ? "datepicker-custom" : "datepicker-custom request_background";
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        Datepicker,
        LabelValue,
        ValidationErrors
    },
    created() {
        this.getCustomers();
        this.getIndustries();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.request {
    padding: 20px;
    width: 67%;
    display: flex;
    flex-direction: column;
    @media (max-width: 1600px) {
        width: 70%;
    }
    &__all-info {
        padding: 20px;
        box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    }
    &__info-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        box-sizing: border-box;
        ::-webkit-input-placeholder {
            color: #68573E;
            opacity: 0.47;
        }
    }
    &__name {
        font-size: 29px;
        padding: 0 5px;
        height: 44px;
        width: 33%;
        border-radius: 5px;
        color: #68573E;
        border: 1px solid #68573E;
        outline: none;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__date {
        width: fit-content;
        position: relative;
    }
    &__check-icon {
        font-size: 18px;
        color: $light-brown;
        cursor: pointer;
        position: absolute;
        right: -24px;
        top: 4px;
        width: 18px;
    }
    &__client, &__industry, &__number {
        width: fit-content;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__client-link {
        width: 191px;
        display: flex;
        justify-content: flex-start;
    }
    &__link {
        border-bottom: 1px solid #68573E;
        cursor: pointer;
    }
    &__input-text {
        width: 151px;
        height: 28px;
        border: 1px solid #68573E;
        border-radius: 5px;
        padding: 0 5px;
        color: #68573E;
        font-size: 14px;
        outline: none;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__textarea {
        width: 43%;
        position: relative;
    }
    &__text {
        width: 100%;
        margin-top: 10px;
        border-radius: 10px;
        border: 1px solid #68573E;
        padding: 5px;
        color: #68573E;
        resize: none;
        outline: none;
        box-sizing: border-box;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__calendar-icon {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        cursor: pointer;
    }
    &__button {
        text-align: center;
        margin-top: 30px;
    }
    &_green {
        color: $green-approve;
    }
    &_no-margin {
        margin-bottom: 0;
    }
    &_right-padding-20 {
        padding-right: 20px; 
    }
    &_left-90 {
        left: 90px;
        top: 0;
    }
}

</style>
