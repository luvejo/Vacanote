const Main = imports.ui.main
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const App = Extension.imports.core.app.App
const debug = Extension.imports.core.utils.debug

let app

function init() {
    debug('Starting.')
}

function enable() {
    debug('Enabling.')
    app = new App()
    Main.panel.addToStatusArea('vaca_sec', app)
}

function disable() {
    debug('Disabling.')
    app.destroy()
    app = null
}
