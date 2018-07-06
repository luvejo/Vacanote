const St = imports.gi.St
const PanelMenu = imports.ui.panelMenu
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Router = Extension.imports.core.router.Router
const routes = Extension.imports.config.routes.routes
const get_gtk_icon = Extension.imports.core.utils.get_gtk_icon
const Settings = Extension.imports.config.settings


function App() {
    this._init()
}


App.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, St.Align.START)
        this.build_UI()

        let router = new Router()
        this.register_views(router)

        router.route(Settings.INITIAL_VIEW)
    },

    register_views: function(router) {
        let main_box = this.menu.box.get_children()[0]

        routes.map(route => {
            let view = new route.view()
            router.register(route.name, view)
            main_box.add_child(view.get_ui())
        })
    },

    build_UI: function() {
        let button = new St.BoxLayout({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            track_hover: true })

        let icon = new St.Icon({
            gicon: get_gtk_icon('cow.png'),
            style_class: 'system-status-icon' })

        button.add_child(icon)
        this.actor.add_actor(button)

        this.menu.box.add(new St.BoxLayout({
            style_class: 'main-container' }))

        this.menu.box.add_style_class_name('vaca-popup-menu-content')
        this.menu._boxPointer.actor.add_style_class_name('vaca-popup-menu-boxpointer')
    },
}
