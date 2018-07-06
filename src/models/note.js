const Extension = imports.misc.extensionUtils.getCurrentExtension()

const get_max_id = Extension.imports.core.utils.get_max_id
const get_id_index = Extension.imports.core.utils.get_id_index
const debug = Extension.imports.core.utils.debug


function Note(dashboard, text, id) {
    this.dashboard = null
    this.id = null
    this.text = null
    this._init(dashboard, text, id)
}


Note.prototype = {
    _init: function(dashboard, text, id){
        this.dashboard = dashboard
        this.text = text
        this.id = id
    },

    delete: function() {
        debug('Deleting note.')
        let index = get_id_index(this.dashboard.notes, this.id)
        this.dashboard.notes.splice(index, 1)
        this.dashboard.save()
    },

    save: function() {
        if (this.dashboard.id == null)
            throw 'You must set the Dashboard object\'s ID before adding a note.'

        if (this.id == null) {
            this._create()
        } else {
            this._update()
        }
    },

    _create: function() {
        debug('Creating note.')
        let next_available_id = get_max_id(this.dashboard.notes) + 1
        this.dashboard.notes.push({
            id: next_available_id,
            text: this.text,
        })
        this.dashboard.save()
        this.id = next_available_id
    },

    _update: function() {
        debug('Updating note.')
        let index = get_id_index(this.dashboard.notes, this.id)

        this.dashboard.notes[index] = {
            id: this.id,
            text: this.text,
        }

        this.dashboard.save()
    },
}
