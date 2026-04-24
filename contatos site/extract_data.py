import pdfplumber
import sqlite3
import os
import re

def clean_text(text):
    if text is None:
        return ""
    # Remove newlines and multiple spaces
    return re.sub(r'\s+', ' ', text).strip()

def extract_from_pdf(pdf_path, db_path):
    print(f"Extracting data from {pdf_path}...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("DROP TABLE IF EXISTS students")
    cursor.execute("""
        CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            periodo TEXT,
            turma TEXT,
            contato1 TEXT,
            contato2 TEXT,
            contato3 TEXT,
            filiacao1 TEXT,
            contato_filiacao1 TEXT,
            filiacao2 TEXT,
            contato_filiacao2 TEXT
        )
    """)
    
    total_records = 0
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    # Clean the row
                    cleaned_row = [clean_text(cell) for cell in row]
                    
                    if not cleaned_row or not cleaned_row[0]:
                        continue
                        
                    nome = cleaned_row[0]
                    
                    # Exclude headers, school info, and footers
                    if any(x in nome for x in ["Nome", "LISTAGEM", "ESCOLA", "SECRETARIA", "PREFEITURA", "ESPÍRITO SANTO", "RUA BENJAMIN", "Total de registros", "Relatório gerado"]):
                        continue
                    
                    # Ensure we have enough columns
                    while len(cleaned_row) < 10:
                        cleaned_row.append("")
                        
                    # Insert data
                    cursor.execute("""
                        INSERT INTO students (
                            nome, periodo, turma, contato1, contato2, contato3, 
                            filiacao1, contato_filiacao1, filiacao2, contato_filiacao2
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, cleaned_row[:10])
                    total_records += 1

    conn.commit()
    conn.close()
    print(f"Extraction complete. Total records in DB: {total_records}")

if __name__ == "__main__":
    pdf_file = "listMatriculaAluno112212121.pdf"
    db_file = "students.db"
    
    if os.path.exists(pdf_file):
        extract_from_pdf(pdf_file, db_file)
    else:
        print(f"Error: {pdf_file} not found.")
