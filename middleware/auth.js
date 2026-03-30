function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).render('error', { error: 'Доступ запрещен' });
    }
    next();
}

function isStaff(req, res, next) {
    if (!req.session.user || !['admin', 'manager', 'designer'].includes(req.session.user.role)) {
        return res.status(403).render('error', { error: 'Доступ запрещен' });
    }
    next();
}

module.exports = { isAuthenticated, isAdmin, isStaff };
