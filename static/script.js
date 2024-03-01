const apiKey = "iQDqOadaA3bsTW1Z6TXLYjJ0vLWOVLc1H4eQNLag";

let quizData = [];

document.getElementById("fetchQuiz").addEventListener("click", function () {
  const topic = document.getElementById("topic").value;
  const difficulty = document.getElementById("difficulty").value;
  const numQuestions = document.getElementById("numQuestions").value;

  const apiUrl = `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&difficulty=${difficulty}&limit=${numQuestions}&tags=${topic}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      quizData = data; // Store the fetched quiz data
      displayQuizQuestions();
    })
    .catch((error) => {
      console.error("Error fetching quiz data:", error);
    });

  quizForm.style.display = "none"; // Hide the form
  quizOutput.style.display = "block"; // Show the quiz questions
  // submitButton.style.display = "none"; // Show the submit button
  goToHomepage.style.display = "none"; // Show the homepage button
});

// Function to display quiz questions and answer options
function displayQuizQuestions() {
  const quizOutput = document.getElementById("quizOutput");
  const quizOutputQuestions = document.getElementById("quizOutputQuestions");
  const topicName = document.getElementById("topic").value;
  const difficulty = document.getElementById("difficulty").value;
  // quizOutput.innerHTML = ''; // Clear any previous content

  // Assuming you have the topic in a variable called 'topic'
  document.getElementById("quizTopic").textContent = topicName;
  document.getElementById("quizDifficulty").textContent = difficulty;

  startTimer();

  quizData.forEach((questionData, index) => {
    const question = questionData.question;

    // Filter out null options and keep only non-null options
    const answerOptions = Object.values(questionData.answers).filter(
      (answer) => answer !== null
    );

    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    const questionHeading = document.createElement("h2");
    questionHeading.textContent = `Question ${index + 1}: ${question}`;

    const answerList = document.createElement("ul");

    answerOptions.forEach((answer, answerIndex) => {
      const answerItem = document.createElement("li");
      const answerRadio = document.createElement("input");
      answerRadio.type = "radio";
      answerRadio.name = `question_${index}`;
      answerRadio.value = answer;

      // Add a data attribute to store the correct answer
      answerRadio.dataset.correct =
        questionData.correct_answers[
          `answer_${String.fromCharCode(97 + answerIndex)}_correct`
        ] === "true";

      const answerLabel = document.createElement("label");
      answerLabel.textContent = answer;

      answerItem.appendChild(answerRadio);
      answerItem.appendChild(answerLabel);
      answerList.appendChild(answerItem);
    });

    questionDiv.appendChild(questionHeading);
    questionDiv.appendChild(answerList);

    quizOutputQuestions.appendChild(questionDiv);
  });

  // Hide the form after fetching the quiz
  document.getElementById("quizForm").style.display = "none";
  // Display the Submit Quiz and Homepage buttons
  document.getElementById("submitQuiz").style.display = "block";
  document.getElementById("goToHomepage").style.display = "block";
}

// Function to go back to the quiz questions to analzye answers
document
  .getElementById("analyzeAnswers")
  .addEventListener("click", function () {
    document.getElementById("quizOutput").style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("goToHomepage").style.display = "block";
    document.getElementById("submitQuiz").style.display = "block";
    document.getElementById("resetQuiz").style.display = "block";
  });

// Event listener for the Reset button
document.getElementById("resetQuiz").addEventListener("click", function () {
  // Clear all the radio button selections in the quiz
  startTimer();

  const radioButtons = document.querySelectorAll("input[type=radio]");
  radioButtons.forEach((radio) => {
    radio.checked = false;
  });

  // Clear any warnings for unanswered questions
  const warnings = quizOutput.querySelectorAll(
    ".unanswered-warning, .correct, .incorrect, .correct-answer"
  );
  warnings.forEach((warning) => {
    warning.remove();
  });

  // Clear the results page if it's visible
  const resultsPage = document.getElementById("resultsPage");
  if (resultsPage.style.display === "block") {
    resultsPage.style.display = "none";
  }
});

// Function to submit the quiz and display the results
document.getElementById("submitQuiz").addEventListener("click", function () {
  const quizOutput = document.getElementById("quizOutput");
  const results = document.getElementById("results");
  const radios = quizOutput.querySelectorAll("input[type=radio]:checked");
  const answeredQuestions = new Set();

  radios.forEach((radio) => {
    const questionIndex = parseInt(radio.name.split("_")[1]);
    answeredQuestions.add(questionIndex);
  });

  let correctCount = 0;
  let totalQuestions = quizData.length;

  // Remove all warnings
  const warnings = quizOutput.querySelectorAll(
    ".unanswered-warning, .correct, .incorrect, .correct-answer"
  );
  warnings.forEach((warning) => {
    warning.remove();
  });

  for (let i = 0; i < quizData.length; i++) {
    if (!answeredQuestions.has(i)) {
      const questionDiv = quizOutput.getElementsByClassName("question")[i];
      const warning = document.createElement("p");
      warning.innerHTML =
        '<i class="fas fa-exclamation-triangle" style="color: #ffcc00;"></i> <span style="color: #ffcc00;">Please answer this question.</span>';
      warning.classList.add("unanswered-warning");
      questionDiv.appendChild(warning);
    }
  }

  if (answeredQuestions.size === quizData.length) {
    stopTimer();
    radios.forEach((radio, index) => {
      const questionData = quizData[index];
      const questionDiv = quizOutput.getElementsByClassName("question")[index];
      const feedback = document.createElement("p");

      // Iterate over the correct_answers object to find the correct answer
      let correctAnswer = null;
      for (const key in questionData.correct_answers) {
        if (questionData.correct_answers[key] === "true") {
          correctAnswer = questionData.answers[key.replace("_correct", "")];
          break; // Exit the loop once a correct answer is found
        }
      }

      if (!correctAnswer) {
        correctAnswer = "Not specified"; // Provide a default message if correct answer not found
      }

      const isCorrect = radio.value === correctAnswer;

      if (isCorrect) {
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct!';
        feedback.classList.add("correct");
        questionDiv.appendChild(feedback);
      } else {
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect.';
        feedback.classList.add("incorrect");
        const correctAnswerElement = document.createElement("p");
        correctAnswerElement.innerHTML = `Correct Answer: ${correctAnswer}`;
        correctAnswerElement.classList.add("correct-answer");

        questionDiv.appendChild(feedback);
        questionDiv.appendChild(correctAnswerElement);
      }

      if (isCorrect) {
        correctCount++;
      }
    });
    console.log("line 205");
    displayResultsPage(correctCount, totalQuestions);
    
  }
});

// Function to display the results page
function displayResultsPage(correctCount, totalQuestions) {
  stopTimer();
  const resultsPage = document.getElementById("results");
  resultsPage.style.display = "block";

  const resultsText = document.getElementById("resultsText");
  const topicName = document.getElementById("topic").value;
  const difficulty = document.getElementById("difficulty").value;
  document.getElementById("quizTopicTb").textContent = topicName;
  document.getElementById("quizDifficultyTb").textContent = difficulty;
  resultsText.textContent = `${correctCount}/${totalQuestions}`;

  const endTime = new Date().getTime();
  const timeTaken = endTime - startTime;
  const formattedTime = formatTime(timeTaken);
  const accuracy = (correctCount/totalQuestions) * 100;

  // Display the time taken in the results div
  document.getElementById("timeTaken").textContent = formattedTime;
  document.getElementById("resultsAccuracy").textContent = `${accuracy.toFixed(2)}%`;

  const data = {
    Topic: topicName,
    Difficulty: difficulty,
    TimeTaken: formattedTime,
    Score: resultsText.textContent,
    // Accuracy: accuracy,
  };
  console.log("Line 238, phenchod");
  // Hide the quiz questions
  document.getElementById("quizOutput").style.display = "none";
  document.getElementById("submitQuiz").style.display = "none";
  document.getElementById("goToHomepage").style.display = "none";
  document.getElementById("resetQuiz").style.display = "none";
}

function redirectToHomepage() {
  window.location.href = 'index.html';
}

let timerInterval; // Variable to store the timer interval
let startTime; // Variable to store the timestamp when the timer started

function startTimer() {
  startTime = new Date().getTime();

  timerInterval = setInterval(function () {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const formattedTime = formatTime(elapsedTime);

    const timerDisplay = document.getElementById("quizTimer");
    timerDisplay.textContent = `Timer: ${formattedTime}`;
  }, 1000); // Update every second
}

function stopTimer() {
  clearInterval(timerInterval);
  const timerDisplay = document.getElementById("quizTimer");
  timerDisplay.textContent = "Timer: 00:00";
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

