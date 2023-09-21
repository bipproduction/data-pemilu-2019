const prompts = require("prompts")
const data_province = require("./get_data/data_province")
const backup_data = require("./get_data/backup_data")
const inject_data = require("./get_data/inject_data")

/**
 * @type {{
        title: "",
        description: "",
        value: "",
        action: () => {}
    }[]}
 */
const listMenu = [
    {
        title: "data province",
        value: "data_province",
        description: "mengeluarkan data province",
        action: data_province
    },
    {
        title: "backup data",
        value: "backup_data",
        description: "backup data dari database",
        action: backup_data
    },
    {
        title: "inject data",
        value: "inject_data",
        description: "inject data ke database",
        action: inject_data
    }
]

prompts({
    type: "select",
    name: "menu",
    message: "pilihlah menu",
    choices: listMenu
}).then(({ menu }) => {
    if (!menu) return console.log("bye ...")
    listMenu.find((v) => v.value === menu).action()
})