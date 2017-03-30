INSERT INTO Users ("email", "firstName", "lastName", "role") VALUES (
    'jason.runzer@uoit.net',
    'Jason',
    'Runzer',
    'Teacher'
);

INSERT INTO Quizzes ("name", "expDate", "creator") VALUES (
    'Quiz 1',
    '1999-01-08 04:05:06',
    'jason.runzer@uoit.net'
);

INSERT INTO Questions ("question", "quizID") VALUES (
    'What is Jasons favorite colour?',
    '1'
);

INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES (
    'Green',
    false,
    '1'
);

INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES (
    'Red',
    true,
    '1'
);

INSERT INTO Questions ("question", "quizID") VALUES (
    'What is the output of this code?: cout <<  5 + 4 << endl;',
    '1'
);

INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES (
    '5 + 4',
    false,
    '2'
);

INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES (
    '5 + 4 = pie',
    false,
    '2'
);

INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES (
    '9',
    true,
    '2'
);

INSERT INTO Programs ("name", "data") VALUES (
    'instructorProgram.cpp',
    '// hello world
    #include <iostream> 
    int main() { 
        std::cout << "Hello World!";
    }'
);

INSERT INTO Programs ("name", "data") VALUES (
    'HelloStuart.cpp',
    '// hello Stuart
    #include <iostream> 
    int main() { 
        std::cout << "Hello Stuart!";
    }'
);