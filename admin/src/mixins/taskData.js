export default {
    methods: {
        setLimit(e) {
            if(e.target.value.length > 2) {
                e.target.value = e.target.value.slice(0,2);
            }
            e.target.value = e.target.value > 20 ? 20 : e.target.value;
        },
        removeNonDigit(e) {
            const forbiddenKeys = [69, 107, 109, 110, 188, 190];
            if(forbiddenKeys.indexOf(e.which) !== -1) {
                e.preventDefault();
            }
        }
    }
}