$(function(){
    'use strict';

    var initPageNum = 1;
    pageIndex(initPageNum);
    

    function pageIndex(pageNum){
        pageNum = isNaN(Number(pageNum)) ? 1 : pageNum;
        //window.location.replace
        var _url = 'http://localhost:8080/index?pageNum='+pageNum;
        var _prefix = 'http://127.0.0.1/';
        Webapp.post(_url, null, function(result){
            if(result.success){
                var data = result.data;
                var colTempleteSource = $('#col-template').html();
                console.log(data);
        
                generatorPager(data);
    
                //$('#pageNum').text(data.pageNum);
                //$('#pageTotal').text(data.pages);
    
               $('.forum-18-thumbnail-container').empty();
                
                var colTemplete = Handlebars.compile(colTempleteSource);
                var colArray = [];
                for(var i = 0; i < data.list.length; i++){
                    var obj = data.list[i];
                    var context = {
                        title: obj.title, alt: obj.title, view: 999, imgCount: 88, date: '2019-06-06', src: _prefix+obj.thumbnailPath
                    };
                    colArray.push(context);
                    if((i+1) % 4 == 0){
                        var jqRowHtml = $('<div class="row" style="margin-bottom: 20px;"></div>');
                        for(var j = 0; j < 4; j++){
                            var colTempleteContext = colArray[j];
                            var colHtml  = colTemplete(colTempleteContext);
                            jqRowHtml.append(colHtml);
                        }
                        //$('.forum-18-thumbnail-container').append(jqRowHtml);
    
                        colArray.splice(0, colArray.length);
                    }
                }
            }
        });
    }

    function generatorPager(pageObj){
        var pagerUl = $('.pagination');//.append('<li class="page-item"><a class="page-link" href="javascript:void(0)">1</a></li>');

        pagerUl.empty();

        if(pageObj.pageNum != 1){
            pagerUl.append('<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page-idx="'+Number(pageObj.pageNum-1)+'">上一页</a></li>');
        }

        if(pageObj.pages > 5){
            // 核心在于当前页减去2如果大于等于3且不是4的情况下就出现 [...]
            var startNum = (pageObj.pageNum - 2);
            if(startNum >= 3){
                pagerUl.append('<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page-idx="'+Number(1)+'">1</a></li>');
                pagerUl.append('<li class="page-item disabled" style="cursor: not-allowed"><a class="page-link" href="javascript:void(0)">...</a></li>');
            }

            // 4这个页数比较特殊，4-2=2，必须置位1，否则该从第二页开始了，其余的页码则没有该问题。
            if(pageObj.pageNum == 4){
                startNum = 1;   
            }

            if(startNum > pageObj.pages){
                startNum = (pageObj.pages - 2);
            }

            var stopNum = (pageObj.pageNum + 2);
            stopNum = stopNum > pageObj.pages ? pageObj.pages : stopNum;

            // 考虑当前页码为1和2的情况
            startNum = pageObj.pageNum <= 2 ? 1 : startNum;
            stopNum = stopNum < 5 ? 5 : stopNum; 
      
            //console.log(startNum, stopNum);

            var _pageNum = pageObj.pageNum > pageObj.pages ? pageObj.pages : pageObj.pageNum;

            for(var i = startNum; i <=stopNum; i++){
                if(_pageNum == i){
                    pagerUl.append('<li class="page-item disabled" style="cursor: not-allowed"><a class="page-link" href="javascript:void(0)">'+i+'</a></li>');
                }else{
                    pagerUl.append('<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page-idx="'+Number(i)+'">'+i+'</a></li>');
                }
            }

            if((pageObj.pageNum+2) < pageObj.pages){
                pagerUl.append('<li class="page-item disabled" style="cursor: not-allowed"><a class="page-link" href="javascript:void(0)">...</a></li>');
            }
        }else{
            // 页数<=5的情况
            for(var i = 1; i <= pageObj.pages; i++){
                if(pageObj.pageNum == i){
                    pagerUl.append('<li class="page-item disabled" style="cursor: not-allowed"><a class="page-link" href="javascript:void(0)">'+i+'</a></li>');
                }else{
                    pagerUl.append('<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page-idx="'+Number(i)+'">'+i+'</a></li>');
                }
            }
        }

        // 下一页
        if(pageObj.pageNum == pageObj.pages){
            pagerUl.append('<li class="page-item disabled" style="cursor: not-allowed"><a class="page-link" href="javascript:void(0)">下一页</a></li>');
        }else{
            pagerUl.append('<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page-idx="'+Number(pageObj.pageNum+1)+'">下一页</a></li>');
        }

        $('.page-link').on('click', function(){
            var pageNum = $(this).attr('data-page-idx');
            if(!isNaN(Number(pageNum))){
                pageIndex(pageNum);
            }
        });
    }
});