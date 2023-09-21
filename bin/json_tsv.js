module.exports = function (jsonData) {
    const header = Object.keys(jsonData[0]).join('\t'); // Membuat baris header TSV
    const rows = jsonData.map((row) => Object.values(row).join('\t')); // Membuat baris data TSV
    return [header, ...rows].join('\n'); // Menggabungkan header dan data menjadi TSV
}