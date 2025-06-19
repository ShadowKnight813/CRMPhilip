import os
import subprocess

# Set environment variables
os.environ['DB_USERNAME'] = 'root'
os.environ['DB_PASSWORD'] = 'password'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '3306'
os.environ['DB_NAME'] = 'mydb'

# Run the Flask application
subprocess.run(['python', 'src/main.py']) 