const Gio = imports.gi.Gio
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Settings = Extension.imports.config.settings


function get_max_id(list) {
    if (list.length === 0) return 0
    let max = list.reduce(
        (max, n) => max.id > n.id ? max: n)
    return max.id
}


function get_id_index(list, id) {
    let index = null

    for (let i in list){
        if (list[i].id == id) {
            index = i
        }
    }

    return index
}


function debug(msg) {
    if (Settings.DEBUG) {
        log('[vaca] ' + msg)
    }
}
