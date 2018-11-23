/**
 * 编译解析
 * @param el
 * @param vm
 * @constructor
 */
function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
    // this.compileElement(document.querySelector(el));
}

Compile.prototype = {
    init: function () {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function (el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while (child) {
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function (el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function (node) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            //属性绑定
            if (node.nodeType == 1) {
                self.compile(node);
            }
            //对{{}}这种形式进行数据绑定
            if (node.nodeType == 3 && reg.test(text)) {
                self.compileText(node, text, reg);
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        })
    },
    compileText: function (node, text, reg) {
        var self = this;
        var exp = reg.exec(text)[1].trim();
        var regPoint =/\./;
        if(regPoint.test(exp)){
            var obj =exp.split('.');
            var initObject = this.vm[obj[0]];
            initObject = typeof initObject != 'object' ? {} : initObject;
            this.updateText(node, initObject[obj[1]]);
        }else{
            var initText = this.vm[exp];
            initText = typeof initText == 'undefined' ? '' : initText;
            this.updateText(node, text.replace(reg, initText));
        }
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, text.replace(reg, this.vm[exp]));
        });

    },
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    compile: function (node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function (attr) {
            var attrName = attr.name;
            if (attrName.indexOf('v-') == 0) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (dir.split(':')[0] == 'on') {//事件绑定
                    self.compileEvent(node, self.vm, exp, dir);
                } else if (dir.split(':')[0] == 'model') {  // v-model 指令
                    self.compileModel(node, self.vm, exp);
                } else if (dir.split(':')[0] == 'if') {
                    self.compileIf(node,self.vm,exp)
                }
                node.removeAttribute(attrName);
            }

        })
    },
    compileModel: function (node, vm, exp) {
        var self = this;
        var text = this.vm[exp];

        if (node.type == 'text' || node.type == 'textarea') {
            node.value = text;
        }
        if (node.type == 'checkbox') {
            node.checked = text;
        }
        new Watcher(this.vm, exp, function (value) {
            if (node.type == 'text' || node.type == 'textarea') {
                node.value = value;
            }
            if (node.type == 'checkbox') {
                node.checked = value;
            }
        });
        // var cpLock = false;
        // node.addEventListener('compositionstart', function(e){
        //     cpLock = true;
        // })
        // node.addEventListener('compositionend', function(e){
        //     cpLock = false;
        //     self.vm[exp] = e.target.value;
        // })
        if (node.type == 'text' || node.type == 'textarea') {
            node.addEventListener('input', function (e) {
                self.vm[exp] = e.target.value;
            }, false);
        } else {
            node.addEventListener('click', function (e) {
                self.vm[exp] = e.target.checked;
            }, false)
        }


    },
    compileEvent: function (node, vm, exp, dir) {
        // on:click
        var eventName = dir.split(':')[1];
        if (eventName) {
            node.addEventListener(eventName, this.vm[exp].bind(vm));
        }

    },
    compileIf: function (node, vm, exp) {
        var initText = this.vm[exp];
        if(initText === true){
            node.style.visibility ='inherit';
        }else{
            node.style.visibility = 'hidden';
        }
        new Watcher(this.vm, exp, function (value) {
            if(value ===true){
                node.style.visibility ='inherit';
            }else{
                node.style.visibility = 'hidden';
            }
        });
    }
}