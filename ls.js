var LsJsCss = window.LsJsCss || {};
LsJsCss = {
    //动态加载js文件并缓存
    loadJs: function(name, source, callback) {
        name = 'js_'+name;
        name_version = 'js_'+name+'_ver';
        if (window.localStorage) {
            var xhr;
            var js = localStorage.getItem(name);
            if (js == null || js.length == 0 || source.version != localStorage.getItem(name_version)) {
                if (window.ActiveXObject) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } else if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                }
                if (xhr != null) {
                    xhr.open("GET", source.url+'?ver='+source.version);
                    xhr.send(null);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            js = xhr.responseText;
                            localStorage.setItem(name, js);
                            localStorage.setItem(name_version, source.version);
                            js = js == null ? "" : js;
                            LsJsCss.writeJs(js);
                            if (callback != null) {
                                callback(); //回调，执行下一个引用
                            }
                        }
                    };
                }
            } else {
                LsJsCss.writeJs(js);
                if (callback != null) {
                    callback(); //回调，执行下一个引用
                }
            }
        } else {
            LsJsCss.linkJs(url);
        }
    },
    loadCss: function(name, source) {
        name = 'css_'+name;
        name_version = 'css_'+name+'_ver';
        if (window.localStorage) {
            var xhr;
            var css = localStorage.getItem(name);
            if (css == null || css.length == 0 || source.version != localStorage.getItem(name_version)) {
                if (window.ActiveXObject) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } else if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                }
                if (xhr != null) {
                    xhr.open("GET", source.url+'?ver='+source.version);
                    xhr.send(null);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            css = xhr.responseText;
                            localStorage.setItem(name, css);
                            localStorage.setItem(name_version, source.version);
                            css = css == null ? "" : css;
                            css = css.replace(/images\//g, "style/images/"); //css里的图片路径需单独处理
                            LsJsCss.writeCss(css);
                        }
                    };
                }
            } else {
                css = css.replace(/images\//g, "style/images/"); //css里的图片路径需单独处理
                LsJsCss.writeCss(css);
            }
        } else {
            LsJsCss.linkCss(url);
        }
    },
    //往页面写入js脚本
    writeJs: function(text) {
        var head = document.getElementsByTagName('HEAD').item(0);
        var link = document.createElement("script");
        link.type = "text/javascript";
        link.innerHTML = text;
        head.appendChild(link);
    },
    //往页面写入css样式
    writeCss: function(text) {
        var head = document.getElementsByTagName('HEAD').item(0);
        var link = document.createElement("style");
        link.type = "text/css";
        link.innerHTML = text;
        head.appendChild(link);
    },
    //往页面引入js脚本
    linkJs: function(url, callback) {
        var head = document.getElementsByTagName('HEAD').item(0);
        var link = document.createElement("script");
        link.type = "text/javascript";
        link.src = url;
        link.onload = function(){
            callback && callback();
        }
        head.appendChild(link);
    },
    //往页面引入css样式
    linkCss: function(url) {
        var head = document.getElementsByTagName('HEAD').item(0);
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.rev = "stylesheet";
        link.media = "screen";
        link.href = url;
        head.appendChild(link);
    }
}
