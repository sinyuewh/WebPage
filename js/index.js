$().ready(function(){
    $.ajax({
        type:'post',
        url:EX.NavList.navList,
        dataType:'json',
        async:false,
        success:function(data){
            var navList = " ",childLi = " ",childList=" ",childArray = [];
            var htmlObj = {},childHtmlObj = {};
            data.forEach(function (item,index) {
                childLi = " ";childList = " ";
                item.children.forEach(function (childItem,childIndex) {
                    childLi += '<li><a href="products/pro-detail.1.1.1.html?id='+childItem.count+'&menuid='+item.id+'">'+childItem.pname+'</a></li>';
                    childHtmlObj[index] = childLi;
                });
                if (childHtmlObj[index] != undefined){
                    htmlObj[index] = '<ul class="dropdown-menu">'+childHtmlObj[index]+'</ul>';
                }else {
                    htmlObj[index] = '<ul></ul>';
                }
                //navList +=   '<li class="dropdown openMenu"><a href="products/pro-detail.1.1.1.html?id=1&menuid='+item.id+'">'+item.cname+'</a>'+htmlObj[index]+'</li>';
                navList +=   '<li class="dropdown"><a href="products/pro-detail.1.1.1.html?id=1&menuid='+item.id+'">'+item.cname+'</a>'+htmlObj[index]+'</li>';
            });
            $("#armyMenu").html(navList);
        }
    });
    $.ajax({
        type:'post',
        url:EX.NavList.navlist2,
        dataType:'json',
        success:function(data){
            var navList = " ";
            data.forEach(function (item,index) {
                navList += '<li><a href="products/pro-detail.2.1.html?id=1&menuid='+item.id+'">'+item.cname+'</a></li>';
            });
            $("#anliMenu").html(navList);

        }
    });
    $.ajax({
        type:'post',
        url:EX.NavList.anlilist,
        dataType:'json',
        async:false,
        success:function(data){
            var anliList = " ",listArray = [];
            data.forEach(function (item,index) {
                listArray[index] = '<div class="image-box object-non-visible" data-animation-effect="fadeInLeft" data-effect-delay="300">'+
                    '									<div class="overlay-container">'+
                    '										<img src="'+item.image+'" alt="">'+
                    '									</div>'+
                    '									<div class="image-box-body">'+
                    '										<h4 class="title"><a href="case/case-detail-1.html?id='+item.id+'">'+item.title+'</a></h4>'+
                    '										<p>'+item.det+'</p>'+

                    '										<a href="case/case-detail-1.html?id='+item.id+'" class="link"><span>查看更多</span></a>'+
                    '									</div>'+
                    '								</div>';
            });
            listArray.forEach(function (item,index) {
                anliList += item;
            });
            anliList = '<div class="row"><div class="col-md-12"><h2 class="page-title text-center">公司案例</h2><div class="separator"></div><p class="lead text-center">COMPANY CASE</p><div class="owl-carousel carousel">'+anliList+'</div></div></div>';
            $("#anliList").html(anliList);
        }
    })
});