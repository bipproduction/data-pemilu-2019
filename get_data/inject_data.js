const { execSync } = require('child_process')
module.exports = function () {
    execSync('mysql -u bip -p data_pemilu < data_pemilu.sql', { stdio: "inherit" })
    console.log("SUCCESS")
}