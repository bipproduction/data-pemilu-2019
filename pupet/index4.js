const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    // Buka halaman web dengan tabel yang ingin diambil button-nya
    await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Tunggu hingga halaman selesai dimuat
    await page.waitForSelector('table');

    // Loop melalui setiap baris, lewati header
    for (let i = 1; i <= 10; i++) {
        // Cari button pada kolom pertama pada baris saat ini
        const button = await page.$(`table tr:nth-of-type(${i}) td:nth-of-type(1) button`);

        console.log("click", i)
        // Lakukan klik pada button
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await browser.close();
})();