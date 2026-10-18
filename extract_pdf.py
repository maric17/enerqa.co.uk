import PyPDF2
import sys

def extract_pages(pdf_path, start_page, end_page):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        # PyPDF2 pages are 0-indexed
        for i in range(start_page - 1, min(end_page, len(reader.pages))):
            text += f"\n--- Page {i + 1} ---\n"
            text += reader.pages[i].extract_text()
        print(text)

if __name__ == "__main__":
    extract_pages(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
