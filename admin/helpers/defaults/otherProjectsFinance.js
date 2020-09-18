const { MemoqProject, Clients, Vendors } = require('../../models');

const getProjectInfo = async () => {
  const projects = await MemoqProject.find();
  for (let project of projects) {
    const { client: clientName, documents: tasks } = project;
    const client = await Clients.findOne({ name: clientName });
    if (client) {
      // const {  }
    }
  }
};
