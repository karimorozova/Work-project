<template lang="pug">
    .company
        label Company: 
        .select
            .select__selected(:class="classes('company')")
                span {{ companySelected.name }}
                .icon(@click="showCompanies")
                    i.fa.fa-caret-down
            input.search(v-if="droppedCompanies" type="text" v-model="search" placeholder="Search")                
            .drop(v-if="droppedCompanies")
                span.drop_item(@click="changeCompany(compIndex)" v-for="(company, compIndex) in companiesSearched" ) {{ company.name }}
                    
</template>

<script>
import axios from 'axios';

export default {
    props: {
        errors: {
            type: Array
        }
    },
    data () {
        return {
            companySelected: { id: 0, name: "Options"},
            droppedCompanies: false,
            search: "",
            companies: []
        }
    },
    methods: {
        classes(err) {
            for(let i = 0; i < this.errors.length; i++ ) {
                if(this.errors[i].title == err) {
                    return 'errorActive'
                }
            }
        },
        showCompanies() {
            this.droppedCompanies = !this.droppedCompanies
        },
        changeCompany(index) {
            this.companySelected = this.companiesSearched[index]
            this.$emit('companyChanged', this.companySelected)
        },
        getCustomers() {
            let homeApi = axios.create({
                baseURL: 'https://pangea.s.xtrf.eu/home-api/',
                headers: {
                    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
                }
            });
            return new Promise(resolve => {
                homeApi.get("customers").then( (response) => {
                    resolve(response.data);
                    this.companies = response.data;
                }).catch( (error) => {
                    resolve(error);
                });
            })
        }
    },
    computed: {
        companiesSearched() {
            let array = this.companies.filter(item => {
                if(item.name.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
            })
            array.sort((a, b) => {
                if(a.name > b.name) return 1
                else return -1;
            });

            return array;
        }
    },
    created() {
        this.getCustomers()
    }
}
</script>

<style>

</style>
