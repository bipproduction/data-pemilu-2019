const cheerio = require('cheerio');
const puppeteer = require('puppeteer');


async function ambilData(page) {
    // Ambil HTML dari halaman web
    const html = await page.content();

    // Parsing dokumen HTML dengan Cheerio
    const $ = cheerio.load(html);

    // Cari tabel pada halaman web
    const table = $('table');

    // Siapkan array untuk menyimpan data
    const result = [];

    // Loop melalui setiap baris, lewati header
    table.find('tr').each((i, row) => {
        if (i !== 0) {
            // Cari sel pada setiap baris
            const cells = $(row).find('td');

            // Ambil teks dari setiap sel
            const name = $(cells[0]).text().trim();
            const value1 = $(cells[1]).text().trim();
            const value2 = $(cells[2]).text().trim();

            // Tambahkan objek baru ke dalam array
            result.push({
                name,
                value1,
                value2,
            });
        }
    });

    return result;

}
