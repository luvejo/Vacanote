const Extension = imports.misc.extensionUtils.getCurrentExtension()

const Database = Extension.imports.core.db.Database
const get_max_id = Extension.imports.core.utils.get_max_id
const get_id_index = Extension.imports.core.utils.get_id_index


function Dashboard(name, id) {
    this.id = id
    this.name = name
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


Dashboard.all = function(id){
    Database.load()
    let data = Database.content.data

    let mapped = data.map(dashboard => {
        return new Dashboard(
            dashboard.name,
            dashboard.id)
    })

    return mapped

}


Dashboard.get_last_viewed = function(){
    Database.load()
    return Database.content.meta.last_viewed_dashboard
}


Dashboard.set_last_viewed = function(dashboard_id){
    Database.load()
    let data = Database.content.data

    let match = data.filter(
        dashboard => dashboard.id === dashboard_id)

    if (match.length) {
        Database.content.meta.last_viewed_dashboard = dashboard_id
        Database.save()
    } else {
        throw 'You\'ve specified an invalid ID.'
    }
}


Dashboard.last_viewed_exists = function(){
    Database.load()
    let data = Database.content.data
    let dashboard_id = this.get_last_viewed()

    let match = data.filter(
        dashboard => dashboard.id === dashboard_id)

    return match.length
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

    delete: function() {
        let data = Database.content.data

        let index = get_id_index(data, this.id)
        data.splice(index, 1)

        Database.content.data = data
        Database.save()
    },

}
