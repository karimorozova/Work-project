<template>
    <div class='root'>
        <h2>Hello!</h2>
        <no-ssr>
        <data-tables :data="data">
            <el-table-column v-for="title in titles" :prop="title.prop" :label="title.label" :key="title.label" sortable="custom">
            </el-table-column>
        </data-tables>
        </no-ssr>
        <div class="emailForm">
          <table>
            <thead>
              <td colspan="2" class="header">CONTACT DETAILS</td>
            </thead>
            <tbody>
              <tr>
                <td class="title">
                  Name:
                </td>
                <td>
                  request.contactName
                </td>
              </tr>
              <tr>
                <td class="title">
                  Company Name:
                </td>
                <td>
                  request.companyName
                </td>
              </tr><tr>
                <td class="title">
                  Email:
                </td>
                <td>
                  request.contactEmail
                </td>
              </tr><tr>
                <td class="title">
                  Website:
                </td>
                <td>
                  request.web
                </td>
              </tr><tr>
                <td class="title">
                  Phone Number:
                </td>
                <td>
                  request.phone
                </td>
              </tr><tr>
                <td class="title">
                  Skype:
                </td>
                <td>
                  request.skype
                </td>
              </tr>
              <tr>
                <td colspan="2" class="header">PROJECT DETAILS</td>
              </tr>
              <tr>
                <td class="title">Service Type:</td>
                <td>request.service.title</td>
              </tr>
              <tr>
                <td class="title">Source Language:</td>
                <td>request.sourceLanguage.lang</td>
              </tr>
              <tr>
                <td class="title">Target Languages:</td>
                <td></td>
              </tr>
              <tr>
                <td class="title">Industry</td>
                <td>request.industry</td>
              </tr>
              <tr>
                <td class="title">Reference Files:</td>
                <td></td>
              </tr>
              <tr>
                <td> class="title"Files:</td>
                <td></td>
              </tr>
              <tr>
                <td class="title">Brief:</td>
                <td>request.brief</td>
              </tr>
              <tr>
                <td class="title">Deadline:</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="xtm">XTM Test</button>
    </div>
</template>

<script>
// import ElementUI from "element-ui";
// import "element-ui/lib/theme-chalk/index.css";
// import Datatables from "vue-data-tables";

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
  methods: {
    async xtm() {
      await this.$axios({
        method: 'POST',
        url: 'https://www.xtm-cloud.com/rest-api/projects',
        withCredentials: true,
        headers: {
          "Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHsEhNZLn0NBL81J2rJA6g5RknA6yOC0LRCDWhLDP9OWaTl+GM7dPQX7Z5zqRgx2Y/A==",
        },
        "Content-Type": "multipart/form-data"
      }).then(res => {
        consol.log(res)
      }).catch(err => console.log(err))
    }
  },
  mounted() {},
  components: {
      // 'data-tables': Datatables,
      // ElementUI
  }
};
</script>

<style>
  table {
    border: 2px solid #66563D;
    border-collapse: collapse;
    font-size: 14px;
    width: 400px;
    color: #66563D;
  }

  .header {
    border: 2px solid #66563D;
    background-color: #F8D260;
    font-size: 15px;
    text-align: center;
  }

  td {
    border: 0.8px solid rgba(102, 86, 61, 0.51);
    padding: 8px;
    width: 50%;
  }

  .title {
    font-weight: bold;
    border-right: 2px solid rgba(102, 86, 61, 0.51);
  }

</style>

