const Extension = imports.misc.extensionUtils.getCurrentExtension()

const DashboardDetailView = Extension.imports.views.dashboard_detail.DashboardDetailView
const DashboardListView = Extension.imports.views.dashboard_list.DashboardListView


let routes = [
    {
        name: 'dashboard-detail',
        view: DashboardDetailView,
    },
    {
        name: 'dashboard-list',
        view: DashboardListView,
    },
]
