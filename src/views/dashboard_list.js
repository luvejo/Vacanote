const St = imports.gi.St
const Gtk = imports.gi.Gtk
const GLib = imports.gi.GLib
const Clutter = imports.gi.Clutter
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Dashboard = Extension.imports.models.dashboard.Dashboard
const Note = Extension.imports.models.note.Note


function DashboardListView(app) {
    this._app = app
    this._ui = null
    this._item_section = null
    this._action_bar = null
    this._init()
}

DashboardListView.prototype = {
    _init: function(){
        this._ui = new St.BoxLayout({
            style_class: 'dashboard-list' })
        this._ui.set_vertical(true)
    },

    _add_item: function(text){
        let dashboard = new Dashboard(text)
        dashboard.save()
        return this._build_item(dashboard)
    },

    _build_item: function(dashboard, selected){
        let item_box = new St.Widget({
            layout_manager: new Clutter.TableLayout(),
            style_class: 'item',
            reactive: true })

        if (selected)
            item_box.add_style_class_name('selected')

        let item_text = new St.Label({ text: dashboard.name })

        let remove_button = new St.Button({
            style_class: 'remove-button',
            reactive: true })
        remove_button.set_x_align(Clutter.ActorAlign.END)
        remove_button.set_y_align(Clutter.ActorAlign.START)

        let icon = new St.Icon({
            icon_name: 'vaca-remove-symbolic',
            style_class: 'remove-button-icon' })

        remove_button.set_child(icon)

        remove_button.connect('button-press-event', e => {
            this._build_delete_bar(dashboard, item_box)
        })

        item_box.layout_manager.pack(item_text, 0, 0, 1, 1)
        item_box.layout_manager.pack(remove_button, 1, 0, 1, 1)

        this._item_section.add_child(item_box)

        item_box.connect('button-press-event', () => {
            this._app.router.route('dashboard-detail', {id: dashboard.id})
        })

        return item_box
    },

    _build_create_bar: function() {
        this._action_bar.destroy_all_children()

        let create_button = new St.Button({
            label: 'NEW',
            style_class: 'main-action' })
        create_button.set_x_align(Clutter.ActorAlign.END)
        create_button.set_x_expand(true)
        create_button.connect('button-press-event', e => {
            let item_box = this._add_item('')
            let item_text = item_box.get_first_child()
        })

        this._action_bar.add_child(create_button)
    },

    _build_delete_bar: function(dashboard, item_box) {
        // Cleaning previous builds.
        this._action_bar.destroy_all_children()

        for (let child of item_box.get_parent().get_children())
            child.remove_style_class_name('red')

        // Build action bar.
        item_box.add_style_class_name('red')

        let confirmation_msg = new St.Label({
            text: 'Are you sure you want to delete this dashboard?' })

        confirmation_msg.clutter_text.set_line_wrap(true)

        let no_button = new St.Button({
            label: 'NO',
            style_class: 'secundary-action' })
        no_button.set_x_align(Clutter.ActorAlign.END)
        no_button.set_x_expand(true)

        let yes_button = new St.Button({
            label: 'YES',
            style_class: 'main-action' })
        yes_button.set_x_align(Clutter.ActorAlign.END)

        let button_line = new St.BoxLayout()

        // Define handlers
        no_button.connect('button-press-event', e => {
            item_box.remove_style_class_name('red')
            this._build_create_bar()
        })

        yes_button.connect('button-press-event', e => {
            item_box.destroy()
            dashboard.delete()
            this._build_create_bar()

            if (Dashboard.get_last_viewed() === dashboard.id)
                Dashboard.set_last_viewed()
        })

        // Putting it all together.
        button_line.add_child(no_button)
        button_line.add_child(yes_button)

        this._action_bar.add_child(confirmation_msg)
        this._action_bar.add_child(button_line)
    },

    _build_UI: function() {
        // Clean previous builds.
        this._ui.destroy_all_children()

        // Header
        let header = new St.BoxLayout({
            style_class: 'header',
            reactive: true  })

        let switch_button = new St.Button({
            style_class: 'switch-button',
            reactive: true })
        switch_button.set_child(new St.Icon({
            icon_name: 'arrow',
            style_class: 'switch-button-icon' }))

        switch_button.connect('button-press-event', () => {
            this._app.router.route('dashboard-detail')
        })

        let dashboard_name = new St.Entry({text: 'My dashboards'})
        dashboard_name.set_x_align(Clutter.ActorAlign.CENTER)
        dashboard_name.set_x_expand(true)

        // Body
        this._item_section = new St.BoxLayout({ vertical: true })

        let scroll_view = new St.ScrollView({
            style_class: 'item-container',
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC })

        // Action Bar
        this._action_bar = new St.BoxLayout({
            style_class: 'action-bar' })
        this._action_bar.set_vertical(true)

        this._build_create_bar()

        // Putting it all together.
        if (Dashboard.last_viewed_exists())
            header.add_child(switch_button)
        header.add_child(dashboard_name)

        scroll_view.add_actor(this._item_section)

        this._ui.add_child(header)
        this._ui.add_child(scroll_view)
        this._ui.add_child(this._action_bar)
    },

    get_ui: function() {
        return this._ui
    },

    show: function() {
        let last_viewed = Dashboard.get_last_viewed()

        this._build_UI()

        Dashboard.all().map(dashboard => {
            let selected = false

            if (dashboard.id === last_viewed)
                selected = true

            this._build_item(dashboard, selected)
        })

        this._ui.show()
    },

    hide: function() {
        this._ui.hide()
    },
}
