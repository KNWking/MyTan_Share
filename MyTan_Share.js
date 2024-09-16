// ==UserScript==
// @name         MyTan 一键分享对话
// @namespace    https://knwking.com/
// @version      0.1.1
// @description  通过快捷键 Alt+S 触发，根据页面 URL 中的对话 ID 下载相应的 JSON 文件，并将其转换为 TXT 文件下载
// @author       KNWking
// @match        https://mytan.maiseed.com.cn/*  // 适配整个域名下的所有路径
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 添加事件监听器来监听按键事件
    window.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 's') {
            // 阻止默认行为
            event.preventDefault();

            // 仅在 chat 页面上执行脚本逻辑
            if (!window.location.href.includes('/chat/')) {
                return;
            }

            // 从本地存储中获取 token
            const tokenObject = JSON.parse(localStorage.getItem('chat-tan-token'));
            const token = tokenObject ? tokenObject.token : null;

            if (!token) {
                console.error("No token found in local storage");
                return;
            }

            // 从当前页面 URL 中提取对话 ID
            const currentUrl = window.location.href;
            const conversationIdMatch = currentUrl.match(/\/chat\/([^\/?]+)/);

            // 确保获取到了对话 ID
            if (conversationIdMatch && conversationIdMatch[1]) {
                const conversationId = conversationIdMatch[1];
                // 构建目标请求的 URL
                const targetUrl = `https://mytan.maiseed.com.cn/api/v1/messages?conversation_id=${conversationId}`;

                // 使用 Fetch API 发送请求获取 JSON 数据
                fetch(targetUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // 如果需要发送 cookie
                })
                .then(response => {
                    // 检查响应是否成功
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    // 将响应解析为 JSON 格式
                    return response.json();
                })
                .then(data => {
                    // 调用转换并下载 TXT 函数
                    convertAndDownloadTxt(data);
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
     * 转换并下载TXT文件的函数
     * @author lc6464
     * @namespace https://lcwebsite.cn/
     * @param {Object} data - JSON数据对象
     */
    function convertAndDownloadTxt(data) {
        const roleMapping = {
            "USER": "用户",
            "ASSISTANT": "助手",
            "SYSTEM": "系统"
        };

        let output = '';

        data.data.messages.forEach(message => {
            const role = roleMapping[message.role] || message.role;
            const updatedTime = new Date(message.updated_time).toLocaleString();
            const content = message.content;

            if (role === "系统") {
                output += `[系统消息 (${updatedTime})] ${content}\n`;
            } else {
                output += `${role} (${updatedTime}):\n${content}\n`;
            }

            output += "\n\n";  // 在每条消息之间添加空行
        });

        download('content.txt', output);
    }

    /**
     * 下载文件的函数
     * @param {string} filename - 要保存的文件名
     * @param {string} text - 文件内容
     */
    function download(filename, text) {
        // 创建一个 Blob 对象保存文本内容
        const blob = new Blob([text], { type: 'text/plain' });
        
        // 创建一个对象 URL
        const url = URL.createObjectURL(blob);
        
        // 创建一个隐藏的<a>元素用于触发下载
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', filename);

        // 将元素隐藏到页面中
        element.style.display = 'none';
        document.body.appendChild(element);

        // 程序化地点击这个元素以触发下载
        element.click();

        // 完成下载后移除这个元素
        document.body.removeChild(element);

        // 释放 URL 对象
        URL.revokeObjectURL(url);
    }
})();
