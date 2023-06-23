const { PrismaClient } = require('@prisma/client')
const getPage = require('./get_page');
const getData = require('./get_data');
const getButton = require('./get_button');
const prisma = new PrismaClient();
require('colors');

async function mainGetDataKelurahan() {
    // await prisma.pointer.deleteMany({
    //     where: {
    //         id: 1
    //     }
    // })
    const page = await getPage();
    getDataKelurahan(page)
}

async function getDataKelurahan(page) {
    const pointer = await prisma.pointer.findUnique({ where: { id: 1 } })

    let pointerProv = pointer ? pointer.pointerProv : 0
    let pointerKab = pointer ? pointer.pointerKab : 0
    let pointerKec = pointer ? pointer.pointerKec : 0

    const prov = await prisma.prov.findMany();
    await page.goto("https://pemilu2019.kpu.go.id/")
    await new Promise(resolve => setTimeout(resolve, 3000))

    const [buttonProv] = await getButton(page, prov[pointerProv].name)
    // await page.$x(`//button[contains(., "${prov[pointerProv].name}")]`);
    if (buttonProv) {
        console.log("PROVINSI".gray, `${prov[pointerProv].name}`.cyan)
        await buttonProv.click();
        await new Promise(resolve => setTimeout(resolve, 1000))
        const kab = await prisma.kab.findMany({
            where: {
                provId: prov[pointerProv].id
            }
        })

        if (pointerKab > kab.length - 1) {
            pointerKab = 0
            pointerProv++;
            await prisma.pointer.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    pointerKab: pointerKab
                },
                update: {
                    pointerKab: pointerKab
                }
            })

            await prisma.pointer.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    pointerProv: pointerProv
                },
                update: {
                    pointerProv: pointerProv
                }
            })



            return await getDataKelurahan(page)
        }

        const [buttonKab] = await getButton(page, kab[pointerKab].name)
        // await page.$x(`//button[contains(., "${kab[pointerKab].name}")]`);
        if (buttonKab) {
            console.log("KABUPATEN".gray, `${kab[pointerKab].name}`.cyan)
            await buttonKab.click();
            await new Promise(resolve => setTimeout(resolve, 1000))
            const kec = await prisma.kec.findMany({
                where: {
                    kabId: kab[pointerKab].id
                }
            });

            if (pointerKec > kec.length - 1) {
                pointerKec = 0
                pointerKab++;
                await prisma.pointer.upsert({
                    where: { id: 1 },
                    create: {
                        id: 1,
                        pointerKec: pointerKec
                    },
                    update: {
                        pointerKec: pointerKec
                    }
                })

                await prisma.pointer.upsert({
                    where: { id: 1 },
                    create: {
                        id: 1,
                        pointerKab: pointerKab
                    },
                    update: {
                        pointerKab: pointerKab
                    }
                })



                return await getDataKelurahan(page)
            }

            const [buttonKec] = await getButton(page, kec[pointerKec].name)
            // await page.$x(`//button[contains(., "${kec[pointerKec].name}")]`);
            if (buttonKec) {
                console.log("KECAMATAN".gray, `${kec[pointerKec].name}`.cyan)
                console.table({
                    pointerProv: pointerProv,
                    pointerKab: pointerKab,
                    pointerKec: pointerKec,
                    totalProv: prov.length,
                    totalKab: kab.length,
                    totalKec: kec.length
                })

                await buttonKec.click();
                await new Promise(resolve => setTimeout(resolve, 1000))
                const dataKel = await getData(page);

                let urutan = 0
                let result = []
                for (let itm of dataKel) {
                    // console.log(`simpan data desa kecamatan `.gray, `${kec[pointerKec].name}`.green)
                    const kelKec = ("" + pointerProv + pointerKab + kec[pointerKec].id + "" + pointerKec + "" + urutan)
                    await prisma.kel.upsert({
                        where: {
                            kelKec: kelKec
                        },
                        update: {
                            name: itm.name
                        },
                        create: {
                            kelKec: kelKec,
                            name: itm.name,
                            value1: itm.value1,
                            value2: itm.value2,
                            kecId: kec[pointerKec].id,
                        }
                    })

                    result.push(itm)
                    // console.log(`save ${}`.gray, itm.value1, itm.value2)
                    urutan++
                }

                console.table(result)

                if (pointerKec < kec.length - 1) {
                    pointerKec++

                    await prisma.pointer.upsert({
                        where: { id: 1 },
                        create: {
                            id: 1,
                            pointerKec: pointerKec
                        },
                        update: {
                            pointerKec: pointerKec
                        }
                    })

                    return await getDataKelurahan(page)
                } else {
                    pointerKec = 0
                    await prisma.pointer.upsert({
                        where: { id: 1 },
                        create: {
                            id: 1,
                            pointerKec: pointerKec
                        },
                        update: {
                            pointerKec: pointerKec
                        }
                    })
                    // return await getDataKelurahan(page)
                }
            }


            if (pointerKab < kab.length - 1) {
                pointerKab++
                await prisma.pointer.upsert({
                    where: { id: 1 },
                    create: {
                        id: 1,
                        pointerKab: pointerKab
                    },
                    update: {
                        pointerKab: pointerKab
                    }
                })

                return await getDataKelurahan(page)
            } else {
                pointerKab = 0
                await prisma.pointer.upsert({
                    where: { id: 1 },
                    create: {
                        id: 1,
                        pointerKab: pointerKab
                    },
                    update: {
                        pointerKab: pointerKab
                    }
                })
                // return await getDataKelurahan(page)
            }

        }

        if (pointerProv < prov.length - 1) {
            pointerProv++
            await prisma.pointer.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    pointerProv: pointerProv
                },
                update: {
                    pointerProv: pointerProv
                }
            })
            return await getDataKelurahan(page)
        }
    } else {
        console.log("error button not found".red)
    }

}

module.exports = mainGetDataKelurahan