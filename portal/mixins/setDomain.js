export default {
    data() {
        return {
            domain: "https://admin2.pangea.global"
        }
    },
    mounted() {
        this.domain = process.env.domain
    }
}