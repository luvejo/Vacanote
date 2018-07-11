const St = imports.gi.St
const Gtk = imports.gi.Gtk
const GLib = imports.gi.GLib
const Clutter = imports.gi.Clutter
const PopupMenu = imports.ui.popupMenu
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const get_gtk_icon = Extension.imports.core.utils.get_gtk_icon
const Dashboard = Extension.imports.models.dashboard.Dashboard
const Note = Extension.imports.models.note.Note


function DashboardDetailView() {
    this._ui = null
    this._dashboard = null
    this._item_section = null
    this._init()
}

DashboardDetailView.prototype = {
    _init: function(){
        this._dashboard = Dashboard.get(0)

        this._build_UI()

        this._dashboard.notes.map(note => {
            this._build_note(
                new Note(this._dashboard, note.text, note.id))
        })
    },

    _add_note: function(text){
        let note = new Note(this._dashboard, text)
        note.save()
        return this._build_note(note)
    },

    _build_note: function(note){
        let item_box = new St.Widget({
            layout_manager: new Clutter.TableLayout(),
            style_class: 'note-item',
            reactive: true })

        let item_text = new St.Entry({ text: note.text })
        item_text.clutter_text.set_line_wrap(true)
        item_text.clutter_text.set_single_line_mode(false)

        let timeoutID = null
        item_text.clutter_text.connect('text-changed', (source, e)=> {
            if (timeoutID) {
                GLib.source_remove(timeoutID)
            }
            timeoutID = GLib.timeout_add(null, 1200, () => {
                note.text = item_text.get_text()
                note.save()
                timeoutID = null
            })
        })

        let remove_button = new St.Button({
            style_class: 'remove-button',
            reactive: true })
        remove_button.set_x_align(Clutter.ActorAlign.END)
        remove_button.set_y_align(Clutter.ActorAlign.START)

        remove_button.set_child(new St.Icon({
            gicon: get_gtk_icon('remove.png'),
            style_class: 'remove-button-icon' }))

        remove_button.connect('button-press-event', e => {
            item_box.destroy()
            note.delete()
        })

        item_box.connect('button-press-event', e => {
            item_text.clutter_text.grab_key_focus()
        })

        item_box.layout_manager.pack(item_text, 0, 0, 1, 1)
        item_box.layout_manager.pack(remove_button, 1, 0, 1, 1)

        this._item_section.add_child(item_box)

        return item_box
    },

    _build_UI: function() {
        this._ui = new St.BoxLayout({
            style_class: 'dashboard-detail' })
        this._ui.set_vertical(true)

        // Header
        let header = new St.BoxLayout({
            style_class: 'header',
            reactive: true  })

        let dashboard_name = new St.Entry({text: this._dashboard.name })
        dashboard_name.set_x_align(Clutter.ActorAlign.CENTER)
        dashboard_name.set_x_expand(true)

        header.connect('button-press-event', e => {
            dashboard_name.clutter_text.grab_key_focus()
        })

        let timeoutID = null
        dashboard_name.clutter_text.connect('key-press-event', e => {
            if (timeoutID) {
                GLib.source_remove(timeoutID)
            }
            timeoutID = GLib.timeout_add(null, 1200, () => {
                this._dashboard.name = dashboard_name.get_text()
                this._dashboard.save()
                timeoutID = null
            })
        })

        // Body
        this._item_section = new St.BoxLayout({vertical: true })

        let scrollView = new St.ScrollView({
            style_class: 'item-container',
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC })

        // Action Bar
        let action_bar = new St.BoxLayout({
            style_class: 'action-bar' })

        let create_button = new St.Button({
            label: 'NEW',
            reactive: true })
        create_button.set_x_align(Clutter.ActorAlign.END)
        create_button.set_x_expand(true)
        create_button.connect('button-press-event', e => {
            let item_box = this._add_note('')
            let item_text = item_box.get_first_child()
            item_text.grab_key_focus()

            let scroll_bar = scrollView.get_vscroll_bar()

            scroll_bar.get_adjustment().set_value(
                item_box.get_allocation_box().y1 )
        })

        // Putting it all together.
        header.add_child(dashboard_name)

        scrollView.add_actor(this._item_section)

        action_bar.add_child(create_button)

        this._ui.add_child(header)
        this._ui.add_child(scrollView)
        this._ui.add_child(action_bar)
    },

    get_ui: function() {
        return this._ui
    },

    show: function() {
        this._ui.show()
    },

    hide: function() {
        this._ui.hide()
    },
}
