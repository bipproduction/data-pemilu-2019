const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const prisma = new PrismaClient()
const notifier = require('node-notifier');
const getButton = require('./get_button');
require('colors');



async function mainGetDataKabupaten() {
    await prisma.pointer.deleteMany({
        where: {
            id: 1
        }
    })

    const page = await getPage();

    notifier.notify({
        icon: 'icon.png',
        title: 'Cari Data Kabupaten',
        message: 'tunggu sampai proses selesai',
        sound: true,
    });
    getDataKabupaten(page)
}
async function getDataKabupaten(page) {

    const pointer = await prisma.pointer.findUnique({ where: { id: 1 } })
    let pointerProv = pointer ? pointer.pointerProv : 0

    const prov = await prisma.prov.findMany();
    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 5000))

    // const [button] = await page.$x(`//button[contains(., '${prov[pointerProv].name}')]`);
    // const nama = `${prov[pointerProv].name}`
    // const button = await page.evaluate((nama) => {
    //     const buttons = document.querySelectorAll('button.clear-button.text-primary.text-left');
    //     for (let i = 0; i < buttons.length; i++) {
    //         if (buttons[i].textContent.includes(`${nama}`)) {
    //             buttons[i].click();
    //             return buttons[i];
    //         }
    //     }
    //     return null;
    // }, nama);

    const button = await getButton(page, prov[pointerProv].name);

    if (button) {
        console.log("PROVINSI".gray, `${prov[pointerProv].name}`.cyan)
        // await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000))
        const data = await getData(page);

        // validasi agar data yang didapat tidak sama dengan data provinsi
        if (prov.length === data.length) {
            notifier.notify({
                icon: 'icon.png',
                title: `Cari Data Kabupaten ${prov[pointerProv].name}`,
                message: 'cek layar ',
                sound: true
            })
            return console.log(`cek ${prov[pointerProv].name} di layar`.red)
        }
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
            console.log(`${urutan + 1} : ${itm.name}`.gray)
            urutan++
        }
        console.log("-------------------------------")

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
        return
    }

    page.close()
    notifier.notify({
        icon: 'icon.png',
        title: 'Data Kabupaten',
        message: 'Selesai',
        sound: true
    });

}

module.exports = mainGetDataKabupaten