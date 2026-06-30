(function () {
  function setStatus(message) {
    var status = document.getElementById('editor_status');
    if (status) status.textContent = message;
  }

  function formatSeconds(ms) {
    return Math.max(1, Math.round(ms / 1000)) + ' 秒';
  }

  function download(filename, content) {
    var blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var editor = document.getElementById('md_editor');
    if (!editor) return;

    var mode = window.__EDITOR_MODE__ || 'edit';
    var commandInput = document.getElementById('command_name');
    var command = window.__EDITOR_COMMAND__ || '';
    var source = window.__EDITOR_SOURCE__ || '';
    var draftKey = mode === 'create' ? 'linux-command-edit:add:v2' : 'linux-command-edit:' + command;
    var commandDraftKey = 'linux-command-edit:add-command:v2';
    if (mode === 'create') {
      localStorage.removeItem('linux-command-edit:add');
      localStorage.removeItem('linux-command-edit:add-command');
    }
    var draft = localStorage.getItem(draftKey);

    editor.value = draft || source;
    ['keydown', 'keypress', 'keyup'].forEach(function (eventName) {
      editor.addEventListener(eventName, function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.stopPropagation();
        }
      });
    });
    if (commandInput) {
      commandInput.value = localStorage.getItem(commandDraftKey) || '';
      commandInput.addEventListener('input', function () {
        localStorage.setItem(commandDraftKey, commandInput.value);
      });
    }
    editor.addEventListener('input', function () {
      localStorage.setItem(draftKey, editor.value);
    });

    function getCommandName() {
      if (commandInput) return commandInput.value.trim();
      return command || 'command';
    }

    function saveToServer(token, onWaiting) {
      var startedAt = Date.now();
      if (onWaiting) onWaiting('正在连接保存接口...');
      var sentTimer = setTimeout(function () {
        if (onWaiting) onWaiting('请求已发送，服务器正在写入 Markdown 并重新构建页面...');
      }, 300);
      return fetch('/api/save-md', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Edit-Token': token || ''
        },
        body: JSON.stringify({
          command: getCommandName(),
          md_path: window.__EDITOR_MD_PATH__ || '',
          create_new: mode === 'create',
          content: editor.value
        })
      }).then(function (response) {
        clearTimeout(sentTimer);
        if (onWaiting) onWaiting('接口已响应，正在读取保存结果...');
        return response.text().then(function (text) {
          var data = {};
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (error) {
              throw new Error('保存接口没有返回 JSON，请检查 Caddy 是否把 /api/save-md 转发到了 Node 服务。');
            }
          }
          if (!response.ok || !data.ok) {
            throw new Error(data.message || '保存失败，接口没有返回有效内容。');
          }
          return data;
        });
      }).catch(function (error) {
        clearTimeout(sentTimer);
        error.wait_ms = Date.now() - startedAt;
        throw error;
      });
    }

    document.getElementById('save_md').addEventListener('click', function () {
      var tokenKey = 'linux-command-edit-token';
      var token = localStorage.getItem(tokenKey) || '';
      var startedAt = Date.now();
      var waitingTimer = null;
      var waitingMessage = '正在连接保存接口...';

      function updateWaiting(message) {
        if (message) waitingMessage = message;
        setStatus(waitingMessage + ' 已等待 ' + formatSeconds(Date.now() - startedAt));
      }

      function startWaiting(message) {
        startedAt = Date.now();
        waitingMessage = message || waitingMessage;
        clearInterval(waitingTimer);
        updateWaiting(waitingMessage);
        waitingTimer = setInterval(function () {
          updateWaiting();
        }, 1000);
      }

      function stopWaiting() {
        clearInterval(waitingTimer);
        waitingTimer = null;
      }

      startWaiting('正在连接保存接口...');
      saveToServer(token, updateWaiting).catch(function (error) {
        if (!/令牌/.test(error.message || '')) throw error;
        stopWaiting();
        token = prompt('请输入保存令牌');
        if (token === null) throw error;
        localStorage.setItem(tokenKey, token);
        startWaiting('令牌已填写，正在重新提交...');
        return saveToServer(token, updateWaiting);
      }).then(function (data) {
        stopWaiting();
        localStorage.removeItem(draftKey);
        if (mode === 'create') localStorage.removeItem(commandDraftKey);
        source = editor.value;
        var detail = data.file ? '文件：' + data.file + '。' : '';
        if (data.total_ms) {
          detail += '总耗时 ' + formatSeconds(data.total_ms) + '，构建耗时 ' + formatSeconds(data.build_ms || 0) + '。';
        }
        setStatus('已保存到服务器，并已重新生成页面。' + detail);
      }).catch(function (error) {
        stopWaiting();
        var waited = error.wait_ms ? ' 已等待 ' + formatSeconds(error.wait_ms) + '。' : '';
        setStatus((error.message || '保存失败，请稍后重试。') + waited);
      });
    });

    document.getElementById('copy_md').addEventListener('click', function () {
      navigator.clipboard.writeText(editor.value).then(function () {
        setStatus('已复制修正后的 Markdown 内容。');
      }, function () {
        editor.select();
        document.execCommand('copy');
        setStatus('已复制修正后的 Markdown 内容。');
      });
    });

    document.getElementById('download_md').addEventListener('click', function () {
      download(getCommandName() + '.md', editor.value);
      setStatus('已下载 Markdown 文件。');
    });

    document.getElementById('reset_md').addEventListener('click', function () {
      var resetMessage = mode === 'create'
        ? '确定恢复为空白命令模板吗？当前草稿会被清除。'
        : '确定恢复为原始 Markdown 内容吗？当前草稿会被清除。';
      if (!confirm(resetMessage)) return;
      localStorage.removeItem(draftKey);
      if (mode === 'create') localStorage.removeItem(commandDraftKey);
      if (commandInput) commandInput.value = '';
      editor.value = source;
      setStatus(mode === 'create' ? '已恢复为空白命令模板。' : '已恢复原文。');
    });
  });
})();
