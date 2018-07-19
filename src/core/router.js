function Router() {
    this._routes = {}
}

Router.prototype = {
    register: function(name, view) {
        if (this._routes[name])
            throw 'There is a route with that name already'

        this._routes[name] = view
        view.hide()
    },

    route: function(name, kwargs) {
        for (let route in this._routes) {
            if (name == route) {
                this._routes[name].show(kwargs)
            } else {
                this._routes[route].hide()
            }
        }
    },
}
