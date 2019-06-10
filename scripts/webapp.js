var Webapp= {
    currentTimestamp : 0, //系统时间戳
    getUrlParam: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    },
    post : function (url, data, success, error, before_fn, complete_fn) {
        
        /* 添加subtime参数 */
        /*if (data && (typeof(data) == "object")) {
            data.subtime = new Date().getTime();
            if(!!xl.getCookie('csrf-token')){
                data.csrftoken = xl.getCookie('csrf-token')
            }
        } else {
            if(!xl.getCookie('csrf-token')){
                data = { subtime: (new Date().getTime())};
            }else{
                data = { subtime: (new Date().getTime()), csrftoken: xl.getCookie('csrf-token')};
            }				
        }*/
        
        /* 超时处理 */
        var timeOut = true;
        setTimeout(function() { if (timeOut && error) error(); }, 10000);
    
        $.ajax({ url: url, type: "post", data: data, dataType: "json",

            beforeSend: function(){
                if(before_fn && typeof before_fn == 'function'){
                    before_fn();
                }
            },

            complete: function(){
                if(complete_fn && typeof complete_fn == 'function'){
                    complete_fn();
                }
            },

            success: function (rtnData,status,xhr) {
                timeOut = false;
                if (success) { 
                    success(rtnData,status,xhr); 
                }
                /*if (rtnData.status == 302) {
                    if (rtnData.desc) { alert(rtnData.desc); }
                    if (rtnData.result) { window.location.href =  rtnData.result; }	
                } 
                else if (rtnData.status == 200) {
                    if (success) { success(rtnData,status,xhr); }
                }
                else {
                    if (error) { error(rtnData); } else if (rtnData.desc) { alert(rtnData.desc); }
                }*/
            },
            error: function (rtnData, textStatus, errorThrown) {
                timeOut = false;
                if(rtnData.readyState == 4) { 
                    if (error){ 
                        error(rtnData) 
                    }else {
                        if(rtnData.status == 401){
                            //Webapp.loginPage(rtnData, textStatus, errorThrown);
                        }else{
                            alert("服务繁忙,请稍后重试！"); 
                        }
                    } 
                }
            }
        });
    },
    
    get : function (url, data, success, error) {
        var timeOut = false; var ok = false;

        if(data){
            /* 添加subtime参数 */
            if (data && (typeof(data) == "object")) {
                data.subtime = new Date().getTime();
                if(!!xl.getCookie('csrf-token')){
                    data.csrftoken = xl.getCookie('csrf-token')
                }
            } else {
                if(!xl.getCookie('csrf-token')){
                    data = { subtime: (new Date().getTime())};
                }else{
                    data = { subtime: (new Date().getTime()), csrftoken: xl.getCookie('csrf-token')};
                }				
            }
            url += '?';
            var dataList = [];
            for(var i in data){
                dataList.push(i + '=' + data[i] );
            }
            url += dataList.join('&');
        }	
        $.getJSON(url, function(data) {				
            if(!timeOut) { ok = true; success(data); }
        });

        setTimeout(function() {				
            if (!ok) { timeOut = true; if (error) error(); }
        }, 10000);
    },

    async:function(_, e, n, t) {
        var i = !0;
        if (e && (typeof(e) == "object")) {
            e.subtime = new Date().getTime();
            if(!!xl.getCookie('csrf-token')){
                e.csrftoken = xl.getCookie('csrf-token')
            }
        } else {
            if(!xl.getCookie('csrf-token')){
                e = { subtime: (new Date().getTime())};
            }else{
                e = { subtime: (new Date().getTime()), csrftoken: xl.getCookie('csrf-token')};
            }				
        }	
        setTimeout(function() {
            i && t && t(0)
        }
        , 1e4),
        $.ajax({
            url: _,
            data: e,
            async: !1,
            success: function(_) {
                i = !1,
                302 == _.status ? (_.result && (location = Domain.base + _.result)) : n && n(_) 
            },
            error: function(_) {
                i = !1,
                t ? t(_) : location = '/500.html'
            },
            dataType: "json"
        })
    },
    
    getJsonData:function(_, e, n) {
        var t = !1
          , i = !1;
        $.getJSON(_, function(_) {
            t || (i = !0,
            e(_))
        }
        ),
        setTimeout(function() {
            i || (t = !0,
            n && n(0))
        }
        , 1e4)
    },
    // loading
    getLoading: function() {
        return '<div class="loading txtC pt30"><img style="width:200px;" src="static/img/pic/loading.gif" /></div>';
    },
    /**
     * 校验用户名|手机号|邮箱是否存在
     * @param {Object} type  验证类型 （username-用户名 | phone-手机号 | email-邮箱 | invite_userid-邀请用户 | vcode-验证码）
     * @param {Object} param 验证参数
     * @param {Object} callback 返回函数（y-验证成功 | 其他-验证失败）
     */
    checkIsExist : function(type, param, callback){
        var _this = Webapp;
        $.ajax({
            type : "get",
            url : Service.auth_checker+"?type="+type,
            cache : false,
            async: !1,
            data : 'param='+param,
            success : function(data){
                var status = data=='y' ? true : false;					
                callback({'status':status, 'txt':data});
            },
            dataType : 'text'
        });
    },
    // 动态加载JS(支持多个js请求)
    // url:可为字符串或者数组
    // zxy 20151126
    // callback:回调函数 （所有请求JS加载完毕后 调用）
    dynamicLoad : function(url,callback) {
        var type = url instanceof Array,
            num = 0,
            len = 0;
        if(type){
            len = url.length;
            for( i in url){
                loadFn(url[i]);
            }
        }else{
            loadFn(url);
        }
        function loadFn(url){
            var _doc = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', url);
            _doc.appendChild(script);
            script.onload = script.onreadystatechange = function() {
                if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
                    num ++;
                    if(type && num >= len){
                        callback && callback();
                    }else{
                        if(!type){
                            callback && callback();
                        }
                    }
                    script.onload = script.onreadystatechange = null;
                }
            }
        }
    },
    /**
     * 头像路径
     * size分为small、middle和big三种
     */
    getAvatarPath : function(size){
        var path = '';
        if(!size){ 
            path = '/static/img/bg/user.png';//默认头像
        }
        if(Webapp.userInformation && size){
            path =  Domain.img + '/data/avatar/' + Webapp.userInformation.userid + '_avatar_'+size+'.jpg';
        }
        return path;
    },
    /*
     * 复制对象(浅拷贝)
     * @parent(被继承对象)@child(继承对象)
     * zxy 20160326
     */ 
    extend : function(parent,child){
        var i;
        child = child || {};
        for (i in parent) {
            if (parent.hasOwnProperty(i)) {
                child[i] = parent[i];
            }
        }
        return child;
    },
    /*
     * 复制对象(深度拷贝)(引用类型会声明型新的空间)
     * @parent(被继承对象)@child(继承对象)
     * zxy 20160326
     */ 
    extendDeep:function(parent,child){
        var i,
            toStr = Object.prototype.toString,
            astr = "[object Array]";

        child = child || {};

        for (i in parent) {
            if (parent.hasOwnProperty(i)) {
                if (typeof parent[i] === 'object') {
                    child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
                    extendDeep(parent[i], child[i]);
                } else {
                    child[i] = parent[i];
                }
            }
        }
        return child;
    },
    /*
     * 返回数组中最大数字
     * @arr[数组]
     * zxy 20160326
     */ 
    maxNum:function(arr){
        return Math.max.apply(null,arr);
    },
    /*
     * 对象按某属性排序
     * @objArr {Array} (对象数组)
     * @objAtt {String} (对象属性名)
     * @type {String} {ascend 升序}{descend 降序}
     * zxy 20160326 
     */ 
    objSort:function(objArr,objAtt,type){
        var arr = [],
            arr2 = {};
        if(objArr.constructor !== Array){
            console.error('objArr must be an array !');
            return objArr
        }
        if(!objAtt){
            console.error('objAtt is undefined !');
            return objArr
        }
        for( var i = 0, len = objArr.length; i < len ; i++ ){
            if(objArr[i][objAtt]){
                arr.push(objArr[i][objAtt]);
                arr2[objArr[i][objAtt]] = objArr[i];
            }else{
                console.error('objArr ' + (i + 1) + 'is null');
                return objArr
            }
        }
        arr.sort(function(a,b){
            return type == 'ascend' ? (a-b) : (b-a)
        });
        objArr = [];
        for(var i = 0 ; i < len ; i++){
            objArr[i] = arr2[arr[i]];
        }
        arr2 = null;
        return objArr
    },
    /*
     * 块注释解决字符串拼接
     * @fn {function} (包含块注释的函数)
     * zxy 20160330 
     */ 
    multiline:function(fn){
        var reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)[ \t]*\*\//;
        var match = reCommentContents.exec(fn.toString());
     
        if (!match) {
            throw new TypeError('Multiline comment missing.');
        }
     
        return match[1];
    },
    /**
     * 显示bootstrap loading
     */
    sbtLoading: function(){
        if(Webapp.isLoading){
            $('.loading-container').show();
            $('.loading-progress').show();
        }else{
            indexClose=layer.load(2,{
                  shade: [0.5,'#FFF'] 
            });
        }
    },
    /**
     * 隐藏bootstrap loading
     */
    hbtLoading: function(){
        if(Webapp.isLoading){
            $('.loading-container').hide();
            $('.loading-progress').hide();
        }else{
            layer.close(indexClose);
        }
    }
}