const yargs = require('yargs')
require('colors')
const _ = require('lodash');
const mainGetDataProvince = require('./get_data_province');
const mainGetDataKabupaten = require('./get_data_kabupaten');
const mainGetDataKecamatan = require('./get_data_kecamatan');
const mainGetDataKelurahan = require('./get_data_kelurahan');

const menu = yargs
    .option("prv", {
        desc: "Provinsi",
        type: "boolean"
    })
    .option("kab", {
        desc: "Kabupaten",
        type: "boolean"
    })
    .option("kec", {
        desc: "Kecamatan",
        type: "boolean"
    })
    .option("kel", {
        desc: "Kelurahan",
        type: "boolean"
    })
    .strict(true)
    .epilog("Malikkurosaki@2023 - github.com/malikkurosaki")
    .argv;

if (_.keys(menu).length === 2) return console.log(`${menu.$0} -h | --help - for help`.red)

if (menu.prv) return mainGetDataProvince()
if (menu.kab) return mainGetDataKabupaten()
if (menu.kec) return mainGetDataKecamatan()
if (menu.kel) return mainGetDataKelurahan()

