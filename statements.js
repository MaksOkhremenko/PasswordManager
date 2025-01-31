
class Statement {
  constructor(db)
  {
    try
    {

      this.LoginUser = db.prepare(
        'SELECT hash, salt FROM users WHERE uid = ?'
      );
      this.AddUser = db.prepare(
        'INSERT INTO users (uid, salt, hash) VALUES (?, ?, ?)'
      );


      this.EditUser = db.prepare(
        'UPDATE users SET uid = ?, salt = ?, hash = ? WHERE uid = ?'
      );


      this.DeleteUser = db.prepare(
        'DELETE FROM users WHERE uid = ?'
      );


      this.CheckRecord = db.prepare(
        'SELECT * FROM records WHERE uid = ? AND username = ? AND platform = ?'
      );


      this.AddRecord = db.prepare(
        'INSERT INTO records (uid, username, platform, password) VALUES (?, ?, ?, ?)'
      );


      this.EditRecord = db.prepare(
        'UPDATE records SET uid = ?, username = ?, platform = ?, password = ? WHERE uid = ? AND username = ? AND platform = ?'
      );


      this.ReadRecord = db.prepare(
        'SELECT username, platform, password FROM records WHERE uid = ?'
      );

      this.DeleteRecord = db.prepare(
        'DELETE FROM records WHERE uid = ? AND username = ? AND platform = ?'
      );
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}

module.exports = Statement;