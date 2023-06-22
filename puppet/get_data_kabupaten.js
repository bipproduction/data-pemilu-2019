const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const prisma = new PrismaClient()
require('colors')


let pointer = 0
async function getDataKabupaten() {
    const prov = await prisma.prov.findMany();
    const page = await getPage();

    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 3000))

    const [button] = await page.$x(`//button[contains(., '${prov[pointer].name}')]`);
    if (button) {
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000))
        const data = await getData(page);

        let urutan = 0
        for (let itm of data) {
            const kabPro = ("" + prov[pointer].id + "" + pointer + "" + urutan)
            await prisma.kab.upsert({
                where: {
                    kabPro: kabPro
                },
                update: {
                    name: itm.name
                },
                create: {
                    kabPro: kabPro,
                    name: itm.name,
                    value1: itm.value1,
                    value2: itm.value2,
                    provId: prov[pointer].id,
                }
            })
            console.log(`save ${itm.name}`.gray)
            urutan++
        }

        if (pointer < prov.length - 1) {
            pointer++
            return await getDataKabupaten()
        }
    } else {
        console.log("error button not found".red)
    }

}

getDataKabupaten();
module.exports = getDataKabupaten