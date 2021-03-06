DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Quizzes CASCADE;
DROP TABLE IF EXISTS Questions CASCADE;
DROP TABLE IF EXISTS Answers CASCADE;
DROP TABLE IF EXISTS QuizResults CASCADE;
DROP TABLE IF EXISTS Programs CASCADE;

CREATE TABLE Users (
    "email" text PRIMARY KEY,
    "firstName" text,
    "lastName" text,
    "role" text    
);

CREATE TABLE Quizzes (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "expDate" timestamp,
    "creator" text references Users ("email")
);

CREATE TABLE Questions (
    "id" serial PRIMARY KEY,
    "question" text NOT NULL,
    "quizID" integer references Quizzes ("id") ON DELETE CASCADE
);

CREATE TABLE Answers (
    "id" serial PRIMARY KEY,
    "value" text NOT NULL,
    "correctAnswer" boolean NOT NULL,
    "questionID" integer references Questions ("id") ON DELETE CASCADE
);

CREATE TABLE QuizResults (
    "id" serial PRIMARY KEY,
    "quizID" integer references Quizzes("id") ON DELETE CASCADE,
    "dateCompleted" timestamp default current_timestamp,
    "email" text references Users("email"),
    "mark" decimal
);

CREATE TABLE Programs (
    "name" text PRIMARY KEY,
    "data" text
);