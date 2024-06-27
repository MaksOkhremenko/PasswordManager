
async function routes (fastify) {

  fastify.get('/', (req,res)=>{
    res.redirect('/login');
  });

  fastify.register(async function(fastify) {

    fastify.addHook('preValidation', async function(req,res) {
      if(req.session.user) {
        return res.redirect('/view');
      }
    });

    fastify.get('/login', (req,res) => {
      res.sendFile('html/login.html');
    });
  
    fastify.get('/register', (req,res) => {
      res.sendFile('html/register.html');
    });
  });

  fastify.get('/view', (req,res) => {
    if(req.session.user) {
      res.sendFile('html/password-view.html');
    } else {
      res.redirect('/login');
    }
  });

  fastify.setNotFoundHandler((req, res) => {
    res.sendFile('html/not-found.html');
  });
}

module.exports = routes;