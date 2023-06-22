const puppeteer = require('puppeteer');
const _ = require('lodash');
const { PrismaClient } = require('@prisma/client');
const getDataProvince = require('./get_data_province');
const prisma = new PrismaClient()

require('colors')

    ; (async () => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 500, height: 1280, isMobile: true },
            args: [`--window-size=500,1280`],
        });
        const [page] = await browser.pages();
        await page.goto('https://pemilu2019.kpu.go.id/');

        await new Promise(resolve => setTimeout(resolve, 3000));

        await getDataProvince(page)

    })();


// async function getDataProvince(page) {
//     console.log("get data province".yellow)
//     const data = await getData(page);

//     for (let itm in data) {
//         if (!data[itm].name.includes("+")) {
//             const id = +itm + 1

//             await prisma.prov.upsert({
//                 where: { id: id },
//                 update: {
//                     name: data[itm].name
//                 },
//                 create: {
//                     id: id,
//                     name: data[itm].name,
//                     value1: data[itm].value1,
//                     value2: data[itm].value2
//                 },
//             })
//         }

//     }

//     console.log("cuccess".green)
// }

// async function getData(page) {
//     await page.waitForSelector('table');

//     const results = [];

//     const tables = await page.$$('table');
//     for (let i = 0; i < tables.length; i++) {
//         const data = await tables[i].evaluate(table => {
//             const result = [];

//             const rows = table.querySelectorAll('tr');
//             for (let i = 1; i < rows.length; i++) {
//                 const cells = rows[i].querySelectorAll('td');

//                 const name = cells.length < 0 ? "" : cells[0].innerText.trim().replace(/\s*\([^)]*\)/g, '');
//                 const value1 = cells.length < 0 ? "" : cells[1].innerText.trim();
//                 const value2 = cells.length < 0 ? "" : cells[2].innerText.trim();

//                 if (name) {
//                     result.push({ name, value1, value2 });
//                 } else {
//                     console.log("error , name tidak ditemukan".red, i)
//                 }
//             }

//             return result;
//         });

//         results.push(data);
//     }

//     return _.flatten(results);
// }
