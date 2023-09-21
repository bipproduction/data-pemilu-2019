const { PrismaClient } = require('@prisma/client')
const json_tsv = require('../bin/json_tsv')
const prisma = new PrismaClient()
const fs = require('fs')

module.exports = async function () {
    const data = await prisma.prov.findMany()
    const hasil = json_tsv(data)
    fs.writeFileSync('./output/province.tsv', hasil, "utf-8")
    console.log("SUCCESS!")
}