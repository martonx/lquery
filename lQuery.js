const $ = (function () {
    //Private functions

    // http://stackoverflow.com/questions/2837542/is-it-possible-to-remove-all-event-handlers-of-a-given-element-in-javascript?rq=1
    const regEventEx = function (el, eventName, funct) {
        if (el.attachEvent) {
            el[`e${eventName}${funct}`] = funct;
            el[eventName + funct] = function () { el[`e${eventName}${funct}`](window.event); }
            el.attachEvent(`on${eventName}`, el[eventName + funct]);
        } else {
            el.addEventListener(eventName, funct, false);
        }

        if (!el.eventHolder) el.eventHolder = [];
        el.eventHolder[el.eventHolder.length] = new Array(eventName, funct);
    }

    const removeEvent = function (obj, type, fn) {
        if (obj.detachEvent) {
            obj.detachEvent(`on${type}`, obj[type + fn]);
            obj[type + fn] = null;
        } else {
            obj.removeEventListener(type, fn, false);
        }
    }

    const removeEventsByTypeEx = function (el, eventType) {
        if (el.eventHolder) {

            let removed = 0;
            for (let i = 0; i < el.eventHolder.length; i++) {
                if (el.eventHolder[i][0] == eventType) {
                    removeEvent(el, eventType, el.eventHolder[i][1]);
                    el.eventHolder.splice(i, 1);
                    removed++;
                    i--;
                }
            }

            return (removed > 0) ? true : false;
        } else {
            return false;
        }
    }

    const forEachElementAddClass = function (arrayLikeObject, className) {
        forEach(arrayLikeObject, (element, index) => {
            element.addClass(className);
        });
    }

    const forEachElementRemoveClass = function (arrayLikeObject, className) {
        forEach(arrayLikeObject, (element, index) => {
            element.removeClass(className);
        });
    }

    const forEachElementToggleClass = function (arrayLikeObject, className) {
        forEach(arrayLikeObject, (element, index) => {
            element.toggleClass(className);
        });
    }

    //Public functions

    const querySelectAll = function (query) {
        return document.querySelectorAll(query);
    }

    // Usage:
    // optionally change the scope as final parameter too, like ECMA5
    // you can use it against every kind of Collections (Arrays, NodeList etc.)
    //var myNodeList = document.querySelectorAll('li');
    //$.forEach(myNodeList, (element, index) => {
    //    console.log(index, element); // passes index + element back!
    //});
    const forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, array[i], i); // passes back stuff we need
        }
    };

    const serializeToQueryStringParams = function (obj) {
        let str = [];
        for (let p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }

        return '?' + str.join('&');
    }


    // $.i().attr('prop', 'value') support
    window.Element.prototype.attr = function (name, value) {
        if (value) {
            this.setAttribute(name, value);
            return this;
        } else {
            return this.getAttribute(name);
        }
    };

    // $.i().css('prop', 'value') support
    window.Element.prototype.css = function (prop, value) {
        if (value) {
            this.style[prop] = value;
            return this;
        } else {
            return this.style[prop];
        }
    };

    
    window.Element.prototype.on = function (eventType, callback) {
        eventType = eventType.split(' ');
        for (let i = 0; i < eventType.length; i++) {
            this.addEventListener(eventType[i], callback);
        }
        return this;
    };

    window.NodeList.prototype.on = function (eventType, callback) {
        forEach(this, (element, index) => {
            element.on(eventType, callback);
        });
        return this;
    };

    // $.i().on('event', function(el){}); //TODO: modify it to promise
    // $.i().on('click', 'span', function(el){}); //TODO: modify it to promise
    window.Element.prototype.on = function (eventType, selector, callback) {
        if (typeof selector === "function") {
            eventType = eventType.split(' ');
            for (let i = 0; i < eventType.length; i++) {
                this.addEventListener(eventType[i], selector);
            }
            return this;
        }

        const targetNodeList = this.querySelectorAll(selector);
        targetNodeList.on(eventType, callback);

        return this;
    };

    // $.i().off('event', function(el){}); //TODO: modify it to promise
    window.Element.prototype.off = function (eventType, callback) {
        eventType = eventType.split(' ');
        for (let i = 0; i < eventType.length; i++) {
            this.removeEventListener(eventType[i], callback);
        }
        return this;
    };

    // $.i('container').don('event', '.selector', function(el){}); //TODO: modify it to promise
    window.Element.prototype.don = function (eventType, selector, callback) {
        regEventEx(this, eventType, function (event) {
            const elements = querySelectAll(selector);

            let isMatch = false;
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === event.target) {
                    isMatch = true;
                    break;
                }
            }

            if (isMatch) {
                callback && callback(event);
            }
        });

        return this;
    };

    // $.i('container').doff('event'); //TODO: modify it to promise
    window.Element.prototype.doff = function (eventType) {
        removeEventsByTypeEx(this, eventType);

        return this;
    };

    window.NodeList.prototype.on = function (eventType, callback) {
        forEach(this, (element, index) => {
            element.on(eventType, callback);
        });
        return this;
    };

    // $.i().addClass('name');
    window.Element.prototype.addClass = function (className) {
        this.classList.add(className);
        return this;
    };

    window.NodeList.prototype.addClass = function (className) {
        forEachElementAddClass(this, className);
        return this;
    };

    // $.i().removeClass('name');
    window.Element.prototype.removeClass = function (className) {
        this.classList.remove(className);
        return this;
    };

    window.NodeList.prototype.removeClass = function (className) {
        forEachElementRemoveClass(this, className);
        return this;
    };

    window.Element.prototype.hasClass = function (className) {
        return this.classList.contains(className);
    };

    // $.i().toggleClass('name');
    window.Element.prototype.toggleClass = function (className) {
        if (this.hasClass(className)) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }
    }

    window.NodeList.prototype.toggleClass = function (className) {
        forEachElementToggleClass(this, className);
        return this;
    };

    // $.i().show(); WARNING if you don't use this with correct displayType, you can break your layout
    window.Element.prototype.show = function (displayType = '') {
        this.style.display = displayType;
    }

    window.Element.prototype.hide = function () {
        this.style.display = 'none';
    }

    Array.prototype.addClass = function (className) {
        forEachElementAddClass(this, className);
        return this;
    };

    Array.prototype.removeClass = function (className) {
        forEachElementRemoveClass(this, className);
        return this;
    };

    Array.prototype.toggleClass = function (className) {
        forEachElementToggleClass(this, className);
        return this;
    };

    return {
        i: function (id) {
            return document.getElementById(id);
        },
        c: function (name) {
            return Array.from(document.getElementsByClassName(name));
        },
        t: function (tagName) {
            return document.getElementsByTagName(tagName);
        },
        q: querySelectAll,
        get: function (url, data) {
            if (data) {
                url += serializeToQueryStringParams(data);
            }
            return fetch(url,
                {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => response.text());
        },
        post: function (url, data) {
            let formData = new FormData();

            for (var name in data) {
                formData.append(name, data[name]);
            }

            return fetch(url,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                })
                .then(response => response.json());
        },
        forEach: forEach,
        getJson: function (url, data) {
            if (data) {
                url += serializeToQueryStringParams(data);
            }
            return fetch(url,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(res => res.json());
        },
        postJson: function (url, model) {
            model = model || {};

            return fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(model)
                })
                .then(res => res.json());
        }
    }
})();