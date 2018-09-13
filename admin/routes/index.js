const router = require('express').Router();
const { requiresLogin } = require('../middleware/middleware');

const apiRouter = require('./api');
const admin = require('./admin');
const vendorRouter = require('./vendor');
const portalRouter = require('./portal');
const industryRouter = require('./industry');
const serviceRouter = require('./service');
const xtmRouter = require('./xtm');
const clientsapiRouter = require('./clientsapi');
const vendorsapiRouter = require('./vendorsapi');

router.use('/', admin);
router.use('/api', apiRouter);
router.use('/vendor', vendorRouter);
router.use('/portal', portalRouter);
router.use('/industry', industryRouter);
router.use('/service', serviceRouter);
router.use('/xtm', xtmRouter);
router.use('/clientsapi', requiresLogin, clientsapiRouter);
router.use('/vendorsapi', requiresLogin, vendorsapiRouter);


module.exports = router;