const _ = require('lodash')
const getData = require('./get_data')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


async function getDataProvince(page) {
    console.log("get data province".yellow)
    const data = await getData(page);

    for (let itm in data) {
        if (!data[itm].name.includes("+")) {
            const id = +itm + 1

            await prisma.prov.upsert({
                where: { id: id },
                update: {
                    name: data[itm].name
                },
                create: {
                    id: id,
                    name: data[itm].name,
                    value1: data[itm].value1,
                    value2: data[itm].value2
                },
            })
        }

    }

    console.log("cuccess".green)
}

module.exports = getDataProvince