const apiKey = process.env.QUIZ_API_KEY;

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

function displayQuizQuestions() {
  const quizOutput = document.getElementById("quizOutput");
  const quizOutputQuestions = document.getElementById("quizOutputQuestions");
  const topicName = document.getElementById("topic").value;
  const difficulty = document.getElementById("difficulty").value;

  document.getElementById("quizTopic").textContent = topicName;
  document.getElementById("quizDifficulty").textContent = difficulty;

  startTimer();

  quizData.forEach((questionData, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "bg-white rounded-lg shadow-md p-6 mb-6";

      // Question Header
      const questionHeading = document.createElement("h2");
      questionHeading.className = "text-lg font-semibold text-gray-800 mb-4";
      questionHeading.textContent = `Question ${index + 1}: ${questionData.question}`;

      // Options Container
      const answerList = document.createElement("div");
      answerList.className = "space-y-3";

      // Filter and display options
      const answerOptions = Object.values(questionData.answers).filter(
          (answer) => answer !== null
      );

      answerOptions.forEach((answer, answerIndex) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "relative mb-3";
    
        const optionLabel = document.createElement("label");
        optionLabel.className = "option-label flex items-center p-4 rounded-lg cursor-pointer w-full";
    
        const radioWrapper = document.createElement("div");
        radioWrapper.className = "flex-shrink-0 mr-4";
    
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `question_${index}`;
        radio.value = answer;
        radio.className = "form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500";
        radio.dataset.correct = questionData.correctanswers[
            `answer${String.fromCharCode(97 + answerIndex)}_correct`
        ] === "true";
    
        const optionText = document.createElement("span");
        optionText.className = "option-text text-base flex-grow"; // Added option-text class
        optionText.textContent = answer;
    
        radioWrapper.appendChild(radio);
        optionLabel.appendChild(radioWrapper);
        optionLabel.appendChild(optionText);
        optionDiv.appendChild(optionLabel);
        answerList.appendChild(optionDiv);
      });

      questionDiv.appendChild(questionHeading);
      questionDiv.appendChild(answerList);
      quizOutputQuestions.appendChild(questionDiv);
  });

  document.getElementById("quizForm").style.display = "none";
  document.getElementById("submitQuiz").style.display = "block";
  document.getElementById("goToHomepage").style.display = "none";
}

// Function to go back to the quiz questions to analzye answers
document
  .getElementById("analyzeAnswers")
  .addEventListener("click", function () {
    document.getElementById("quizOutput").style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("goToHomepage").style.display = "none";
    document.getElementById("submitQuiz").style.display = "block";
    document.getElementById("resetQuiz").style.display = "none";
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
  // Hide the quiz questions
  document.getElementById("quizOutput").style.display = "none";
  document.getElementById("submitQuiz").style.display = "none";
  document.getElementById("goToHomepage").style.display = "none";
  document.getElementById("resetQuiz").style.display = "none";
}

function redirectToHomepage() {
  window.location.href = "index.html";
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
