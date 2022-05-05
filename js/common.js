// 为img标签添加class属性
$("img").wrap('<div class="style-center"></div>')

// 判断空
function isEmpty(param){
    if (param == null || param == undefined || param == "") {
        return true;
    }
    return false;
}