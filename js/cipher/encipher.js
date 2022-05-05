// 添加加密按钮
var html = '<div style="margin-bottom: 1rem">'
    + '<div style="margin-bottom: 0.5rem">'
    + '<button type="button" onclick="openFile()" style="background-color:#D8D8D8;">上传原件</button>'
    + '<input type="text" id="fileNameText" readonly="readonly" style="border:0;background-color:#f0f0e8;padding-left:0.5rem">'
    + '<input type="file" id="uploadFile" class="style-hide" accept=".md"/>'
    + '</div>'
    + '<div>'
    + '<button type="button" onclick="encryptFile()" style="background-color:#D8D8D8;">加密文件</button>'
    + '</div>'
    + '</div>';
$("div.book-toc-content").prepend(html);

// 临时加密
// encryptText()
function encryptText() {
    var pwd = "";
    var key = "";

    var md5 = CryptoJS.MD5(key).toString().toUpperCase();
    console.log("MD5：" + md5);
    var ciphertext = encryptByAes(pwd, md5);
    console.log("AES：" + ciphertext);
    console.log("解密：" + decryptByAes(pwd, ciphertext));
}

// 打开文件
function openFile() {
    document.getElementById("uploadFile").click();
    $("#uploadFile").change(function () {
        var filePath = $("#uploadFile").val();
        if (filePath.indexOf(".md") != -1 && filePath.lastIndexOf("\\")) {
            var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1);
            $("#fileNameText").val(fileName);
        } else {
            return;
        }

        var file = document.getElementById("uploadFile").files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function () {
            var article = this.result;
            var articleHead = article.substring(0, article.indexOf("---", 10) + 3).replace('crypto: en', 'crypto: de');
            var articleBase64 = encodeBase64(article);
            $("#articleHead").remove();
            $("#articleBase64").remove();
            var html = '<div id="articleHead" class="style-hide">' + articleHead + '</div>\n'
                + '<div id="articleBase64" class="style-hide">' + articleBase64 + '</div>';
            $("div.book-page").append(html);
        }
    });
}

// 加密文件，并下载
function encryptFile() {
    var secretKey = getSecretKey();
    if (isEmpty(secretKey)) {
        return;
    }

    var fileName = $("#fileNameText").val();
    if (isEmpty(fileName)) {
        alert("请上传原文本文件！");
        return;
    }

    // 目录：catalog
    var catalogHtml = $("nav#TableOfContents").prop("outerHTML");
    var catalogBase64 = encodeBase64(catalogHtml);
    var catalogAes = encryptByAes(secretKey, catalogBase64);

    // 正文：content
    var contentHtml = $("article.markdown").prop("outerHTML");
    var contentBase64 = encodeBase64(contentHtml);
    var contentAes = encryptByAes(secretKey, contentBase64);

    // 文档：article
    var articleBase64 = $("#articleBase64").text();
    var articleAes = encryptByAes(secretKey, articleBase64);

    // 下载文件
    var articleBody = '<p id="catalogAes" class="style-hide">' + catalogAes + '</p>\n\n'
        + '<p id="contentAes" class="style-hide">' + contentAes + '</p>\n\n'
        + '<p id="articleAes" class="style-hide">' + articleAes + '</p>\n\n'
        + '<p id="fileName" class="style-hide">' + fileName + '</p>';
    var text = $("#articleHead").text() + "\n\n" + articleBody;
    var blob = new Blob([text], { type: "text/plain" });
    saveAs(blob, fileName);
}
