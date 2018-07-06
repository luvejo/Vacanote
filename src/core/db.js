const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Shell = imports.gi.Shell
const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Settings = Extension.imports.config.settings
const debug = Extension.imports.core.utils.debug
const CONFIG_DIR = Settings.CONFIG_DIR
const DB_FILE = Settings.DB_FILE


let Database = {
    content: null,

    save: function() {
        debug('Saving database.')
        // Open DB_FILE and save our JSON.
        let f = Gio.file_new_for_path(DB_FILE)
        let out = f.replace(null, false, Gio.FileCreateFlags.NONE, null)
        Shell.write_string_to_stream(out, JSON.stringify(this.content))
        out.close(null)
    },

    load: function() {
        debug('Loading database.')
        // Check if the DB_FILE exists. If not, create a basic one.
        if (!GLib.file_test(DB_FILE, GLib.FileTest.EXISTS)) {
            if(!GLib.file_test(CONFIG_DIR, GLib.FileTest.EXISTS)){
                GLib.mkdir_with_parents(CONFIG_DIR, 511)
            }
            GLib.file_set_contents(DB_FILE, Settings.INITIAL_JSON)
        }

        // Load the content of the file and parse it with JSON.
        let content = Shell.get_file_contents_utf8_sync(DB_FILE)
        this.content = JSON.parse(content)
    },
}
