const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const prisma = new PrismaClient()
require('colors');

async function mainGetDataKabupaten() {
    await prisma.pointer.deleteMany({
        where: {
            id: 1
        }
    })

    const page = await getPage();
    getDataKabupaten(page)
}
async function getDataKabupaten(page) {

    const pointer = await prisma.pointer.findUnique({ where: { id: 1 } })
    let pointerProv = pointer ? pointer.pointerProv : 0

    const prov = await prisma.prov.findMany();
    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 3000))

    const [button] = await page.$x(`//button[contains(., '${prov[pointerProv].name}')]`);

    if (button) {
        console.log("PROVINSI".gray, `${prov[pointerProv].name}`.cyan)
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 5000))
        const data = await getData(page);

        let urutan = 0
        for (let itm of data) {
            const kabPro = ("" + prov[pointerProv].id + "" + pointerProv + "" + urutan)
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
                    provId: prov[pointerProv].id,
                }
            })
            console.log(`save ${itm.name}`.gray)
            urutan++
        }

        if (pointerProv < prov.length - 1) {
            pointerProv++
            await prisma.pointer.upsert({
                where: {
                    id: 1
                },
                update: {
                    pointerProv: pointerProv
                },
                create: {
                    id: 1,
                    pointerProv: pointerProv
                }
            })
            return await getDataKabupaten(page)
        }
    } else {
        console.log("error button not found".red)
    }

}

module.exports = mainGetDataKabupaten