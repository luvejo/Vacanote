const Extension = imports.misc.extensionUtils.getCurrentExtension()

const DashboardDetailView = Extension.imports.views.dashboard_detail.DashboardDetailView


let routes = [
    {
        name: 'dashboard-detail',
        view: DashboardDetailView,
    },
]
