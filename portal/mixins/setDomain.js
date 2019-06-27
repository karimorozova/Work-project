export default {
    data() {
        return {
            domain: "https://admin.pangea.global"
        }
    },
    mounted() {
        this.domain = process.env.domain
    }
}