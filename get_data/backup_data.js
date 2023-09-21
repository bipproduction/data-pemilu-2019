const { execSync } = require('child_process')
module.exports = function () {
    execSync('mysqldump -u bip -p data_pemilu > data_pemilu.sql', { stdio: "inherit" })
    console.log("success")
    console.log("data_pemilu.sql")
}