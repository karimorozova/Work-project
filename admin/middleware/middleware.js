
const middleware = {
    requiresLogin(req, res, next) {
        if (req.session && req.session.userId) {
            return next();
        } else {
            const err = new Error('You must be logged in to view this page.');
            err.status = 401;
            res.status(401);
            res.send(err.message);
        }
    },

    checkRoutes(req, res, next, dir) {
        let routesArray = [
            '/register',
            '/tasks-report',
            '/login',
            '/account-info',
            '/dashboard',
            '/recruitment',
            '/vendors',
            '/languages',
            '/clients',
            '/quotes',
            '/projects',
            '/finance',
            '/reports',
            '/translation-request'
        ]
        if(routesArray.indexOf(req.originalUrl) != -1) {
            res.sendFile(dir + '/dist/index.html')
        } else {
            next();
        }
    }
}

module.exports = middleware;