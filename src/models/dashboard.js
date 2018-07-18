const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Database = Extension.imports.core.db.Database
const get_max_id = Extension.imports.core.utils.get_max_id
const get_id_index = Extension.imports.core.utils.get_id_index


function Dashboard() {
    this.id = null
    this.name = null
    this.notes = []
    this._init()
}


Dashboard.get = function(id){
    Database.load()
    let data = Database.content.data

    for (let i in data) {
        if (data[i].id == id) {
            let dashboard = new Dashboard()
            dashboard.id = data[i].id
            dashboard.name = data[i].name
            dashboard.notes = data[i].notes
            return dashboard
        }
    }
    throw 'You\'ve specified an invalid ID.'
}


Dashboard.prototype = {
    _init: function() {
        Database.load()
    },

    save: function() {
        if (this.id == null) {
            this._create()
        } else {
            this._update()
        }
    },

    _create: function() {
        let data = Database.content.data

        let next_available_id = get_max_id(data) + 1
        data.push({
            id: next_available_id,
            name: this.name,
            notes: [],
        })

        this.id = next_available_id
        Database.content.data = data
        Database.save()
    },

    _update: function() {
        let data = Database.content.data
        let index = get_id_index(data, this.id)

        data[index] = {
            id: this.id,
            name: this.name,
            notes: this.notes,
        }

        Database.content.data = data
        Database.save()
    },

}
