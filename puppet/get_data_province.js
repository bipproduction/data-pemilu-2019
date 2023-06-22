const _ = require('lodash')
const getData = require('./get_data')
const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page')
const prisma = new PrismaClient();
require('colors');

async function mainGetDataProvince() {
    console.log("get data province".yellow)
    const page = await getPage();
    await getDataProvince(page);
}

async function getDataProvince(page) {

    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 3000))

    const data = await getData(page);
    let id = 1;
    for (let itm of data) {
        await prisma.prov.upsert({
            where: { id: id },
            update: {
                name: itm.name
            },
            create: {
                id: id,
                name: itm.name,
                value1: itm.value1,
                value2: itm.value2
            },
        })
        id++
        console.log("save ".gray, `${itm.name}`.cyan)
    }

    console.log("cuccess".green)
}


module.exports = mainGetDataProvince