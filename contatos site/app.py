import sqlite3
from flask import Flask, jsonify, request, send_from_directory
import os

app = Flask(__name__)

# Rota Principal
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# API de Busca
@app.route('/api/students')
def get_students():
    query = request.args.get('q', '').strip()
    
    conn = sqlite3.connect('students.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if query:
        search_term = f'%{query}%'
        cursor.execute("""
            SELECT * FROM students 
            WHERE nome LIKE ? OR turma LIKE ? OR filiacao1 LIKE ? OR filiacao2 LIKE ?
            LIMIT 50
        """, (search_term, search_term, search_term, search_term))
    else:
        cursor.execute("SELECT * FROM students LIMIT 20")
    
    students = cursor.fetchall()
    result = [dict(row) for row in students]
    conn.close()
    
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
