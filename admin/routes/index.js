const router = require('express').Router();

const apiRouter = require('./api');
const admin = require('./admin');
const vendorRouter = require('./vendor');
const portalRouter = require('./portal');
const industryRouter = require('./industry');

router.use('/', admin);
router.use('/api', apiRouter);
router.use('/vendor', vendorRouter);
router.use('/portal', portalRouter);
router.use('/industry', industryRouter);


module.exports = router;