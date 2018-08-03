<template lang="pug">
    .details-table
        table
            thead
                tr
                    th 
                        span.header Full Name
                    th
                        span.header Email
                    th
                        span.header Position
                    th
                        span.header Notes
                    th
                        span.header Lead Contact
                    th
            tbody
                tr(v-for="contact in contacts")  
                    td {{ contact.fullName }}
                    td {{ contact.email }}
                    td {{ contact.position }}
                    td {{ contact.notes }}
                    td 
                        input(type="radio" :checked="contact.leadContact")
                    td
                        img(v-for="but in actionButtons" :src='but.icon' :class="{'not-active': !but.active}")

</template>

<script>
export default {
    data() {
        return {
            contacts: [
                {fullName: 'name1', email: 'email123@em.ail', position: 'Manager1', notes: '', leadContact: true},
                {fullName: 'name2', email: 'email456@em.ail', position: 'Manager2', notes: '', leadContact: false}
            ],
            actionButtons: [
                {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>

.details-table {
    font-size: 14px;
    font-weight: normal;
    table {
        width: 100%;
        border: 1px solid #67573E;
        border-collapse: collapse;
        thead {
            background-color: #67573E;
            color: #FFF;
        }
    }
}
thead, tbody {
    width: 100%;
    display: block;
}
tbody {
    overflow-y: scroll;
}
th, td {
    width: 122px;
    &:nth-of-type(2), &:nth-of-type(3) {
        width: 140px;
    }
}
th {
    border-right: 1px solid #FFF;
    border-bottom: 1px solid #FFF;
    &:last-child {
        border-right: none;
        width: 137px
    }
}
td {
    border-right: 1px solid #67573E;
    border-bottom: 1px solid #67573E;
    &:last-child {
        // width: 122px;
        border-right: none;
    }
}
.not-active {
    opacity: 0.5;
}
</style>
