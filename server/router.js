const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);

  // DOMOMAKER E
  app.get('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassPage);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // create status

  // get user status

  // get a bubble

  // create / join bubble
  app.get('/join-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.joinBubblePage);
  app.post('/join-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.joinBubble);
  app.post('/create-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.createBubble);
  
  // create profile pic

  // get profile pic
};

module.exports = router;
