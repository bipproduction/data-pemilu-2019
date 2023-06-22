const _ = require('lodash')
async function getData(page) {
    await page.waitForSelector('table');

    const results = [];

    const tables = await page.$$('table');
    for (let i = 0; i < tables.length; i++) {

        /**
         * @type {any[]}
         */
        const data = await tables[i].evaluate(table => {
            const result = [];

            const rows = table.querySelectorAll('tr');
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');

                const name = cells.length < 0 ? "" : cells[0].innerText.trim().replace(/\s*\([^)]*\)/g, '');
                const value1 = cells.length < 0 ? "" : cells[1].innerText.trim();
                const value2 = cells.length < 0 ? "" : cells[2].innerText.trim();

                if (name) {
                    result.push({ name, value1, value2 });
                } else {
                    console.log("error , name tidak ditemukan".red, i)
                }
            }

            return result;
        });

        const data2 = data.filter((v) => !v.name.includes("+"));
        results.push(data2);
    }

    return _.flatten(results);
}

module.exports = getData