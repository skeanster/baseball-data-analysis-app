# baseball-data-analysis-app

Fullstack application built using: MySQL Database, Python/Flask Backend, and React frontend

# Setup instructions:

UI:

-   open a new terminal window
-   run 'cd ui'
-   run 'npm i'
-   run 'npm run dev'

Database:

-   install MySQL and start a local server
-   open MySQL workbench and navigate to Server > Data Import
-   select the 'import from self-contained file' radio option
-   update the path to your local location of the dump file located in this project at /database/Dump20250109.sql
-   for example: /Users/ryanskeans/Documents/GitHub/baseball-data-analysis-app/database/Dump20250109.sql

Backend(Automatic):

-   open a new terminal window
-   run 'cd backend'
-   run pip3 install -r requirements.txt
-   run 'python3 server.py'

Backend(Manual): if for some reason the requirements file wont work, you can manually setup using the following

-   open a new terminal window
-   run 'cd backend'
-   pip3 install Flask
-   pip3 install SQLAlchemy
-   pip3 install Flask-SQLAlchemy
-   pip3 install flask-restful
-   pip3 install mysql-connector
-   pip install --upgrade mysql-connector-python
-   run 'python3 server.py'

Connecting backend and database:

-   edit line 10 in 'server.py' to use to the username/password of your MySQL instance
-   currently it is set up to use username: root and password: password
-   by default: app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:password@localhost/padres_project_data'

Additional troubleshooting:

-   by default for me the UI is being delivered at : http://localhost:5173/
-   and the backend by default is being delivered at http://127.0.0.1:5050
-   if your backend is being delivered at a different location, can update the proxy in vite.config.js
