// ==UserScript==
// @name         MyTan 一键分享工具
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  通过快捷键 Alt+S 触发，导出当前对话为 txt 文件
// @author       KNWking
// @match        https://mytan.maiseed.com.cn/chat/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 添加事件监听器来监听按键事件
    window.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 's') {
            // 阻止默认行为
            event.preventDefault();

            // 从当前页面URL中提取对话ID
            const currentUrl = window.location.href;
            const conversationIdMatch = currentUrl.match(/\/chat\/([^\/?]+)/);

            // 确保获取到了对话ID
            if (conversationIdMatch && conversationIdMatch[1]) {
                const conversationId = conversationIdMatch[1];
                // 构建目标请求的URL
                const targetUrl = `https://mytan.maiseed.com.cn/api/v1/messages?conversation_id=${conversationId}`;

                /**
                 * 使用 Fetch API 发送请求获取JSON数据
                 */
                fetch(targetUrl)
                    .then(response => {
                        // 检查响应是否成功
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        // 将响应解析为JSON格式
                        return response.json();
                    })
                    .then(data => {
                        // 调用下载函数，将JSON数据下载到本地
                        download(`conversation_${conversationId}.json`, JSON.stringify(data));
                    })
                    .catch(error => {
                        // 处理任何请求或解析过程中发生的错误
                        console.error("Error fetching JSON:", error);
                    });
            } else {
                console.error("No conversation ID found in URL");
            }
        }
    });

    /**
     * 下载文件的函数
     * @param {string} filename - 要保存的文件名
     * @param {string} text - 文件内容
     */
    function download(filename, text) {
        // 创建一个隐藏的<a>元素用于触发下载
        const element = document.createElement('a');
        // 使用data URI方案创建一个JSON文件
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
        // 设置下载文件的名称
        element.setAttribute('download', filename);

        // 将元素隐藏到页面中
        element.style.display = 'none';
        document.body.appendChild(element);

        // 程序化地点击这个元素以触发下载
        element.click();

        // 完成下载后移除这个元素
        document.body.removeChild(element);
    }
})();
