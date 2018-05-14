<template>
    <div class='root'>
        <h2>Hello!</h2>
        <no-ssr>
        <data-tables :data="data">
            <el-table-column v-for="title in titles" :prop="title.prop" :label="title.label" :key="title.label" sortable="custom">
            </el-table-column>
        </data-tables>
        </no-ssr>
    </div>
</template>

<script>
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Datatables from "vue-data-tables";


/*Vue.use(ElementUI)
    Vue.use(DataTables)*/

export default {
  data() {
    return {
      data: [
        {
          content: "Water flood",
          flow_no: "FW201601010001",
          flow_type: "Repair",
          flow_type_code: "repair"
        },
        {
          content: "Lock broken",
          flow_no: "FW201601010002",
          flow_type: "Repair",
          flow_type_code: "repair"
        },
        {
          content: "Help to buy some drinks",
          flow_no: "FW201601010003",
          flow_type: "Help",
          flow_type_code: "help"
        },
        {
          content: "Water flood",
          flow_no: "FW201601010001",
          flow_type: "Repair",
          flow_type_code: "repair"
        },
        {
          content: "Water flood",
          flow_no: "FW201601010001",
          flow_type: "Repair",
          flow_type_code: "repair"
        }
      ],
 
      titles: [
        {
          prop: "flow_no",
          label: "NO."
        },
        {
          prop: "content",
          label: "Content"
        },
        {
          prop: "flow_type",
          label: "Type"
        }
      ]
    };
  },
  methods: {},
  mounted() {},
  components: {
      'data-tables': Datatables,
      ElementUI
  }
};
</script>

<style>

</style>
