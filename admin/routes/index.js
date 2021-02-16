const router = require('express').Router()
const { requiresLogin } = require('../middleware')

const apiRouter = require('./api')
const reportsapi = require('./reportsapi')
const admin = require('./admin')
const vendorRouter = require('./vendors/vendor')
const pmareaRouter = require('./pmArea/pm-manage')
const pricelistsRouter = require('./pricelists/prices')
const currencyRatioRouter = require('./pricelists/currencyRatio')
const vendorApplicationRouter = require('./vendors/application')
const portalRouter = require('./portal')
const industryRouter = require('./industry')
const serviceRouter = require('./service')
const zohoRouter = require('./zoho')
const clientsapiRouter = require('./clientsapi')
const vendorsapiRouter = require('./vendorsapi')
const projectsRouter = require('./projectsapi')
const memoqapiRouter = require('./memoqapi')
const multipliers = require('./pricelists/multipliers')
const settings = require('./settings')
const dashboard = require('./dashboard')


//ADMIN
router.use('/', admin)
router.use('/api', apiRouter)
router.use('/service', serviceRouter)
router.use('/zoho', zohoRouter)
router.use('/vendors/application', vendorApplicationRouter)
router.use('/industry', industryRouter)

//ProjectQuotes Api, all routes are protected.
router.use('/projectsapi', projectsRouter)

router.use('/api-settings', requiresLogin, settings)
router.use('/dashboard', dashboard)
router.use('/reportsapi', requiresLogin, reportsapi)
router.use('/pm-manage', requiresLogin, pmareaRouter)
router.use('/prices', requiresLogin, pricelistsRouter)
router.use('/currency', requiresLogin, currencyRatioRouter)
router.use('/pricelists', requiresLogin, multipliers)
router.use('/clientsapi', requiresLogin, clientsapiRouter)
router.use('/vendorsapi', requiresLogin, vendorsapiRouter)
router.use('/memoqapi', requiresLogin, memoqapiRouter)
//ADMIN

//VENDOR
router.use('/vendor', vendorRouter)
//VENDOR

//PORTAL
router.use('/portal', portalRouter)
//PORTAL


module.exports = router
