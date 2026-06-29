uv
===

一个高速 Python 包管理器、项目管理器和虚拟环境管理工具，可用于创建项目、管理依赖、锁定环境、运行脚本、安装 Python 版本，并提供兼容 pip 的使用方式。

## 补充说明

**uv命令** 用于替代或整合 `pip`、`venv`、`pip-tools`、`pipx`、`poetry`、`pyenv` 的部分常用功能。它可以管理 Python 项目的依赖、虚拟环境、锁文件、Python 版本和命令行工具，适合用于新建 Python 项目、快速安装依赖、复现项目环境、运行脚本和迁移旧的 `requirements.txt` 工作流。

在 uv 的项目模式中，核心文件通常包括：

* `pyproject.toml`：记录项目元数据和直接依赖。
* `uv.lock`：记录解析后的完整依赖版本，用于环境复现。
* `.python-version`：记录项目使用的 Python 版本。
* `.venv/`：项目虚拟环境目录，通常由 `uv run`、`uv sync` 或 `uv venv` 自动创建。

uv 的推荐工作方式是：用 `uv init` 创建项目，用 `uv add` 添加依赖，用 `uv run` 运行代码，用 `uv sync` 复现环境。对于旧项目或临时环境，也可以使用 `uv pip install`、`uv pip sync` 等 pip 兼容命令。

### 语法

```shell
uv [全局选项] <子命令> [子命令选项] [参数]
```

常见子命令：

```shell
uv init [选项] [项目路径]
uv run [选项] [命令或脚本]
uv add [选项] <包名>
uv remove [选项] <包名>
uv sync [选项]
uv lock [选项]
uv pip install [选项] <包名或路径>
uv pip sync [选项] <requirements.txt>
uv venv [选项] [虚拟环境路径]
uv python install [Python版本]
uv tool run [工具名]
uvx [工具名]
```

### 选项

* `-h`, `--help`: 显示帮助信息。
* `-V`, `--version`: 显示 uv 版本信息。
* `-v`, `--verbose`: 输出更详细的日志信息。
* `-q`, `--quiet`: 减少输出信息。
* `--python <版本>`: 指定 Python 版本，例如 `--python 3.12`。
* `--project <目录>`: 指定项目目录。
* `--directory <目录>`: 切换到指定目录后执行命令。
* `--locked`: 要求 `uv.lock` 已经是最新状态；如果 `pyproject.toml` 与锁文件不一致，则报错，不自动更新锁文件。
* `--frozen`: 使用现有 `uv.lock`，不检查它是否与 `pyproject.toml` 完全一致。
* `--no-sync`: 不自动同步虚拟环境。
* `--index <URL>`: 指定额外的包索引源。
* `--index-url <URL>`: 指定包索引地址，常用于 PyTorch 等特殊源。
* `-c`, `--constraint <文件>`: 使用约束文件限制依赖版本，但约束文件本身不会主动添加依赖。
* `-r`, `--requirements <文件>`: 从依赖文件读取包列表，常用于 `uv add -r requirements.txt` 或 `uv pip install -r requirements.txt`。
* `--dev`: 将依赖加入开发依赖组，等价于加入 `dev` dependency group。
* `--group <组名>`: 将依赖加入或安装指定依赖组。
* `--all-extras`: 安装所有可选依赖。
* `--extra <名称>`: 安装指定 extra。
* `--reinstall`: 重新安装相关包。
* `--upgrade`, `-U`: 允许升级依赖。
* `--refresh`: 刷新缓存中的包元数据。
* `--offline`: 离线模式，只使用本地缓存。
* `--system`: 在系统 Python 环境中安装包，一般不推荐，除非明确知道风险。
* `--compile-bytecode`: 安装后编译 `.pyc` 字节码，适合 Docker 镜像或 CLI 启动速度敏感场景。

### 安装 uv

macOS / Linux 推荐使用官方安装脚本：

```shell
curl -LsSf https://astral.sh/uv/install.sh | sh
```

如果系统没有 `curl`，可以使用：

```shell
wget -qO- https://astral.sh/uv/install.sh | sh
```

Windows PowerShell：

```shell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

使用 pipx 安装：

```shell
pipx install uv
```

使用 pip 安装：

```shell
pip install uv
```

升级 uv：

```shell
uv self update
```

如果 uv 是通过 pip 安装的，则用 pip 升级：

```shell
pip install --upgrade uv
```

查看版本：

```shell
uv --version
```

查看帮助：

```shell
uv --help
```

### 新建项目

新建一个名为 `project_name` 的项目目录，并指定 Python 3.12：

```shell
uv init --python 3.12 project_name
cd project_name
```

在当前目录初始化项目：

```shell
uv init --python 3.12
```

初始化后通常会生成：

```shell
pyproject.toml
.python-version
README.md
main.py
.gitignore
```

第一次执行 `uv run`、`uv sync` 或 `uv lock` 后，通常会创建：

```shell
.venv/
uv.lock
```

### 创建或使用虚拟环境

在当前目录创建 `.venv`：

```shell
uv venv
```

指定 Python 版本创建虚拟环境：

```shell
uv venv --python 3.12
```

手动激活虚拟环境后，后续 `python` 和 `pip` 会走当前 `.venv`。

macOS / Linux：

```shell
source .venv/bin/activate
```

Windows PowerShell：

```shell
.venv\Scripts\Activate.ps1
```

Windows CMD：

```shell
.venv\Scripts\activate.bat
```

不手动激活，直接用 uv 运行代码：

```shell
uv run main.py
```

运行 Python 模块：

```shell
uv run python -m module_name
```

运行任意命令：

```shell
uv run pytest
```

运行 Flask 示例：

```shell
uv add flask
uv run flask run -p 3000
```

### 添加依赖

添加单个包，写入 `pyproject.toml`，并自动更新 `uv.lock` 和项目环境：

```shell
uv add requests
```

指定精确版本：

```shell
uv add 'requests==2.31.0'
```

指定版本范围：

```shell
uv add 'requests>=2.31,<3'
```

添加多个包：

```shell
uv add numpy pandas matplotlib
```

添加开发依赖：

```shell
uv add --dev pytest ruff
```

添加到指定依赖组：

```shell
uv add --group docs mkdocs
```

添加可选依赖 extra：

```shell
uv add --optional api fastapi uvicorn
```

添加 Git 依赖：

```shell
uv add git+https://github.com/psf/requests
```

添加指定分支、tag 或 commit 的 Git 依赖：

```shell
uv add 'git+https://github.com/psf/requests@main'
uv add 'git+https://github.com/psf/requests@v2.31.0'
```

添加本地路径依赖：

```shell
uv add ../local_package
```

以 editable 模式添加本地依赖：

```shell
uv add --editable ../local_package
```

使用指定索引源添加包，例如 PyTorch CUDA 版本：

```shell
uv add torch torchvision --index-url https://download.pytorch.org/whl/cu130
```

从 `requirements.txt` 导入依赖，写入 `pyproject.toml`，并更新 `uv.lock`：

```shell
uv add -r requirements.txt
```

从 `requirements.txt` 添加依赖，并用 `constraints.txt` 限制版本解析：

```shell
uv add -r requirements.txt -c constraints.txt
```

### 删除依赖

删除单个包：

```shell
uv remove requests
```

删除多个包：

```shell
uv remove numpy pandas
```

从开发依赖组删除：

```shell
uv remove --dev pytest
```

从指定依赖组删除：

```shell
uv remove --group docs mkdocs
```

### 同步项目环境

根据 `pyproject.toml` 和 `uv.lock` 同步项目环境：

```shell
uv sync
```

严格按照当前 `uv.lock` 同步环境，并要求锁文件与项目配置一致；不一致则报错：

```shell
uv sync --locked
```

使用现有 `uv.lock` 同步，不自动更新锁文件：

```shell
uv sync --frozen
```

同步所有 extra：

```shell
uv sync --all-extras
```

同步指定 extra：

```shell
uv sync --extra api
```

同步开发依赖组：

```shell
uv sync --group dev
```

同步所有依赖组：

```shell
uv sync --all-groups
```

默认情况下，`uv sync` 会执行精确同步，移除不属于项目依赖的多余包。如果想保留环境中的额外包，可以使用：

```shell
uv sync --inexact
```

### 锁定依赖

生成或更新 `uv.lock`：

```shell
uv lock
```

检查 `uv.lock` 是否已经是最新状态：

```shell
uv lock --check
```

只允许使用已有锁文件，不更新锁文件：

```shell
uv lock --frozen
```

### 运行代码

运行项目中的 `main.py`：

```shell
uv run main.py
```

运行 Python 命令：

```shell
uv run python
```

运行 Python 一行命令：

```shell
uv run python -c "import requests; print(requests.__version__)"
```

运行测试：

```shell
uv run pytest
```

运行代码格式化工具：

```shell
uv run ruff check .
uv run ruff format .
```

使用指定 Python 版本运行：

```shell
uv run --python 3.12 python main.py
```

不自动同步环境直接运行：

```shell
uv run --no-sync python main.py
```

要求锁文件不被更新：

```shell
uv run --locked python main.py
```

### 使用 requirements.txt 工作流

注意：`requirements.txt` 工作流主要使用 `uv pip` 子命令，而不是 `uv sync -r`。

从 `requirements.txt` 安装依赖，但不删除环境中的多余包：

```shell
uv pip install -r requirements.txt
```

根据 `requirements.txt` 严格同步环境，删除未列出的多余包：

```shell
uv pip sync requirements.txt
```

根据 `requirements.txt` 和 `constraints.txt` 安装：

```shell
uv pip install -r requirements.txt -c constraints.txt
```

根据 `requirements.txt` 和 `constraints.txt` 严格同步：

```shell
uv pip sync requirements.txt -c constraints.txt
```

导出当前环境依赖：

```shell
uv pip freeze
```

查看已安装包：

```shell
uv pip list
```

查看包信息：

```shell
uv pip show requests
```

检查依赖兼容性：

```shell
uv pip check
```

查看依赖树：

```shell
uv pip tree
```

### 使用 uv pip 安装项目

安装当前项目为 editable 模式：

```shell
uv pip install -e .
```

安装当前项目并包含开发 extra：

```shell
uv pip install -e ".[dev]"
```

安装当前项目并包含指定 extra：

```shell
uv pip install -e ".[api]"
```

安装 wheel 文件：

```shell
uv pip install dist/package_name-0.1.0-py3-none-any.whl
```

安装 Git 依赖：

```shell
uv pip install git+https://github.com/psf/requests
```

### 导出依赖

将 `uv.lock` 导出为 `requirements.txt`：

```shell
uv export -o requirements.txt
```

导出时不更新锁文件：

```shell
uv export --frozen -o requirements.txt
```

导出指定依赖组：

```shell
uv export --group dev -o requirements-dev.txt
```

### Python 版本管理

安装 Python 3.12：

```shell
uv python install 3.12
```

安装多个 Python 版本：

```shell
uv python install 3.11 3.12 3.13
```

查看可用 Python 版本：

```shell
uv python list
```

查找当前使用的 Python：

```shell
uv python find
```

将当前项目固定到 Python 3.12：

```shell
uv python pin 3.12
```

查看 uv 管理的 Python 安装目录：

```shell
uv python dir
```

卸载 uv 管理的 Python 版本：

```shell
uv python uninstall 3.12
```

### 使用 uvx / uv tool 运行命令行工具

临时运行工具，不污染当前项目环境：

```shell
uvx ruff check .
```

`uvx` 等价于：

```shell
uv tool run ruff check .
```

运行指定版本工具：

```shell
uvx ruff@0.6.0 check .
```

临时运行 black：

```shell
uvx black .
```

全局安装工具：

```shell
uv tool install ruff
```

查看已安装工具：

```shell
uv tool list
```

升级工具：

```shell
uv tool upgrade ruff
```

卸载工具：

```shell
uv tool uninstall ruff
```

确保工具目录在 PATH 中：

```shell
uv tool update-shell
```

### 构建与发布项目

构建源码包和 wheel：

```shell
uv build
```

发布到包索引：

```shell
uv publish
```

发布前通常需要先构建：

```shell
uv build
uv publish
```

### 缓存管理

查看 uv 缓存目录：

```shell
uv cache dir
```

清理缓存：

```shell
uv cache clean
```

清理指定包缓存：

```shell
uv cache clean requests
```

### 依赖树与检查

查看项目依赖树：

```shell
uv tree
```

检查项目配置与依赖状态：

```shell
uv check
```

审计项目依赖漏洞：

```shell
uv audit
```

### 常见使用流程

新项目推荐流程：

```shell
uv init --python 3.12 project_name
cd project_name
uv add requests pandas
uv run main.py
uv sync --locked
```

已有项目首次安装依赖：

```shell
cd existing_project
uv sync
uv run python main.py
```

从 pip / requirements.txt 迁移到 uv 项目：

```shell
uv init --python 3.12
uv add -r requirements.txt
uv lock
uv sync
```

只想按 requirements.txt 复现旧环境：

```shell
uv venv --python 3.12
source .venv/bin/activate
uv pip sync requirements.txt
```

在 Windows PowerShell 中按 requirements.txt 复现旧环境：

```shell
uv venv --python 3.12
.venv\Scripts\Activate.ps1
uv pip sync requirements.txt
```

安装 PyTorch CUDA 版本：

```shell
uv add torch torchvision --index-url https://download.pytorch.org/whl/cu130
```

或者在非项目环境中安装：

```shell
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu130
```

### 注意事项

* 新项目优先使用 `uv init`、`uv add`、`uv sync`、`uv run` 这一套项目工作流。
* 旧项目或临时环境可以继续使用 `uv pip install`、`uv pip sync` 等 pip 兼容命令。
* `uv add -r requirements.txt` 的作用是把 requirements 中的依赖导入项目，写入 `pyproject.toml`。
* `uv pip sync requirements.txt` 的作用是按 requirements 文件严格同步当前虚拟环境，并删除多余包。
* `uv sync` 不等同于 `uv pip sync requirements.txt`；前者面向 uv 项目，后者面向 requirements 文件。
* `uv sync --locked` 适合 CI/CD 中确保锁文件没有被隐式修改。
* `uv sync --frozen` 适合只按已有锁文件安装，不希望 uv 尝试更新锁文件的场景。
* 不建议随意使用 `--system` 修改系统 Python 环境。
* 在项目中优先使用 `uv run`，这样即使不手动激活 `.venv`，也能保证命令在项目环境中运行。
* 在 Docker 或 CLI 工具场景中，可以考虑使用 `--compile-bytecode` 换取更快的启动速度。
* 对 PyTorch、私有源或镜像源，应明确指定 `--index` 或 `--index-url`，避免解析到错误来源。
