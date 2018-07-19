const St = imports.gi.St
const Gtk = imports.gi.Gtk
const GLib = imports.gi.GLib
const Clutter = imports.gi.Clutter
const PopupMenu = imports.ui.popupMenu
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const CONTROL_MASK = imports.gi.Clutter.ModifierType.CONTROL_MASK
const SHIFT_MASK = imports.gi.Clutter.ModifierType.SHIFT_MASK
const KEY_RETURN = imports.gi.Clutter.Return
const KEY_HOME = imports.gi.Clutter.Home
const KEY_END = imports.gi.Clutter.End

const Dashboard = Extension.imports.models.dashboard.Dashboard
const Note = Extension.imports.models.note.Note


function DashboardDetailView(app) {
    this._app = app
    this._ui = null
    this._dashboard = null
    this._item_section = null
    this._action_bar = null
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

        this._build_create_bar()
    },

    _add_note: function(text){
        let note = new Note(this._dashboard, text)
        note.save()
        return this._build_note(note)
    },

    _build_note: function(note){
        let item_box = new St.Widget({
            layout_manager: new Clutter.TableLayout(),
            style_class: 'item',
            reactive: true })

        let item_text = new St.Entry({ text: note.text })
        item_text.clutter_text.set_line_wrap(true)
        item_text.clutter_text.set_activatable(false)
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
            this.scroll_to_cursor(item_box)
        })

        item_text.clutter_text.connect('cursor-changed', () => {
            this.scroll_to_cursor(item_box)
        })

        item_text.clutter_text.connect('key-press-event', (clutter_text, e) => {
            let symbol = e.get_key_symbol()
            let state = e.get_state()

            if(symbol === KEY_HOME){
                if (state === CONTROL_MASK)
                    clutter_text.set_selection(0, 0)
                else if (state === (CONTROL_MASK|SHIFT_MASK))
                    clutter_text.set_cursor_position(0)

            } else if(symbol === KEY_END) {
                let text_length = clutter_text.get_text().length

                if (state === CONTROL_MASK)
                    clutter_text.set_selection(text_length, text_length)
                else if (state === (CONTROL_MASK|SHIFT_MASK))
                    clutter_text.set_cursor_position(text_length)
            }
        })

        let remove_button = new St.Button({
            style_class: 'remove-button',
            reactive: true })
        remove_button.set_x_align(Clutter.ActorAlign.END)
        remove_button.set_y_align(Clutter.ActorAlign.START)

        remove_button.set_child(new St.Icon({
            icon_name: 'vaca-remove-symbolic',
            style_class: 'remove-button-icon' }))

        remove_button.connect('button-press-event', e => {
            this._build_delete_bar(note, item_box)
        })

        item_box.connect('button-press-event', e => {
            item_text.clutter_text.grab_key_focus()
        })

        item_box.layout_manager.pack(item_text, 0, 0, 1, 1)
        item_box.layout_manager.pack(remove_button, 1, 0, 1, 1)

        this._item_section.add_child(item_box)

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
            let item_box = this._add_note('')
            let item_text = item_box.get_first_child()
            item_text.grab_key_focus()

            this.scroll_to_cursor(item_box)
        })

        this._action_bar.add_child(create_button)
    },

    _build_delete_bar: function(note, item_box) {
        this._action_bar.destroy_all_children()

        for (let child of item_box.get_parent().get_children())
            child.remove_style_class_name('red')

        item_box.add_style_class_name('red')

        let confirmation_msg = new St.Label({
            text: 'Are you sure you want to delete this note?' })

        confirmation_msg.clutter_text.set_line_wrap(true)

        let no_button = new St.Button({
            label: 'NO' })
        no_button.set_x_align(Clutter.ActorAlign.END)
        no_button.set_x_expand(true)
        no_button.connect('button-press-event', e => {
            item_box.remove_style_class_name('red')
            this._build_create_bar()
        })

        let yes_button = new St.Button({
            label: 'YES',
            style_class: 'main-action' })
        yes_button.set_x_align(Clutter.ActorAlign.END)
        yes_button.set_x_expand(true)

        yes_button.connect('button-press-event', e => {
            item_box.destroy()
            note.delete()
            this._build_create_bar()
        })

        this._action_bar.add_child(confirmation_msg)
        this._action_bar.add_child(no_button)
        this._action_bar.add_child(yes_button)
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
        dashboard_name.clutter_text.connect('text-changed', (source, e) => {
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

        let scroll_view = new St.ScrollView({
            style_class: 'item-container',
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC })

        // Action Bar
        this._action_bar = new St.BoxLayout({
            style_class: 'action-bar' })

            reactive: true })

        })

        // Putting it all together.
        header.add_child(dashboard_name)

        scroll_view.add_actor(this._item_section)

        this._ui.add_child(header)
        this._ui.add_child(scroll_view)
        this._ui.add_child(this._action_bar)
    },

    scroll_to_cursor: function(item) {
        let v_adjustment = this._item_section
            .get_parent()
            .get_vscroll_bar()
            .get_adjustment()

        let current_scroll_value = v_adjustment.get_value()

        let item_section_height = this._item_section.get_allocation_box().y2 -
                                  this._item_section.get_allocation_box().y1

        let visible_chunk_y1 = current_scroll_value

        let visible_chunk_y2 = current_scroll_value + item_section_height

        let item_y1 = item.get_allocation_box().y1

        let clutter_text = item.get_first_child().clutter_text

        let cursor_y1 = item_y1 + clutter_text.get_cursor_rect().get_y()
        let line_height = clutter_text.position_to_coords(0)[3]
        let text = clutter_text.get_text()

        if (text.length === 0) {
            line_height *= 2
        } else {
            let cursor_position = clutter_text.get_cursor_position()

            if (cursor_position === -1)
                cursor_position = text.length - 1

            if (text[cursor_position] === '\n')
                line_height *= 2
        }

        let cursor_y2 = cursor_y1 + line_height

        let bottom_padding = 10
        if (cursor_y1 < visible_chunk_y1)
            v_adjustment.set_value(cursor_y1)
        else if (cursor_y2 > (visible_chunk_y2 - bottom_padding))
            v_adjustment.set_value(
                cursor_y2 +
                line_height -
                item_section_height)
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
