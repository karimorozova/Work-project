export default {
    methods: {
        setLimit(e) {
            if(e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0,4);
            }
        },
        removeNonDigit(e) {
            const forbiddenKeys = [69, 107, 109, 110, 188, 190];
            if(forbiddenKeys.indexOf(e.which) !== -1) {
                e.preventDefault();
            }
        }
    }
}