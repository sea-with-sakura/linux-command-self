conda
===

一个跨平台的包管理器和环境管理器，用于创建、切换、导出、复现 Python/R/科学计算环境，并管理不同环境中的软件包版本。

## 补充说明

**conda命令** 用于管理 Python 环境、软件包、镜像源、依赖导出与环境复现。它既可以安装 Python 包，也可以安装非 Python 的二进制依赖，例如 CUDA、OpenSSL、编译器运行库等。相比 `pip`，`conda` 更强调“环境级别”的依赖解析和二进制包管理；相比 `venv`，`conda` 可以直接管理 Python 解释器版本。

常见使用场景包括：

- 为不同项目创建互不干扰的虚拟环境。
- 指定 Python 版本，例如 Python 3.8、3.10、3.12。
- 安装 PyTorch、NumPy、Pandas、Scikit-learn、Jupyter 等科学计算包。
- 导出当前环境为 `environment.yml`，在另一台机器复现。
- 清理缓存，减少磁盘占用。
- 在安装错误后，通过 revision 回滚环境状态。

### 语法

```shell
conda [全局选项] <子命令> [选项] [参数]
```

常见子命令：

```shell
conda info
conda config
conda create
conda activate
conda deactivate
conda install
conda update
conda remove
conda list
conda env list
conda env export
conda env create
conda clean
```

### 选项

- `-h`, `--help`: 显示帮助信息。
- `-V`, `--version`: 显示 conda 版本信息。
- `-n`, `--name`: 指定环境名称。
- `-p`, `--prefix`: 指定环境路径。
- `-c`, `--channel`: 指定安装包所用 channel。
- `--file`: 从文件读取包列表。
- `--all`: 删除整个环境或清理所有可清理缓存，具体含义取决于子命令。
- `-y`, `--yes`: 自动确认操作。
- `--dry-run`: 只显示将要执行的操作，不真正安装或删除。
- `--override-channels`: 只使用命令中显式指定的 channel。
- `--revision`: 将当前环境回滚到指定历史版本。

### 基础信息与配置

查看 conda 基本信息：

```shell
conda info
```

查看 conda 版本：

```shell
conda --version
```

或：

```shell
conda -V
```

查看当前配置：

```shell
conda config --show
```

查看已配置的 channels：

```shell
conda config --show channels
```

更新 conda 自身，推荐在 `base` 环境中执行：

```shell
conda update --name base conda
```

也可以写成：

```shell
conda update conda
```

但更推荐显式指定 `base`，避免在非 base 环境中误操作。

### 配置镜像源

注意：下面这个地址是 pip 的 simple 源，不是 conda channel，不推荐用于 `conda config --add channels`：

```shell
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/simple
```

更合理的 conda 清华源配置方式是配置 Anaconda 仓库路径，例如：

```shell
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
conda config --set show_channel_urls yes
```

如果需要 conda-forge，可以添加：

```shell
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge
conda config --set show_channel_urls yes
```

更推荐直接编辑用户目录下的 `.condarc`，例如：

```yaml
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  nvidia: https://mirrors.sustech.edu.cn/anaconda-extra/cloud
```

恢复默认源：

```shell
conda config --remove-key channels
conda config --remove-key default_channels
conda config --remove-key custom_channels
```

### 环境管理

创建名为 `torch_py37` 的环境，并指定 Python 3.7：

```shell
conda create -n torch_py37 python=3.7
```

创建环境时同时安装常用包：

```shell
conda create -n data_py310 python=3.10 numpy pandas matplotlib
```

创建环境并自动确认：

```shell
conda create -n torch_py37 python=3.7 -y
```

查看所有环境：

```shell
conda env list
```

或：

```shell
conda info --envs
```

激活环境：

```shell
conda activate env_name
```

退出当前环境：

```shell
conda deactivate
```

删除整个环境及其所有包：

```shell
conda remove --name torch_py38 --all
```

更常见写法：

```shell
conda env remove -n torch_py38
```

删除指定环境中的某个包：

```shell
conda remove --name env_name package_name
```

在当前已激活环境中删除包：

```shell
conda remove package_name
```

复制已有环境：

```shell
conda create -n new_env --clone old_env
```

重命名环境通常采用“复制后删除原环境”的方式：

```shell
conda create -n new_env --clone old_env
conda remove -n old_env --all
```

### 包管理

在当前环境中安装包：

```shell
conda install pkg_name
```

安装多个包：

```shell
conda install numpy pandas scipy
```

安装指定版本：

```shell
conda install python=3.8
conda install numpy=1.26
```

安装精确版本：

```shell
conda install numpy==1.26.4
```

从指定 channel 安装：

```shell
conda install -c conda-forge pkg_name
```

安装 PyTorch 示例：

```shell
conda install pytorch torchvision torchaudio -c pytorch
```

安装 NVIDIA CUDA 相关版本时，通常需要同时指定 `pytorch` 和 `nvidia` channel，例如：

```shell
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
```

更新指定包：

```shell
conda update pkg_name
```

更新当前环境中所有包：

```shell
conda update --all
```

删除包：

```shell
conda remove pkg_name
```

`conda uninstall` 通常可作为 `conda remove` 的别名使用：

```shell
conda uninstall pkg_name
```

查看当前环境已安装包：

```shell
conda list
```

查看指定环境的包：

```shell
conda list -n env_name
```

搜索包：

```shell
conda search pkg_name
```

查看包的详细来源和版本：

```shell
conda list pkg_name
```

### Python 版本管理

在当前环境中更换 Python 版本：

```shell
conda install python=3.8
```

升级当前环境中的 Python：

```shell
conda update python
```

更推荐的方式是为不同 Python 版本创建不同环境，而不是在已有环境中频繁切换 Python 主版本：

```shell
conda create -n py38 python=3.8
conda create -n py310 python=3.10
conda create -n py312 python=3.12
```

### 导出与复现环境

导出当前环境为 YAML：

```shell
conda env export > env.yaml
```

导出指定环境为 YAML：

```shell
conda env export --name pytorch > env.yaml
```

更适合跨平台分享的导出方式，减少本机路径和构建号干扰：

```shell
conda env export --name pytorch --no-builds > env.yaml
```

从 YAML 创建环境：

```shell
conda env create -f env.yaml
```

如果 YAML 文件中已经包含 `name:` 字段，会按其中的环境名创建。也可以用 `-n` 覆盖：

```shell
conda env create -n new_env -f env.yaml
```

根据当前环境更新已有环境：

```shell
conda env update -f env.yaml --prune
```

`--prune` 会删除 YAML 中没有列出的多余依赖。

### requirements.txt 与 spec 文件

导出 conda 可读的包列表：

```shell
conda list --export > requirements.txt
```

旧写法也常见：

```shell
conda list -e > requirements.txt
```

从 conda 导出的 `requirements.txt` 安装包：

```shell
conda install --file requirements.txt
```

注意：`conda install --file requirements.txt` 适合 conda 格式的依赖文件，不等同于 pip 的 `requirements.txt`。

如果文件内容是 pip 风格，例如：

```text
requests==2.31.0
fastapi==0.115.0
```

则更推荐使用：

```shell
pip install -r requirements.txt
```

导出精确可复现的 explicit spec 文件：

```shell
conda list --explicit > spec-file.txt
```

用 explicit spec 文件创建环境：

```shell
conda create -n new_env --file spec-file.txt
```

这种方式更适合同操作系统、同架构机器之间复现环境；跨平台迁移更推荐 `environment.yml`。

### pip 与 conda 混用

在 conda 环境中也可以使用 pip：

```shell
pip install pkg_name
```

安装最新版 pip 包：

```shell
pip install -U pkg_name
```

从 pip requirements 文件安装：

```shell
pip install -r requirements.txt
```

推荐顺序：

1. 优先用 `conda install` 安装 Python、CUDA、NumPy、PyTorch 等底层或二进制依赖。
2. 再用 `pip install` 安装 conda channel 中没有的纯 Python 包。
3. 尽量避免在 pip 安装后再大量执行 conda install，否则可能触发依赖回滚或覆盖。

### pipreqs 生成 requirements.txt

`pipreqs` 不是 conda 命令，它会扫描项目源码中的 import 语句，然后生成 pip 风格的 `requirements.txt`。

安装 pipreqs：

```shell
pip install pipreqs
```

根据当前项目代码生成 requirements.txt：

```shell
pipreqs ./ --encoding=utf8
```

强制覆盖已有 requirements.txt：

```shell
pipreqs ./ --encoding=utf8 --force
```

注意：`pipreqs` 只根据源码 import 推断依赖，不能完整记录 conda 环境中的非 Python 二进制依赖。

### 清理缓存

删除未使用的包缓存：

```shell
conda clean -p
```

等价长选项：

```shell
conda clean --packages
```

删除下载过的 tar 包缓存：

```shell
conda clean -t
```

等价长选项：

```shell
conda clean --tarballs
```

删除索引缓存、未使用包、tar 包、日志等可清理内容：

```shell
conda clean --all
```

自动确认清理：

```shell
conda clean -y --all
```

也可以写成：

```shell
conda clean -a -y
```

注意：你原表中的 `conda clean -y -all` 写法不规范，推荐改为：

```shell
conda clean -y --all
```

### 环境回滚

查看当前环境的历史修订记录：

```shell
conda list --revisions
```

回滚到指定 revision，例如回滚到 revision 0：

```shell
conda install --revision 0
```

注意：你原表中的命令：

```shell
conda istall -rev 0
```

存在拼写和参数问题，应改为：

```shell
conda install --revision 0
```

或者短写为：

```shell
conda install --rev 0
```

回滚前建议先查看 revision：

```shell
conda list --revisions
```

### 常见完整流程

创建并进入新环境：

```shell
conda create -n torch_py37 python=3.7 -y
conda activate torch_py37
```

安装 PyTorch：

```shell
conda install pytorch torchvision torchaudio -c pytorch
```

安装常用科学计算包：

```shell
conda install numpy pandas scipy scikit-learn matplotlib jupyter
```

导出环境：

```shell
conda env export --no-builds > env.yaml
```

在另一台机器复现：

```shell
conda env create -f env.yaml
conda activate 环境名
```

删除环境：

```shell
conda deactivate
conda env remove -n torch_py37
```

清理缓存：

```shell
conda clean -a -y
```

### 常见问题与注意事项

- 不建议长期在 `base` 环境中安装项目依赖，推荐每个项目单独创建环境。
- `conda create -n env_name python=3.x` 是最稳定的 Python 版本管理方式。
- `conda env export` 适合复现完整环境，但可能包含本机路径和平台相关依赖。
- 跨平台分享环境时，优先使用 `conda env export --no-builds > env.yaml`。
- `conda list --explicit` 导出的 spec 文件更精确，但通常只适合同平台复现。
- `conda install --file requirements.txt` 不是 pip 的 `pip install -r requirements.txt`；二者文件格式和解析方式不同。
- conda 和 pip 可以混用，但推荐先 conda 后 pip。
- 如果安装包后环境损坏，可先用 `conda list --revisions` 查看历史，再用 `conda install --revision N` 回滚。
- 清理缓存前可以先执行 `conda clean --all --dry-run` 查看将删除的内容。

### 命令速查表

| 类别 | 命令 | 说明 |
|---|---|---|
| config | `conda info` | 查看 conda 基本信息 |
| config | `conda --version` | 查看 conda 版本 |
| config | `conda config --show` | 查看配置 |
| config | `conda config --show channels` | 查看 channel 配置 |
| config | `conda update --name base conda` | 更新 conda 自身 |
| config | `conda config --add channels <channel_url>` | 添加 channel |
| env | `conda create -n torch_py37 python=3.7` | 创建指定 Python 版本的环境 |
| env | `conda env list` | 列出所有环境 |
| env | `conda info --envs` | 列出所有环境 |
| env | `conda activate env_name` | 激活环境 |
| env | `conda deactivate` | 退出当前环境 |
| env | `conda remove --name env_name --all` | 删除环境及所有包 |
| env | `conda env remove -n env_name` | 删除环境 |
| env | `conda create -n new_env --clone old_env` | 复制环境 |
| export | `conda env export --name env_name > env.yaml` | 导出 YAML 环境文件 |
| export | `conda env create -f env.yaml` | 从 YAML 创建环境 |
| export | `conda env update -f env.yaml --prune` | 根据 YAML 更新环境 |
| export | `conda list --export > requirements.txt` | 导出 conda 包列表 |
| export | `conda install --file requirements.txt` | 从 conda 包列表安装 |
| export | `conda list --explicit > spec-file.txt` | 导出精确 spec 文件 |
| export | `conda create -n new_env --file spec-file.txt` | 从 spec 文件创建环境 |
| pkg | `conda install pkg_name` | 安装包 |
| pkg | `conda install pkg_name=版本` | 安装指定版本包 |
| pkg | `conda install -c conda-forge pkg_name` | 从指定 channel 安装包 |
| pkg | `conda update pkg_name` | 更新包 |
| pkg | `conda update --all` | 更新当前环境全部包 |
| pkg | `conda remove pkg_name` | 删除包 |
| pkg | `conda list` | 查看当前环境包列表 |
| pkg | `conda search pkg_name` | 搜索包 |
| clean | `conda clean -p` | 删除未使用包缓存 |
| clean | `conda clean -t` | 删除 tar 包缓存 |
| clean | `conda clean -a -y` | 自动确认并清理所有可清理缓存 |
| python | `conda install python=3.8` | 更换当前环境 Python 版本 |
| python | `conda update python` | 更新当前环境 Python |
| pip | `pip install -U pkg_name` | 用 pip 安装或更新最新版包 |
| pip | `pip install -r requirements.txt` | 从 pip requirements 文件安装 |
| pip | `pipreqs ./ --encoding=utf8` | 根据源码 import 生成 pip requirements 文件 |
| rollback | `conda list --revisions` | 查看环境历史 revision |
| rollback | `conda install --revision 0` | 回滚到 revision 0 |

### 参考资料

- Conda 官方命令参考：https://docs.conda.io/projects/conda/en/stable/commands/index.html
- Conda 环境管理官方文档：https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html
- Conda clean 官方文档：https://docs.conda.io/projects/conda/en/stable/commands/clean.html
- Conda env export 官方文档：https://docs.conda.io/projects/conda/en/latest/commands/env/export.html
- 清华大学 TUNA Anaconda 镜像帮助：https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/
