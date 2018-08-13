<template lang="pug">
    .details-table
        table
            thead
                tr
                    th 
                        .head-title
                            span Full Name
                            img(src="../../assets/images/white-arrow.png")
                    th
                        .head-title
                            span Email
                            img(src="../../assets/images/white-arrow.png")
                    th
                        .head-title
                            span Position
                            img(src="../../assets/images/white-arrow.png")
                    th
                        .head-title
                            span Notes
                            img(src="../../assets/images/white-arrow.png")
                    th
                        .head-title
                            span Lead Contact
                            img(src="../../assets/images/white-arrow.png")                    
                    th
            tbody
                tr(v-for="(contact, ind) in contacts" @click="contactDetails(ind)")  
                    td(:class="{editing: !contact.icons[0].active}") 
                        input.contact-info(type="text" :readonly="contact.icons[0].active" v-model="contact.fullName")
                    td(:class="{editing: !contact.icons[0].active}") 
                        input.contact-info(type="text" :readonly="contact.icons[0].active" v-model="contact.email")
                    td(:class="{editing: !contact.icons[0].active}") 
                        input.contact-info(type="text" :readonly="contact.icons[0].active" v-model="contact.position")
                    td(:class="{editing: !contact.icons[0].active}") 
                        input.contact-info(type="text" :readonly="contact.icons[0].active" v-model="contact.notes")
                    td(:class="{editing: !contact.icons[0].active}") 
                        .outer-check(@click="chooseLead(ind)")
                            .inner-check(type="radio" :class="{checked: contact.leadContact}")
                    td
                        .crud-icons
                            img(v-for="(but, i) in contact.icons" :src='but.icon' :class="{'not-active': !but.active}" @click="action(ind, i)")

</template>

<script>
export default {
    data() {
        return {
            contacts: [
                {fullName: 'name1', email: 'email123@em.ail', position: 'Manager1', notes: '', leadContact: true, icons: [
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}    
                ]},
                {fullName: 'name2', email: 'email456@em.ail', position: 'Manager2', notes: '', leadContact: false, icons: [
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}    
                ]}
            ]
        }
    },
    methods: {
        chooseLead(ind) {
            if(!this.contacts[ind].icons[0].active) {
                for(let cont of this.contacts) {
                    cont.leadContact = false;
                }
                this.contacts[ind].leadContact = true;
            }
        },
        action(ind, i) {
            if(i == 0) {
                for(let cont of this.contacts) {
                    cont.icons[i].active = true;
                }
                this.contacts[ind].icons[i].active = false;
            }
            if(i == 1) {
                this.contacts.splice(ind, 1);
            }
        },
        contactDetails(ind) {
            if(this.contacts[ind].icons[0].active) {
                this.$emit('contactDetails', this.contacts[ind]);
            }
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
            background-color: #968A7E;
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
        width: 150px;
    }
}
th {
    border-right: 1px solid #FFF;
    padding: 5px 1px;
    &:last-child {
        border-right: none;
        width: 117px
    }
    &:first-child {
        padding-left: 0;
    }
}
td {
    border-right: 1px solid #67573E;
    border-bottom: 1px solid #67573E;
    &:last-child {
        width: 102px;
        border-right: none;
    }
    &:first-child {
        padding-right: 0;
    }
    &:nth-of-type(2), &:nth-of-type(3) {
        .contact-info {
            width: 140px;
        }
    }
    input {
        color: #67573E;
    }
}
tr {
    &:last-child {
        td {
            border-bottom: none;
        }
    }
}
.head-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
}

.contact-info {
    border: none;
    outline: none;
    width: 109px;
    margin: 2px;
    padding: 3px 0 3px 5px;
}

.editing {
    box-shadow: inset 0 0 8px rgba(103, 87, 62, 0.75);
}

.outer-check {
    margin: 0 auto;
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 1px solid #67573E;
    cursor: pointer;
    .inner-check {
        width: 68%;
        height: 68%;
        border-radius: 50%;
        background-color: #FFF;
    }
    .checked {
        background-color: #67573E;
    }
}

.crud-icons {
    display: flex;
    align-items: center;
    justify-content: space-around;
    img {
        cursor: pointer;
    }
}

.not-active {
    opacity: 0.5;
}
</style>
