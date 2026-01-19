const loginRouter = require('./login')
const homeRouter = require('./home')
const rolesRouter = require('./roles')
const friendsRouter = require('./friends')
const postRouter = require('./post')
const mediaRouter = require('./media');
const messengerRouter = require('./messenger')

function router(app){
    app.use('/', loginRouter);

    app.use('/home', homeRouter);
    
    app.use('/roles', rolesRouter);

    app.use('/friends', friendsRouter);

    app.use('/news', postRouter);

    app.use('/media', mediaRouter);

    app.use('/messenger', messengerRouter);


}

module.exports = router;