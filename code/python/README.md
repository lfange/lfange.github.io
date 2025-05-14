# pdf2word

~~60 行~~40 行代码实现多进程 PDF 转 Word

> 新版本基于[https://github.com/dothinking/pdf2docx](https://github.com/dothinking/pdf2docx)实现

## 使用方法

- clone 或下载项目到本地

```python
git clone git@github.com:simpleapples/pdf2word.git
```

- 进入项目目录，建立虚拟环境，并安装依赖

```python
cd pdf2word
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

- 修改 config.cfg 文件，指定存放 pdf 和 word 文件的文件夹，以及同时工作的进程数
- 执行`python main.py`

## ModuleNotFoundError: No module named '\_tkinter' 报错处理

### macOS 环境

1. 安装 homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. 使用 homebrew 安装 tkinter

```bash
brew install python-tk
```

### Linux 环境

以 ubuntu 为例

```bash
sudo apt install python3-tk
```

**欢迎 Star**

## Python 私房菜

![](http://ww1.sinaimg.cn/large/6ae0adaely1foxc0cfkjsj2076076aac.jpg)

## License

采用 MIT 开源许可证

## 如何使用 Channels

添加 Channel 当你需要安装不在默认 channel 中的包时，你可以添加其他 channel。添加 channel 可以通过两种方式：

```bash
Specifying channels
```

### 临时添加: 在安装包时指定 channel：

```bash
conda install -c conda-forge some-package
```

这里 -c 参数指定了要使用的 channel。永久添加: 通过修改 Conda 配置，将 channel 添加到搜索列表中：

```bash
conda config --add channels conda-forge
```

这将 conda-forge 添加到你的 channel 列表中，使得 Conda 在搜索和安装软件包时优先考虑这个 channel。查看配置的 Channels 查看当前配置的 channels 和它们的搜索优先级：

```bash
conda config --show channels
```

设置 Channel 优先级当你有多个 channel 配置时，Conda 将根据你添加它们的顺序（在配置文件中的顺序）来搜索软件包。你可以通过 Conda 配置来调整这个顺序，或通过命令行选项指定使用特定的 channel。
