
const path = require("path");
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

    checkRoutes(req, res, next) {
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
            '/pm-create-project',
            '/pm-projects',
            '/pm-project-details',
            '/finance',
            '/reports',
            '/translation-request'
        ]
        for(let route of routesArray) {
            let length = route.length;
            if(req.originalUrl.slice(0, length) === route) {
                res.sendFile(path.resolve('./dist/index.html'));
                return;
            }
        }
        next();
    }
}

module.exports = middleware;