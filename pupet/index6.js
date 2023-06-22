const puppeteer = require('puppeteer');
const fs = require('fs');
const _ = require("lodash");
require('colors')


async function getData(page) {
    // Tunggu hingga halaman selesai dimuat
    await page.waitForSelector('table');

    // Buat array kosong untuk menampung hasil dari setiap tabel
    const results = [];

    // Loop melalui setiap tabel pada halaman web
    const tables = await page.$$('table');
    for (let i = 0; i < tables.length; i++) {
        // Ambil data dari tabel saat ini
        const data = await tables[i].evaluate(table => {
            // Buat array kosong untuk menampung hasil
            const result = [];

            // Loop melalui setiap baris, lewati header
            const rows = table.querySelectorAll('tr');
            for (let i = 1; i < rows.length; i++) {
                try {
                    // Cari sel pada setiap baris
                    const cells = rows[i].querySelectorAll('td');

                    // Ambil teks dari setiap sel dan trim jika diperlukan

                    const name = cells[0].innerText.trim();
                    const value1 = cells[1].innerText.trim();
                    const value2 = cells[2].innerText.trim();

                    // Tambahkan objek baru ke dalam array
                    result.push({
                        name: name,
                        value1: value1,
                        value2: value2,
                    });
                } catch (error) {
                    console.log("error".red, i)
                }
            }

            return result;
        });

        // Tambahkan hasil dari tabel saat ini ke dalam array results
        results.push(data);
    }

    return _.flatten(results)
}


; (async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 500, height: 1280, isMobile: true },
        args: [`--window-size=500,1280`],
    })
    const [page] = await browser.pages();

    await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
    await new Promise(r => setTimeout(r, 5000))

    const results = await getData(page)

    const hasil2 = results.map((v, i) => ({
        no: i + 1,
        ...v
    }))

    let pointer1 = 0
    let pointer2 = 0
    let pointer3 = 0;

    for (let i in hasil2) {

        // tunggu button muncul
        await page.waitForSelector('button');
        const [button] = await page.$x(`//button[contains(., '${hasil2[i].name}')]`);

        if (button) {
            // 
            console.log("click".green, hasil2[i].name)
            await button.click();

            // tunggu 2 detik
            await new Promise(r => setTimeout(r, 2000))


            const data2 = await getData(page);
            hasil2[i].kab = data2;


            for (let i2 in data2) {

                // tunggu button muncul
                await page.waitForSelector('button');
                const [button] = await page.$x(`//button[contains(., '${data2[i2].name}')]`);

                await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
                await new Promise(r => setTimeout(r, 1000))
            }

        }else {
            console.log("button gk ada")
        }
    }

    // Simpan hasil ke file JSON
    fs.writeFileSync('result2.json', JSON.stringify(hasil2, null, 2));

    await browser.close();
})();