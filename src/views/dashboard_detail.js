const St = imports.gi.St
const Gtk = imports.gi.Gtk
const GLib = imports.gi.GLib
const Clutter = imports.gi.Clutter
const PopupMenu = imports.ui.popupMenu
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const get_gtk_icon = Extension.imports.core.utils.get_gtk_icon
const get_clutter_color = Extension.imports.core.utils.get_clutter_color
const Dashboard = Extension.imports.models.dashboard.Dashboard
const Note = Extension.imports.models.note.Note


function DashboardDetailView() {
    this._ui = null
    this._dashboard = null
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
        this._build_note(note)
    },

    _build_note: function(note){
        let item_box = new St.Widget({
            layout_manager: new Clutter.TableLayout(),
            style_class: 'note-item',
            reactive: true })

        let item_text = new St.Label({ text: note.text, style_class: 'text' })
        item_text.clutter_text.set_editable(true)
        item_text.clutter_text.set_activatable(true)
        item_text.clutter_text.set_reactive(true)
        item_text.clutter_text.set_selection_color(get_clutter_color('#666235'))
        item_text.clutter_text.set_selected_text_color(get_clutter_color('#FFF'))

        let timeoutID = null
        item_text.clutter_text.connect('key-press-event', e => {
            if (timeoutID) {
                GLib.source_remove(timeoutID)
            }
            timeoutID = GLib.timeout_add(null, 1500, () => {

                note.text = item_text.text
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

        this._ui.get_child_at_index(1).get_child_at_index(2).add_child(item_box)
    },

    _build_UI: function() {
        this._ui = new St.BoxLayout({
            style_class: 'dashboard-detail' })
        this._ui.set_vertical(true)

        // Header
        let header = new St.BoxLayout({
            style_class: 'header',
            reactive: true  })

        let dashboard_name = new St.Label({
            text: this._dashboard.name })
        dashboard_name.clutter_text.set_editable(true)
        dashboard_name.clutter_text.set_activatable(true)
        dashboard_name.clutter_text.set_reactive(true)
        dashboard_name.clutter_text.set_selection_color(get_clutter_color('#FFF'))
        dashboard_name.clutter_text.set_selected_text_color(get_clutter_color('#1D1D1D'))
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
            timeoutID = GLib.timeout_add(null, 1500, () => {
                this._dashboard.name = dashboard_name.text
                this._dashboard.save()
                timeoutID = null
            })
        })

        // Body
        let item_section = new PopupMenu.PopupMenuSection()
        item_section.one = false

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
        create_button.connect('button-press-event', e => this._add_note(''))

        // Putting it all together.
        header.add_child(dashboard_name)

        scrollView.add_actor(item_section.actor)

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
