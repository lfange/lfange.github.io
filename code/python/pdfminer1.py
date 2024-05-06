import io

from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfpage import PDFPage

try:
    import pdfminer
    print("PyPDF2 is installed")
except ImportError:
    print("PyPDF2 is not installed")

def convert_pdf_to_txt(path):
    rsrcmgr = PDFResourceManager()  # 存储共享资源，例如字体或图片
    retstr = io.StringIO()
    codec = 'utf-8'
    laparams = LAParams()
    device = TextConverter(rsrcmgr, retstr, codec=codec, laparams=laparams)
    fp = open(path, 'rb')
    interpreter = PDFPageInterpreter(rsrcmgr, device)  # 解析 page内容
    password = ""  # 密码，若无则初始化为空
    maxpages = 0
    caching = True
    pagenos = set()

    for page in PDFPage.get_pages(fp, pagenos, maxpages=maxpages,
                                  password=password,
                                  caching=caching,
                                  check_extractable=True):
        interpreter.process_page(page)

    text = retstr.getvalue()

    fp.close()
    device.close()
    retstr.close()
    return text

  


# 获取用户输入
title = input("请输入标题: ")
content = input("请输入内容: ")

# 创建 Markdown 文本
markdown_text = f"""
{convert_pdf_to_txt("./pdf/english.pdf")}
"""

# 文件路径
file_path = 'output.md'

# 使用 with 语句打开文件并写入
with open(file_path, 'w', encoding='utf-8') as file:
    file.write(markdown_text)

print(f"Markdown file '{file_path}' has been created and written to.")