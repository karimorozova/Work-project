const router = require('express').Router();

const apiRouter = require('./api');
const admin = require('./admin');
const vendorRouter = require('./vendor');
const portalRouter = require('./portal');

router.use('/', admin);
router.use('/api', apiRouter);
router.use('/vendor', vendorRouter);
router.use('/portal', portalRouter);


module.exports = router;