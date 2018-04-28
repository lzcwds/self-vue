function SelfVue(options) {
    var self = this;
    this.vm = this;
    this.data = options.data;
    this.methods = options.methods;
    Object.keys(this.data).forEach(function (key) {
        self.proxyKeys(key);
    })
    Object.keys(this.methods).forEach(function (method) {
        self.proxyMethods(method);
    })
    observe(this.data);

    new Compile(options.el, this.vm);
//        el.innerHTML = this.data[exp];
//        new Watcher(this, exp, function (value) {
//            el.innerHTML = value;
//        })
    options.mounted.call(this);
    return this;
}

SelfVue.prototype = {
    //代理 把data属性绑定到SelfVue对象上
    proxyKeys: function (key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function () {
                return self.data[key];
            },
            set: function (val) {
                self.data[key] = val;
            }
        })
    },
    //方法代理
    proxyMethods:function (method) {
        var self = this;
        Object.defineProperty(this,method,{
            enumerable: false,
            configurable: true,
            get: function () {
                return self.methods[method];
            }
        })
    }
}

//监听器
function defineReactive(data, key, value) {
    observe(value);
    var dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            if (Dep.target) {
                dep.addSubs(Dep.target)
            }
            return value;

        },
        set: function (val) {
            if (value === val) {
                return;
            }
            value = val;
            dep.notify();
        }
    })

}

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }

    Object.keys(data).forEach(function (key) {
        defineReactive(data, key, data[key])
    })

}

//消息订阅器 Dep
function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSubs: function (sub) {
        this.subs.push(sub)
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        })
    }
}

//Watcher
function Watcher(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get()
}

Watcher.prototype = {
    update: function () {
        this.run();
    },
    run: function () {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function () {
        Dep.target = this;
        var value = this.vm.data[this.exp];
        Dep.target = null;
        return value;
    }
}

















