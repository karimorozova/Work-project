export default {
    computed: {
        tableFields() {
            const withoutLast = this.fields.slice(0, -1);
            const sumWithoutLast = withoutLast.reduce((prev, cur) => {
                prev+= cur.width;
                return prev;
            }, 0)
            return this.fields.map((field,index) => {
                if(index === this.fields.length -1) {
                    field.width = this.tableWidth - sumWithoutLast; 
                }
                field.width+= 'px';
                return field;
            })
        }
    }
}