const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {

  app.get('/change-password', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassPage);
  app.post('/change-password', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/home', mid.requiresLogin, controllers.Status.home);
  // create status
  app.post('/home', mid.requiresLogin, controllers.Status.makeStatus);

  // i dont think i need these but it gets mad when they arent here
  app.get('/maker', mid.requiresLogin, controllers.Status.home);
  app.post('/maker', mid.requiresLogin, controllers.Status.makeStatus);

  app.get('/app', mid.requiresLogin, controllers.Status.home);
  app.post('/app', mid.requiresLogin, controllers.Status.makeStatus);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  

  // get current user status
  app.get('/get-current-status', mid.requiresSecure, mid.requiresLogin, controllers.Status.getCurrentUserStatus);
  // get all user statuses
  app.get('/get-user-statuses', mid.requiresSecure, mid.requiresLogin, controllers.Status.getUserStatuses);

  // get a bubble
  app.get('/get-bubbles', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.getBubbles);

  // create / join bubble
  app.get('/join-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.joinPage);
  app.get('/create-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.joinPage);
  app.post('/join-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.joinBubble);
  app.post('/create-bubble', mid.requiresSecure, mid.requiresLogin, controllers.Bubble.createBubble);
  
};

module.exports = router;
