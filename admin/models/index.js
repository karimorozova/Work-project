const Languages = require('./languages');
const Requests = require('./requests');
const Projects = require('./projects');
const User = require('./user');
const Services = require('./services');
const Reports = require('./reports');
const Industries = require('./industries');
const Pricelist = require('./pricelist');
const Timezones = require('./timezones');
const Clients = require('./clients');
const Vendors = require('./vendors');
const LeadSource = require('./leadSource');
const Group = require('./group');
const Step = require('./step');
const Zoho = require('./zoho');
const ZohoReport = require('./zohoReport');
const ClientRequest = require('./clientRequest');
const Instruction = require('./instruction');
const CancelReason = require('./cancelReason');
const XtrfTier = require('./xtrfTier');
const XtrfReportLang = require('./xtrfReportLang');
const XtrfVendor = require('./xtrfVendor');
const XtrfLqa = require('./xtrfLqa');
const XtrfLqaGrouped = require('./xtrfLqaGrouped');
const XtrfPrice = require('./xtrfPrice');
const Delivery = require('./delivery');
const TierLqa = require('./tierLqa');
const LangTest = require('./langTest');
const MemoqProject = require('./memoqProject');
const LangTier = require('./langTier');
const Units = require('./units');
const CurrencyRatio = require('./currencyRatio');
const OverallView = require('./dashboardOverall');
const SalesPerformance = require('./dashboardSalesPerformance');
const Discounts = require('./discounts');
const GmailProjectsStatuses = require('./gmailProjectsStatuses');
const VendorBenchmarkCost = require('./vendorBenchmarkCost');
const TierInfo = require('./tierInfo');

const Models = {
  Languages,
  Discounts,
  Requests,
  Projects,
  User,
  Services,
  Reports,
  Industries,
  Pricelist,
  Timezones,
  LeadSource,
  Group,
  Step,
  Clients,
  Vendors,
  Zoho,
  ZohoReport,
  ClientRequest,
  Instruction,
  CancelReason,
  XtrfTier,
  XtrfReportLang,
  XtrfVendor,
  XtrfLqa,
  XtrfLqaGrouped,
  XtrfPrice,
  Delivery,
  TierLqa,
  LangTest,
  MemoqProject,
  LangTier,
  Units,
  CurrencyRatio,
  OverallView,
  SalesPerformance,
  GmailProjectsStatuses,
  VendorBenchmarkCost,
  TierInfo,
};

module.exports = Models;
