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
    let content = Database.content

    for (let i in content) {
        if (content[i].id == id) {
            let dashboard = new Dashboard()
            dashboard.id = content[i].id
            dashboard.name = content[i].name
            dashboard.notes = content[i].notes
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
        let content = Database.content

        let next_available_id = get_max_id(content) + 1
        content.push({
            id: next_available_id,
            name: this.name,
            notes: [],
        })

        this.id = next_available_id
        Database.content = content
        Database.save()
    },

    _update: function() {
        let content = Database.content
        let index = get_id_index(content, this.id)

        content[index] = {
            id: this.id,
            name: this.name,
            notes: this.notes,
        }

        Database.content = content
        Database.save()
    },

}
