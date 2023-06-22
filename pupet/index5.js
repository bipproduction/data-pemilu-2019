const puppeteer = require('puppeteer');
const fs = require('fs')


async function getData(page) {
    // Tunggu hingga halaman selesai dimuat
    await page.waitForSelector('table');

    // Ambil data dari tabel
    const data = await page.evaluate(() => {
        // Cari tabel pada halaman web
        const table = document.querySelector('table');

        // Buat array kosong untuk menampung hasil
        const result = [];

        // Loop melalui setiap baris, lewati header
        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
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
        }

        return result;
    });

    return data
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 500, height: 1280, isMobile: true },
        args: [`--window-size=500,1280`],
    })
    const [page] = await browser.pages();

    // Buka halaman web dengan tabel yang ingin diambil datanya
    await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
    await new Promise(r => setTimeout(r, 5000))

    const data = await getData(page);

    // Tampilkan hasil
    console.log(JSON.stringify(data, null, 2));

    for (let i in data) {
        await page.waitForSelector('button');
        // Cari button yang mengandung kata tertentu
        const [button] = await page.$x(`//button[contains(., '${data[i].name}')]`);
        if (button) {
            console.log("click", data[i].name)
            await button.click();
            await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
            await new Promise(r => setTimeout(r, 2000))
            try {
                const data2 = await getData(page);
                data[i].kab = data2;
            } catch (error) {
                console.log("error", data[i].name)
            }
        }
    }

    fs.writeFileSync('rekapitulasi.json', JSON.stringify(data, null, 2));

    // await browser.close();
})();