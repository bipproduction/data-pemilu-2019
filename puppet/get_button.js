async function getButton(page, nama) {
    const button = await page.evaluate((nama) => {
        const buttons = document.querySelectorAll('button.clear-button.text-primary.text-left');
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes(`${nama}`)) {
                buttons[i].click();
                return buttons[i];
            }
        }
        return null;
    }, nama);

    return button
}

module.exports = getButton