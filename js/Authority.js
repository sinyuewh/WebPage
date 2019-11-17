//设置用户的权限
$(function() {
    var p1 = sessionStorage.permissions;
    $('[authority]').each(function(index, element) {
        var v1 = $(element).attr('authority');
        if (v1.indexOf("|") >= 0) {
            var v2 = v1.split("|");
            for (var i = 0; i < v2.length; i++) {
                if (p1.indexOf(v2[i]) >= 0) {
                    $(element).show();
                    break;
                }
            }
        }
        else {
            if (p1.indexOf(v1) >= 0) {
                $(element).show();
            }
        }
    });
});