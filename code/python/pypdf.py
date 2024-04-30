import PyPDF2
from pdfminer.high_level import extract_text

# 导入 PyPDF2
def extract_text_from_pdf(file_path):
    pdf_file_obj = open(file_path, 'rb')
    pdf_reader = PyPDF2.PdfFileReader(pdf_file_obj)
    text = ""
    for page_num in range(pdf_reader.numPages):
        page_obj = pdf_reader.getPage(page_num)
        text += page_obj.extractText()
    pdf_file_obj.close()
    # 返回文本
print(extract_text_from_pdf('pdf/cj.pdf'))