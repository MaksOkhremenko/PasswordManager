
require('dotenv').config();

const Password = require('./crypto-scheme');

const { db } = require('./database');

const PrepStatement = new (require('./statements'))(db);

let SESSION_KEY = Buffer.from(process.env.SESSION_KEY);

const Handler = {

  AddUser : async function(req,res) {

    if(req.session.user) return res.renderHtml("You're still logged in",'view','Log-out first');

    let { uid, psw1, psw2 } = req.body;

    if(psw1!==psw2) {
      res.code(400);
      return res.renderHtml("The password you enter did not match",'register','Go back to register');
    } else if(psw1.length < 8) {
      res.code(400);
      return res.renderHtml("The password you enter is too short",'register','Go back to register');
    } else {
      try {
        let { salt, hash } = await Password.Hash(psw1);

        let result = PrepStatement.AddUser.run(uid,salt,hash);
        res.code(200);
        return res.renderHtml("Акаунт успішно створено!",'увійти','Увійти зараз');
      } catch (err) {
        if(err.code==='SQLITE_CONSTRAINT_PRIMARYKEY') {
          res.code(400);
          return res.renderHtml("That username is already taken",'register','Go back to register');
        }
        res.code(412);
        return res.renderHtml('Opps!, Something went wrong...','register','Go back to register');
      }
    }
  },

  LoginUser: async function(req,res) {

    if(req.session.user) return res.renderHtml("You're already logged in",'view','Continue');

    let { uid, psw } = req.body;
    try {
      let result = [];
      for(let row of PrepStatement.LoginUser.iterate(uid)){
        result.push(row);
      }

      if(result.length !== 1) {
        res.code(401);
        return res.renderHtml('Incorrect username or password','login','Go Back to Log-in');
      }

      let Authentic = await Password.Compare(psw,result[0].hash);
      if(!Authentic) {
        res.code(401);
        return res.renderHtml('Incorrect username or password','login','Go Back to Log-in');
      }
      
     
      req.session.user = uid;
      let ukey = Password.GenKey(psw).toString('base64');
      req.session.ukey = Password.Encrypt(SESSION_KEY,ukey);
      return res.redirect('/view');
      
    } catch (err) {
      res.code(412);
      return res.renderHtml('Opps!, Something went wrong...','login','Go Back to Log-in');
    }
  },

  ViewRecords: async function(req,res) {
    if(req.session.user) {
      let uid = req.session.user;
      let ukeyBuffer = Buffer.from(Password.Decrypt(SESSION_KEY,req.session.ukey),'base64');

      let result = [];
      for(let row of PrepStatement.ReadRecord.iterate(uid)) {
        row.password = Password.Decrypt(ukeyBuffer,row.password);
        result.push(row);
      }

      return result;
    } else {
      return res.code(403).redirect('/login');
    }
  },

  AddRecord: async function(req,res) {

    if(req.session.user) {

      let uid = req.session.user;
      let {username, platform, pass1, pass2} = req.body;

      // check password if equal
      if(pass1 !== pass2) {
        res.code(405);
        return res.renderHtml("The password you enter did not match",'view','Go Back');
      }

      let results = [];
      for(let row of PrepStatement.CheckRecord.iterate(uid,username,platform)){
        results.push(row);
      }

      if(results.length!==0) {
        res.code(405);
        return res.renderHtml("That username is already in use for that platform",'view','Go Back');
      }

      
      let ukeyBuffer = Buffer.from(Password.Decrypt(SESSION_KEY,req.session.ukey),'base64');
      let EncryptedPassword = Password.Encrypt(ukeyBuffer,pass1);
      PrepStatement.AddRecord.run(uid,username,platform,EncryptedPassword);

      
      return res.redirect('/view');
    } else {
      res.code(403);
      return res.renderHtml("You're not logged in!",'login','Go Back to Log-in');
    }
  },

  RemoveRecords: async function(req,res) {
    if(req.session.user) {
      let deletedRecords = 0;

      for(let i=0; i<req.body.length; ++i) {
        let DeleteResult = PrepStatement.DeleteRecord.run(
          req.session.user,
          req.body[i].username,
          req.body[i].platform
        );
        deletedRecords += DeleteResult.changes;
      }

      return (deletedRecords) ? true : false;
      
    } else {
      return false;
    }
  }
}

module.exports = Handler;