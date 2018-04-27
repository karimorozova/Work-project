const router = require('express').Router();

router.get('/', (req, res) => {
    res.send("vendor");
});

router.get('/vendorJobs', async (req, res) => {
    const email = req.query.email;
    axios({
        url: `https://pangea.s.xtrf.eu/home-api/browser/?viewId=880&q.provider.emailAddress=eq(${email})`,
        method: 'GET',
        headers: {
            'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj',
        }
    }).then(function (response) {
        res.send(response.data);
    }).catch(function (err) {
        res.send(err);
    });

});
module.exports = router;