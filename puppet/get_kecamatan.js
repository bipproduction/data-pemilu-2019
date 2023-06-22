const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const prisma = new PrismaClient()
require('colors')


let pointerProv = 0
let pointerKab = 0
async function getKecamatan() {
    const prov = await prisma.prov.findMany();
    const page = await getPage();

    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 3000))

    const [buttonProv] = await page.$x(`//button[contains(., '${prov[pointerProv].name}')]`);
    if (buttonProv) {
        await buttonProv.click();
        await new Promise(resolve => setTimeout(resolve, 1000))
        const dataKab = await prisma.kab.findMany({
            where: {
                provId: prov[pointerProv].id
            }
        })

        const [buttonKab] = await page.$x(`//button[contains(., '${dataKab[pointerKab].name}')]`);
        if (buttonKab) {
            await buttonKab.click();
            await new Promise(resolve => setTimeout(resolve, 1000))
            const data = await getData(page);

            let urutan = 0
            for (let itm of data) {
                const kecKab = ("" + dataKab[pointerKab].id + "" + pointerKab + "" + urutan)
                await prisma.kec.upsert({
                    where: {
                        kecKab: kecKab
                    },
                    update: {
                        name: itm.name
                    },
                    create: {
                        kecKab: kecKab,
                        name: itm.name,
                        value1: itm.value1,
                        value2: itm.value2,
                        kabId: dataKab[pointerKab].id,
                    }
                })
                console.log(`save ${itm.name}`.gray)
                urutan++
            }

            if (pointerKab < dataKab.length - 1) {
                pointerKab++
                return await getKecamatan()
            } else {
                pointerKab = 0
                return await getKecamatan()
            }

        }

        // let urutan = 0
        // for (let itm of dataKab) {



        //     urutan++
        // }

        if (pointerProv < prov.length - 1) {
            pointerProv++
            return await getKecamatan()
        }
    } else {
        console.log("error button not found".red)
    }

}

getKecamatan();
module.exports = getKecamatan