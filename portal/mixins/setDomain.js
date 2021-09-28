export default {
    data() {
        return {
            domain: "https://testadmin.pangea.global"
        }
    },
    mounted() {
        this.domain = process.env.domain
    }
}