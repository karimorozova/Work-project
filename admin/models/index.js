const Languages = require('./languages');
const Requests = require('./requests');
const Projects = require('./projects');
const User = require('./user');
const Services = require('./services');
const Reports = require('./reports');
const Industries = require('./industries');
const Pricelist = require('./pricelist');
const Duorate = require('./duorates');
const Monorate = require('./monorates');
const Timezones = require('./timezones');
const Clients = require('./clients');
const Vendors = require('./vendors');
const LeadSource = require('./leadSource');
const Group = require('./group');
const Step = require('./step');
const Package = require('./packages');
const Zoho = require('./zoho');
const ZohoReport = require('./zohoReport');
const ClientRequest = require('./clientRequest');
const Instruction = require('./instruction')
const CancelReason = require('./cancelReason')
const DiscountChart = require('./discountChart')

const Models = {
    Languages,
    Requests,
    Projects,
    User,
    Services,
    Reports,
    Industries,
    Pricelist,
    Duorate,
    Monorate,
    Timezones,
    LeadSource,
    Group,
    Step,
    Package,
    Clients,
    Vendors,
    Zoho,
    ZohoReport,
    ClientRequest,
    Instruction,
    CancelReason,
    DiscountChart
};

module.exports = Models;