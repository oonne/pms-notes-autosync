const fs = require('fs');
const https = require('https');
let gulp = require('gulp');
let config = require('./config/index');

// download
gulp.task('download', function () {
  let options = {
    hostname: config.apiUrl,
    port: 443,
    path: '/note/index',
    method: 'GET',
    headers: {
      'X-Auth-Token': config.token,
      'Content-Type': 'application/json; charset=UTF-8',
    },
  };
  let resBuff = Buffer.alloc(0);
  let req = https.request(options, (res) => {
    res.on('data', (buff) => {
      resBuff = Buffer.concat([resBuff, buff]);

    });
    res.on('end', () => {
      let notes = JSON.parse(resBuff.toString()).Data;
      config.list.map((item)=>{
        let note = notes.find((content)=>content.uNoteID == item.id);
        if (note) {
          fs.writeFileSync(`./notes/${item.name}.txt`, note.tNoteContent); 
        }
      })
    });
  });
  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
});

// update
let update = (note, event) => {
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
    path: '/note/update',
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
    let timeStep = new Date();
    console.error(`${sNoteTitle} 同步失败 ${timeStep}`);
    console.error(e);
  });
  req.write(postData);
  req.end();
}

gulp.task('watch', ['download'], function () {
    let list = config.list;
    list.map((note)=>{
      gulp.watch(`./notes/${note.name}.txt`, update.bind(this, note));
    })
});