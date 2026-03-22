import sqlite3
from flask import Flask, render_template, request, redirect, session

app = Flask(__name__)
app.secret_key = "secret123"

# 🔷 Create Database
def init_db():
    conn = sqlite3.connect('students.db')
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age INTEGER,
            course TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()

# 🔐 LOGIN ROUTE
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if username == "admin" and password == "1234":
            session['user'] = username
            return redirect('/')
        else:
            return "Invalid Credentials"

    return render_template("login.html")

# 🔷 HOME
@app.route('/')
def home():
    if 'user' not in session:
        return redirect('/login')
    return render_template("home.html")

# ➕ ADD STUDENT
@app.route('/add', methods=['GET', 'POST'])
def add():
    if 'user' not in session:
        return redirect('/login')

    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        course = request.form['course']

        conn = sqlite3.connect('students.db')
        cur = conn.cursor()

        cur.execute("INSERT INTO students (name, age, course) VALUES (?, ?, ?)",
                    (name, age, course))

        conn.commit()
        conn.close()

        return redirect('/view')

    return render_template("add.html")

# 📄 VIEW STUDENTS
@app.route('/view', methods=['GET', 'POST'])
def view():
    if 'user' not in session:
        return redirect('/login')

    conn = sqlite3.connect('students.db')
    cur = conn.cursor()

    if request.method == 'POST':
        search = request.form['search']
        cur.execute("SELECT * FROM students WHERE name LIKE ?", ('%' + search + '%',))
    else:
        cur.execute("SELECT * FROM students")

    data = cur.fetchall()
    conn.close()

    return render_template("view.html", students=data)

# ❌ DELETE STUDENT
@app.route('/delete/<int:id>')
def delete(id):
    if 'user' not in session:
        return redirect('/login')

    conn = sqlite3.connect('students.db')
    cur = conn.cursor()

    cur.execute("DELETE FROM students WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return redirect('/view')

# ✏️ EDIT STUDENT
@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    if 'user' not in session:
        return redirect('/login')

    conn = sqlite3.connect('students.db')
    cur = conn.cursor()

    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        course = request.form['course']

        cur.execute("UPDATE students SET name=?, age=?, course=? WHERE id=?",
                    (name, age, course, id))
        conn.commit()
        conn.close()

        return redirect('/view')

    cur.execute("SELECT * FROM students WHERE id=?", (id,))
    student = cur.fetchone()
    conn.close()

    return render_template("edit.html", student=student)

# 🚪 LOGOUT
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/login')

# ▶️ RUN APP
if __name__ == "__main__":
    app.run(debug=True)
