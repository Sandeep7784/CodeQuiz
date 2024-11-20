# Code Quiz Challenge

Code Quiz Challenge is a platform designed to help users practice their knowledge of various tech stacks through quizzes. The platform also provides analytics, enabling users to track their progress over time by showcasing their previous quiz attempts and performance.

## Features

- **Tech Stack Quizzes**: Allows users to practice and test their knowledge on various technology stacks.
- **Analytics**: Users can view their quiz history, including past attempts, scores, and progress.
- **User Authentication**: Secure authentication using JWT (JSON Web Tokens).
- **Progress Tracking**: Keeps track of user performance across different quiz attempts and provides feedback for improvement.

## Prerequisites

To run the Code Quiz Challenge locally, you need the following installed:

- Python 3.7+
- pip (Python package installer)
- MongoDB for storing user data and quiz results
- Uvicorn to run the server (ASGI server)

## Setting Up the Project

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Sandeep7784/CodeQuiz.git
cd CodeQuiz
```

### 2. Create a Virtual Environment

Create a virtual environment to isolate dependencies for this project:

```bash
python -m venv venv
```

Activate the virtual environment:

On Windows:

```bash
.\venv\Scripts\activate
```

On MacOS/Linux:

```bash
source venv/bin/activate
```

### 3. Install the Dependencies

Once the virtual environment is activated, install the required dependencies listed in the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

This will install the necessary libraries such as FastAPI, MongoDB, Uvicorn, etc.

## Configuration

The project uses environment variables for sensitive configuration, such as database connection details and JWT settings. You need to create a `.env` file in the root directory and enter the following values:

```markdown
MONGO_INITDB_DATABASE=code_quiz
# The name of the initial database to be created in MongoDB.

DATABASE_URL=<your_mongodb_connection_string>
# The connection string for MongoDB, including the username and password for authentication.

ACCESS_TOKEN_EXPIRES_IN=15
# The expiration time (in minutes) for the access token.

REFRESH_TOKEN_EXPIRES_IN=1440
# The expiration time (in minutes) for the refresh token.

JWT_ALGORITHM=RS256
# The algorithm used for signing the JWT tokens.

QUIZ_API_KEY=<your_quiz_api_key>
# The API key for accessing the quiz services.

CLIENT_ORIGIN=http://localhost:8000
# The origin URL of the client application.

JWT_PRIVATE_KEY=<your_jwt_private_key>
# The private key used for signing the JWT tokens.

JWT_PUBLIC_KEY=<your_jwt_public_key>
# The public key used for verifying the JWT tokens.
```

## Running the Server

Once you have cloned the repository, set up the virtual environment, and configured the `.env` file, you can run the server using the following command:

```bash
uvicorn app.main:app --reload
```

This will start the development server at `http://127.0.0.1:8000`. The `--reload` flag will automatically reload the server when you make changes to the code, which is useful during development.