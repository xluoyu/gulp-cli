let exec = require('child_process').exec;
const chalk = require('chalk')
const fs = require('fs')
let sshIp = 'root@000.000.0.000'
let deployPath = '/data/xxxx/'

function cmd(cmd, { json = true } = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        if (json) {
          resolve(JSON.parse(stdout));
        } else {
          resolve(stdout);
        }
      }
    })
  })
}

console.log(chalk.blue(`部署至 ${sshIp}:${deployPath}`))

cmd('tar -zcvf online.tar.gz -C ./dist .', { json: false })
  .then(res => cmd(`scp online.tar.gz ${sshIp}:${deployPath}`, { json: false }))
  .then(res => cmd(`ssh ${sshIp} "cd ${deployPath}; sudo tar -zxvf online.tar.gz && rm -rf online.tar.gz ;"`, { json: false }))
  .then(res => console.log(chalk.green('部署成功')))
  .catch(err => console.error(err))
