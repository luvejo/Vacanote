const GLib = imports.gi.GLib
const Extension = imports.misc.extensionUtils.getCurrentExtension()

//  DEVELOPMENT
const DEBUG = false

//  VIEWS
const INITIAL_VIEW = 'dashboard-detail'

//  DATABASE
const INITIAL_JSON = '{' +
    '"meta": { "last_dashboard_id": 0 },' +
    '"data": [' +
        '{' +
            '"id": 0,' +
            '"name": "Things I have TODO",' +
            '"notes": []' +
        '}' +
    ']' +
'}'
const CONFIG_DIR = GLib.get_home_dir() + '/.config/vacanote'
const DB_FILE = CONFIG_DIR + '/db.json'

//  STATIC FILES
const BASE_DIR = Extension.path
const STATIC_DIR = BASE_DIR + '/static'
