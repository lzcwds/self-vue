function Router(options) {
    this.routes = {};
    this.currentURL = {};
    var self = this;
    options.routes.forEach(function (index) {
        self.route(index);
    })
    self.init();
}

Router.prototype = {
    init: function () {
        window.addEventListener('load', this.refresh.bind(this), false);
        window.addEventListener('hashchange', this.refresh.bind(this), false);
    },
    route: function (option) {
        this.routes[option.path] =option.component;
    },
    refresh: function () {
        this.currentURL = this.getParamsUrl();
        if (this.routes[this.currentURL.path]) {
            this.asyncFun(this.routes[this.currentURL.path]);
        } else {
            //路由不存在
            location.hash = '/';
            this.getContent('');
        }

    },
    getParamsUrl: function () {
        var hashDetail = location.hash.split("?"),
            hashName = hashDetail[0].split("#")[1],//路由地址
            params = hashDetail[1] ? hashDetail[1].split("&") : [],//参数内容
            query = {};
        for (var i = 0; i < params.length; i++) {
            var item = params[i].split("=");
            query[item[0]] = item[1]
        }
        return {
            path: hashName,
            query: query
        }
    },
    asyncFun: function (component) {
        var text = component.template;
        this.getContent(text);
    },
    getContent:function (text) {
        var father = document.getElementsByTagName('router-view');
        if (father && father.length != 0) {
            father[0].outerHTML = '<div id="router_view"></div>';
        }
        var routerLink = document.getElementById('router_view');
        routerLink.innerHTML = text;
    }

}
