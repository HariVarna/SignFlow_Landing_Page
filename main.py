"""
SignFlow - Real-time Sign Language Prediction
Flask application entry point
"""

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')


@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')


@app.route('/download')
def download():
    """Download page"""
    return render_template('download.html')


@app.route('/contact')
def contact():
    """Contact page"""
    return render_template('contact.html')


@app.route('/login')
def login():
    """Login page"""
    return render_template('login.html')


if __name__ == '__main__':
    app.run(debug=True)
