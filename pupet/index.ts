import { load } from "cheerio"
import 'colors'
import _ from "lodash"
import puppeteer, { Page } from "puppeteer"

type Model = {
    name?: string
    value1?: string
    value2?: string
    child?: any[]
}

async function cari(page: Page) {

    const rows = await page.$$('table tr');
    let listHasil: Model[] = []
    for (let i in rows) {
        const cells = await rows[i].$$('td');
        const name = cells.length <= 2 ? null : await cells[0].evaluate(element => element.textContent);
        const value1 = cells.length <= 2 ? null : await cells[1].evaluate(element => element.textContent);
        const value2 = cells.length <= 2 ? null : await cells[2].evaluate(element => element.textContent);

        if (name) {
            const data: Model = {
                name: name?.toString().trim(),
                value1: value1?.toString().trim(),
                value2: value2?.toString().trim(),
            }

            listHasil.push(data as any)
        }

    }
    return listHasil;
}

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 500, height: 1280, isMobile: true },
        args: [`--window-size=500,1280`],
    })

    const [page] = await browser.pages()
    await page.setViewport({ width: 500, height: 1280, isMobile: true })

    await page.goto("https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/")
    await new Promise(r => setTimeout(r, 5000))

    // Ambil HTML dari halaman web
    const html = await page.content();

    // Parsing dokumen HTML dengan Cheerio
    const $ = load(html);

    // Cari tabel pada dokumen HTML
    const table = $('table');

    // Cari baris pada tabel
    const rows = table.find('tr');

    // Siapkan array untuk menyimpan data
    const data: any[] = [];

    // Loop melalui setiap baris, lewati header
    for (let i = 1; i < rows.length; i++) {
        // Cari sel pada setiap baris
        const cells = $(rows[i]).find('td');

        // Ambil teks dari setiap sel dan tombol
        const name = $(cells[0]).text().trim();
        const value1 = $(cells[1]).text().trim();
        const value2 = $(cells[2]).text().trim();
        const tombol = $(cells[0]).find('button').attr("id")
        // Tambahkan objek baru ke dalam array
        if (!_.isEmpty(name)) {
            data.push({
                name,
                value1,
                value2
            });
        }

        await page.click("#" + tombol)


    }

    console.log(data);

    await browser.close();

}


async function main2() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 500, height: 1280, isMobile: true },
        args: [`--window-size=500,1280`],
    })
    const [page] = await browser.pages();

    await page.goto('https://pemilu2019.kpu.go.id/#/ppwp/rekapitulasi/');
    await new Promise(r => setTimeout(r, 5000))
    // Tunggu sampai tabel muncul
    await page.waitForSelector('table');

    // Ambil data dari tabel dengan menggunakan metode evaluate()
    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tr');

        // Siapkan array untuk menyimpan data
        const result: any = [];

        // Loop melalui setiap baris, lewati header
        for (let i = 1; i < rows.length; i++) {
            // Cari sel pada setiap baris
            const cells: any = rows[i].querySelectorAll('td');

            if (cells.length > 0) {
                // Ambil teks dari setiap sel
                const no = cells[0].textContent.trim();
                const provinsi = cells[1].textContent.trim();
                const kabupaten = cells[2].textContent.trim();
                const kecamatan = cells[3].textContent.trim();
                const kelurahan = cells[4].textContent.trim();
                const tps = cells[5].textContent.trim();
                const jmlPemilih = cells[6].textContent.trim();
                const jmlSuaraSah = cells[7].textContent.trim();
                const jmlSuaraTidakSah = cells[8].textContent.trim();
                const jmlPenggunaHakPilih = cells[9].textContent.trim();
                const persentasePemilih = cells[10].textContent.trim();
                const persentaseSuaraSah = cells[11].textContent.trim();

                // Tambahkan objek baru ke dalam array
                result.push({
                    no,
                    provinsi,
                    kabupaten,
                    kecamatan,
                    kelurahan,
                    tps,
                    jmlPemilih,
                    jmlSuaraSah,
                    jmlSuaraTidakSah,
                    jmlPenggunaHakPilih,
                    persentasePemilih,
                    persentaseSuaraSah,
                });
            }
        }

        return result;
    });

    // Ubah data menjadi JSON
    const jsonData = JSON.stringify(data);

    console.log(jsonData);

    await browser.close();
}

main2()