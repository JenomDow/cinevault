function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

function isOwner(model) {
  return async function (req, res, next) {
    const doc = await model.findById(req.params.id);
    if (!doc || doc.createdBy.toString() !== req.session.user?._id) {
      return res.status(403).send('Unauthorized');
    }
    next();
  };
}

module.exports = { isLoggedIn, isOwner };
