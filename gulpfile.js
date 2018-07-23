const fs = require('fs');
const https = require('https');
let gulp = require('gulp');
let config = require('./config/index');

// sync
let sync = (note, event) => {
  let uNoteID = note.id;
  let sNoteTitle = note.name;
  let tNoteContent = fs.readFileSync(event.path).toString();
  let postData = JSON.stringify({
      'uNoteID' : uNoteID,
      'sNoteTitle' : sNoteTitle,
      'tNoteContent' :tNoteContent
    });

  let options = {
    hostname: config.apiUrl,
    port: 443,
    path: config.path,
    method: 'POST',
    headers: {
      'X-Auth-Token': config.token,
      'Content-Type': 'application/json; charset=UTF-8',
      'Content-Length': Buffer.byteLength(postData)
    },
  };
  let req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      if (JSON.parse(chunk).Ret == 0) {
        let timeStep = new Date();
        console.log(`${sNoteTitle} 同步成功 ${timeStep}`);
      };
    });
  });
  req.on('error', (e) => {
    console.error(e);
  });
  req.write(postData);
  req.end();
}

gulp.task('watch', function () {
    let list = config.list;
    list.map((note)=>{
      gulp.watch(`./notes/${note.name}.txt`, sync.bind(this, note));
    })
});