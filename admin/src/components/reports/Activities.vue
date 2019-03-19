<template lang="pug">
    .activities
        .activities__title Daily Report
        .activities__table
            DataTable(
                :fields="topFields"
                :tableData="topTableData"
                bodyClass="table_no-bottom-margin"
                headCellClass="table_no-cell-rihgt-border"
            )
                span.activities__top-header(slot="headerMonth" slot-scope="{ field }") March
                span.activities__top-header(slot="headerLeads" slot-scope="{ field }")
                span.activities__top-header(slot="headerCalls" slot-scope="{ field }")
                span.activities__top-header(slot="headerComm" slot-scope="{ field }")
                span.activities__top-header(slot="headerMeeting" slot-scope="{ field }")
                span.activities__top-header(slot="headerNotes" slot-scope="{ field }")
                .activities__head-data(slot="month" slot-scope="{ row }") Amelia Lotter
                .activities__head-data(slot="leads" slot-scope="{ row }") New Leads
                    span.activities__standard {{ standard.leads }}
                .activities__head-data(slot="calls" slot-scope="{ row }") Calls
                    span.activities__standard {{ standard.calls }}
                .activities__head-data(slot="comm" slot-scope="{ row }") Comm
                    span.activities__standard {{ standard.communications }}
                .activities__head-data(slot="meeting" slot-scope="{ row }") Meeting Setup
                    span.activities__standard {{ standard.meetings }}
                .activities__head-data(slot="notes" slot-scope="{ row }") Notes
            DataTable(
                :fields="bottomFields"
                :tableData="bottomTableData"
                bodyClass="reports__table"
            )
                span.activities__header(slot="headerDate" slot-scope="{ field }") {{ getCurrentMonth() }}
                span.activities__header(slot="headerGrade" slot-scope="{ field }") {{ monthAverages.grade }}
                span.activities__header(slot="headerPercent" slot-scope="{ field }") {{ monthAverages.percent }}
                    span.activities__percent(v-if="monthAverages.percent") %
                span.activities__header(slot="headerLeads" slot-scope="{ field }") {{ monthAverages.leads.toFixed(2) }}
                    span.activities__percent(v-if="monthAverages.leads") %
                span.activities__header(slot="headerCalls" slot-scope="{ field }") {{ monthAverages.calls.toFixed(2) }}
                    span.activities__percent(v-if="monthAverages.calls") %
                span.activities__header(slot="headerComm" slot-scope="{ field }") {{ monthAverages.communications.toFixed(2) }}
                    span.activities__percent(v-if="monthAverages.communications") %
                span.activities__header(slot="headerMeeting" slot-scope="{ field }") {{ monthAverages.meetings.toFixed(2) }}
                    span.activities__percent(v-if="monthAverages.meetings") %
                span.activities__header(slot="headerNotes" slot-scope="{ field }")
                .activities__data(slot="date" slot-scope="{ row }") {{ formattedDate(row.date) }}
                .activities__data(slot="grade" slot-scope="{ row }") {{ row.grade }}
                .activities__data(slot="percent" slot-scope="{ row }") {{ row.percent }}
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
import Button from "../Button";
import moment from "moment";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            topFields: [
                {label: "", headerKey: "headerMonth", key: "month", width: "24%", padding: "0"},
                {label: "", headerKey: "headerLeads", key: "leads", width: "13%", padding: "0"},
                {label: "", headerKey: "headerCalls", key: "calls", width: "13%", padding: "0"},
                {label: "", headerKey: "headerComm", key: "comm", width: "13%", padding: "0"},
                {label: "", headerKey: "headerMeeting", key: "meeting", width: "13%", padding: "0"},
                {label: "", headerKey: "headerNotes", key: "notes", width: "24%", padding: "0"}
            ],
            bottomFields: [
                {label: "", headerKey: "headerDate", key: "date", width: "10%", padding: "0"},
                {label: "", headerKey: "headerGrade", key: "grade", width: "7%", padding: "0"},
                {label: "", headerKey: "headerPercent", key: "percent", width: "7%", padding: "0"},
                {label: "", headerKey: "headerLeads", key: "leads", width: "13%", padding: "0"},
                {label: "", headerKey: "headerCalls", key: "calls", width: "13%", padding: "0"},
                {label: "", headerKey: "headerComm", key: "comm", width: "13%", padding: "0"},
                {label: "", headerKey: "headerMeeting", key: "meeting", width: "13%", padding: "0"},
                {label: "", headerKey: "headerNotes", key: "notes", width: "24%", padding: "0"}
            ],
            topTableData: [{}],
            bottomTableData: [],
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
        async getReports() {
            try {
                const result = await this.$http.get('/api/zoho-reports');
                this.bottomTableData = result.data;
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
                this.alertToggle({message: err.data, isShow: true, type: "error"})
            }
        },
        getCurrentMonth() {
            return moment(this.today).format("MMMM");
        },
        formattedDate(date) {
            return moment(date).format("DD-MMM-YYYY");
        },
        gradeLetter(percent) {
            let result = "F";
            Object.keys(this.grades).forEach(key => {
                if(percent >= this.grades[key].min && percent <= this.grades[key].max) {
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
        monthAverages() {
            let result = {grade: "", percent: 0, leads: 0, calls: 0, communications: 0, meetings: 0};
            if(this.bottomTableData.length) {
                for(let row of this.bottomTableData) {
                    result.percent += +row.percent;
                    result.leads += +row.leads;
                    result.calls += +row.calls;
                    result.communications += +row.communications;
                    result.meetings += +row.meetings;
                }
                result.leads /= this.bottomTableData.length;
                result.calls /= this.bottomTableData.length;
                result.communications /= this.bottomTableData.length;
                result.meetings /= this.bottomTableData.length;
                result.percent = Math.round(result.percent /this.bottomTableData.length);
                result.grade = this.gradeLetter(result.percent);
            }
            return result;
        }
    },
    components: {
        DataTable,
        Button
    },
    mounted() {
        this.getZohoCrmData();
        this.getReports();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.activities {
    margin-top: 40px;
    &__table {
        width: 900px;
    }
    &__header, &__data, &__head-data {
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &__head-data {
        height: 54px;
        flex-direction: column;
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
}
</style>
