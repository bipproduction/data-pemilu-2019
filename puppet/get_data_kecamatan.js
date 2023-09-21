const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const getButton = require('./get_button');
const prisma = new PrismaClient();
require('colors');


async function mainGetDataKecamatan() {

    // hapus data pointer saat pertama load, comment ini jika tidak perlu
    await prisma.pointer.deleteMany({
        where: {
            id: 1
        }
    })

    // init page 
    const page = await getPage();

    // mulai proses
    getDataKecamatan(page)
}

async function getDataKecamatan(page) {

    // mengambil data pointer yang tersimpan di database
    const pointer = await prisma.pointer.findUnique({ where: { id: 1 } })
    let pointerProv = pointer ? pointer.pointerProv : 0
    let pointerKab = pointer ? pointer.pointerKab : 0

    // ambil data provinsi yang telah tersimpan sebelumnya di database
    const prov = await prisma.prov.findMany();

    // menuju halaman target
    await page.goto("https://pemilu2019.kpu.go.id/")

    // tunggu 3 detik, perkiraan component di load sempurna , tambahkan jika dirasa kurang
    await new Promise(resolve => setTimeout(resolve, 3000))

    // temukan tombol profinsi dari data provinsi

    // const [buttonProv] = await page.$x(`//button[contains(., '${prov[pointerProv].name}')]`);


    const buttonProv = await getButton(page, prov[pointerProv].name)
    console.log("PROVINSI".gray, `${prov[pointerProv].name}`.cyan)

    // lanjutkan proses jika tombol ditemukan
    if (buttonProv) {
        // await buttonProv.click();

        // tunggu satu detik diharapkan componen cumcul
        await new Promise(resolve => setTimeout(resolve, 1000))

        // mengambil data kabupaten dari database sebagai refrensi tombol
        const dataKab = await prisma.kab.findMany({
            where: {
                provId: prov[pointerProv].id
            }
        })

        // temukan tombol kabupaten
        // const [buttonKab] = await page.$x(`//button[contains(., '${dataKab[pointerKab].name}')]`);

        if (!dataKab[pointerKab] || !dataKab[pointerKab].name) return console.log("cek nama kabupaten".red)
        const buttonKab = await getButton(page, dataKab[pointerKab].name)
        console.log("KABUPATEN".gray, `${dataKab[pointerKab].name}`.cyan)

        if (buttonKab) {
            // await buttonKab.click();

            // tunggu satu detik , diharapkan component data muncul
            await new Promise(resolve => setTimeout(resolve, 1000))

            // ambil data kecamatan
            const kec = await getData(page);

            if (kec.length === 0) return console.log("DATA KOSONG".red)

            let urutan = 0
            for (let itm of kec) {

                // membuat uniq key
                const kecKab = ("" + dataKab[pointerKab].id + "" + pointerKab + "" + urutan)

                // menyimpan data kabupaten
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
                console.log(`${urutan + 1} : ${itm.name}`.gray)
                urutan++
            }
            console.log("========================")


            // validari untuk mengulangi proses jika pointerKab kurang dari data kab
            if (pointerKab < dataKab.length - 1) {
                pointerKab++

                // menyimpan pointer kab
                await prisma.pointer.upsert({
                    where: {
                        id: 1
                    },
                    update: {
                        pointerKab: pointerKab
                    },
                    create: {
                        id: 1,
                        pointerKab: pointerKab
                    }
                })

                // mengulangi prosses dampan pointerKab lebih berar dari kab
                return await getDataKecamatan(page)
            } else {

                // pointerKab lebih besar dari kab makan pointer kembali ke 0
                pointerKab = 0

                // simpan pointer kab
                await prisma.pointer.upsert({
                    where: {
                        id: 1
                    },
                    update: {
                        pointerKab: pointerKab
                    },
                    create: {
                        id: 1,
                        pointerKab: pointerKab
                    }
                })
            }

        }

        // jika pointer provinsi kurang dari prov length, makan pointer prov akan bertambah terus
        if (pointerProv < prov.length - 1) {

            // menambah pointerProv +1
            pointerProv++

            // simpan / update pointerProv
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

            // ulangi prosses untuk provinsi
            return await getDataKecamatan(page)
        } else {

            // jika pointerProv lebih besar dari prov length, prossess akan berhenti karena prosesnya sudah selesai
            console.log("selesai".green)
            return;
        }


    } else {
        // berhenti karena tombol tidak ditemukan (lakukan evaluasi)
        console.log("error button not found".red)
        return getDataKecamatan(page)
    }

}

module.exports = mainGetDataKecamatan