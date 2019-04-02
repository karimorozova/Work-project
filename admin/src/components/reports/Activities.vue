<template lang="pug">
    .activities
        .activities__title Chosen range Avg: {{ rangeAverages.percent }}% {{ rangeAverages.grade }}
        .activities__date-range
            DateRange(@getFilteredReports="getFilteredReports")
        .activities__table
            DataTable(
                :fields="fields"
                :tableData="tableData"
                bodyClass="reports__table"
            )
                span.activities__header(slot="headerDate" slot-scope="{ field }")
                span.activities__header(slot="headerLeads" slot-scope="{ field }") New Leads
                    span.activities__standard {{ standard.leads }}
                span.activities__header(slot="headerCalls" slot-scope="{ field }") Calls
                    span.activities__standard {{ standard.calls }}
                span.activities__header(slot="headerComm" slot-scope="{ field }") Comm
                    span.activities__standard {{ standard.communications }}
                span.activities__header(slot="headerMeeting" slot-scope="{ field }") Meeting Setup
                    span.activities__standard {{ standard.meetings }}
                span.activities__header.activities_flex-end(slot="headerNotes" slot-scope="{ field }") Notes
                .activities__data.activities_space-around(slot="date" slot-scope="{ row }") 
                    span.activities__data-item {{ formattedDate(row.date) }}
                    span.activities__data-item.activities_orange {{ row.grade }}
                    span.activities__data-item.activities_orange {{ row.percent }}
                        span.activities__percent(v-if="row.percent") %
                .activities__data(slot="leads" slot-scope="{ row }") {{ row.leads}}
                .activities__data(slot="calls" slot-scope="{ row }") {{ row.calls }}
                .activities__data(slot="comm" slot-scope="{ row }") {{ row.communications }}
                .activities__data(slot="meeting" slot-scope="{ row }") {{ row.meetings }}
                .activities__data(slot="notes" slot-scope="{ row }") {{ row.notes }}
        .activities__tokens
            .activities__item
                .activities__button
                    Button(v-if="isTokenExpired" value="Generate tokens" @clicked="generateTokens")
</template>

<script>
import DataTable from "../DataTable";
import DateRange from "./DateRange";
import Button from "../Button";
import moment from "moment";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerDate", key: "date", width: "22%", padding: "0"},
                {label: "", headerKey: "headerLeads", key: "leads", width: "13%", padding: "0"},
                {label: "", headerKey: "headerCalls", key: "calls", width: "13%", padding: "0"},
                {label: "", headerKey: "headerComm", key: "comm", width: "13%", padding: "0"},
                {label: "", headerKey: "headerMeeting", key: "meeting", width: "13%", padding: "0"},
                {label: "", headerKey: "headerNotes", key: "notes", width: "26%", padding: "0"}
            ],
            tableData: [],
            today: new Date(),
            standard: {leads: 30, calls: 30, communications: 50, meetings: 1},
            code: "",
            isInputVisible: false,
            grades: {
                "F": {min: 0, max: 59},
                "D": {min: 60, max: 69},
                "C": {min: 70, max: 76},
                "C+": {min: 77, max: 79},
                "B-": {min: 80, max: 82},
                "B": {min: 83, max: 86},
                "B+": {min: 87, max: 89},
                "A-": {min: 90, max: 92},
                "A": {min: 93, max: 96},
                "A+": {min: 97, max: 100}
            },
            isTokenExpired: false
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        async getFilteredReports({fromDate, toDate}) {
            try {
                await this.getReports(fromDate, toDate);
            } catch(err) {

            }
        },
        async getReports(fromDate, toDate) {
            try {
                const result = await this.$http.get(`/api/zoho-reports?from=${fromDate}&to=${toDate}`);
                this.tableData = result.data;
            } catch(err) {
                this.alertToggle({message: err.data, isShow: true, type: "error"});
            }
        },
        async generateTokens() {
            try {
                const creds = await this.$http.get("/zoho/creds");
                const { client_id, redirect_uri } = creds.body;
                window.location = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${client_id}&response_type=code&access_type=offline&redirect_uri=${redirect_uri}`;
                // window.open(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${client_id}&response_type=code&access_type=offline&redirect_uri=${redirect_uri}`, '_blank')
                this.isInputVisible = true;
            } catch(err) {
                this.alertToggle({message: err.data, isShow: true, type: "error"})
            }
        },
        async getZohoCrmData() {
            try {
                const result = await this.$http.get('/zoho/crm-records?user=Amelia%20Lotter');
            } catch(err) {
                if (err.status === 401) this.isTokenExpired = true;
                this.alertToggle({message: err.data, isShow: true, type: "error"});
            } finally {
                await this.getReports("", "");
            }
        },
        getCurrentMonth() {
            return moment(this.today).format("MMMM");
        },
        formattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
        },
        gradeLetter(percent) {
            let result = "F";
            Object.keys(this.grades).forEach(key => {
                if(Math.round(percent) >= this.grades[key].min && percent <= this.grades[key].max) {
                    result = key;
                }
            })
            if(percent > 100) {
                result = "A+"
            }
            return result;
        }
    },
    computed: {
        rangeAverages() {
            let result = {grade: "", percent: 0, leads: 0, calls: 0, communications: 0, meetings: 0};
            if(this.tableData.length) {
                for(let row of this.tableData) {
                    result.percent += +row.percent;
                }
                result.percent = Math.round(result.percent /this.tableData.length);
                result.grade = this.gradeLetter(result.percent);
            }
            return result;
        }
    },
    components: {
        DataTable,
        Button,
        DateRange
    },
    mounted() {
        this.getZohoCrmData();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.activities {
    margin-top: 40px;
    &__title {
        font-size: 21px;
        font-weight: 700;
        margin-bottom: 40px;
    }
    &__table {
        width: 1024px;
        padding: 10px;
        margin-top: 40px;
        box-sizing: border-box;
        box-shadow: 0 0 10px $brown-shadow;
    }
    &__header, &__data {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &__header {
        font-weight: 600;
        height: 40px;
        flex-direction: column;
        justify-content: space-between;
    }
    &__data-item {
        display: flex;
        justify-content: center;
        width: 20%;
        &:first-child {
            width: 45%;
        }
    }
    &__tokens {
        margin-top: 10px;
    }
    &__item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    }
    &__button {
        margin-right: 10px;
    }
    &__input {
        border: 1px solid $light-brown;
        border-radius: 5px;
        box-sizing: border-box;
        padding: 2px 5px;
        width: 400px;
        outline: none;
        color: $main-color;
    }
    &_flex-end {
        justify-content: flex-end;
    }
    &_space-around {
        justify-content: space-around;
    }
    &_orange {
        color: $orange;
    }
}
</style>
