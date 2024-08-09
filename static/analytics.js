document.addEventListener("DOMContentLoaded", function () {
  const dataScript = document.getElementById("data-script");
  let quizData = [];

  try {
    quizData = JSON.parse(dataScript.textContent);
  } catch (error) {
    console.error("Error parsing data:", error);
  }

  if (!Array.isArray(quizData) || quizData.length === 0) {
    handleEmptyData();
    return;
  }

//   console.log("Quiz Data:", quizData);

  generateQuizCards(quizData);
  displayAccuracyStats(quizData);
  createCharts(quizData);
});

function handleEmptyData() {
  document.getElementById("quizCardsContainer").innerHTML =
    "<p>No quiz data available.</p>";
  ["maxAccuracy", "minAccuracy", "avgAccuracy", "totalQuizzes"].forEach(
    (id) => {
      document.getElementById(id).textContent = "--";
    }
  );
  document.querySelectorAll(".chart-container").forEach((container) => {
    container.style.display = "none";
  });
}

function generateQuizCards(quizData) {
  const fragment = document.createDocumentFragment();
  const quizCardsContainer = document.getElementById("quizCardsContainer");

  quizData.forEach((quiz, index) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    card.innerHTML = `
            <h3>${quiz.Topic || "No Topic"}</h3>
            <p><strong>Quiz ${index + 1}</strong></p>
            <p><strong>Difficulty:</strong> ${quiz.Difficulty || "N/A"}</p>
            <p><strong>Time Taken:</strong> ${quiz.TimeTaken || "N/A"}</p>
            <p><strong>Score:</strong> ${quiz.Score || "N/A"}</p>
            <p><strong>Accuracy:</strong> ${quiz.Accuracy || "N/A"}</p>
        `;
    fragment.appendChild(card);
  });

  quizCardsContainer.innerHTML = "";
  quizCardsContainer.appendChild(fragment);
}

function displayAccuracyStats(quizData) {
  const accuracies = quizData.map((q) => parseFloat(q.Accuracy));
  if (accuracies.length > 0) {
    const maxAccuracy = Math.max(...accuracies);
    const minAccuracy = Math.min(...accuracies);
    const avgAccuracy =
      accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    document.getElementById("maxAccuracy").textContent = `${maxAccuracy.toFixed(
      2
    )}%`;
    document.getElementById("minAccuracy").textContent = `${minAccuracy.toFixed(
      2
    )}%`;
    document.getElementById("avgAccuracy").textContent = `${avgAccuracy.toFixed(
      2
    )}%`;
    document.getElementById("totalQuizzes").textContent = quizData.length;
  } else {
    handleEmptyData();
  }
}

function createCharts(quizData) {
  createQuizzesPerDayChart(quizData);
  createTopicWiseScoreChart(quizData);
  createDifficultyDistributionChart(quizData);
  createAccuracyTrendChart(quizData);
}

function createQuizzesPerDayChart(quizData) {
  const quizzesPerDayData = getQuizzesPerDayData(quizData);
  const ctx = document.getElementById("quizzesPerDayChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: quizzesPerDayData.labels,
      datasets: [
        {
          label: "Quizzes Taken",
          data: quizzesPerDayData.data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Quizzes",
          },
        },
      },
    },
  });
}

function createTopicWiseScoreChart(quizData) {
  const topicScores = getTopicWiseScores(quizData);
  const ctx = document.getElementById("topicWiseScoreChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(topicScores),
      datasets: [
        {
          label: "Maximum Score",
          data: Object.values(topicScores),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Score",
          },
        },
      },
    },
  });
}

function createDifficultyDistributionChart(quizData) {
  const difficultyDistribution = getDifficultyDistribution(quizData);
  const ctx = document
    .getElementById("difficultyDistributionChart")
    .getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(difficultyDistribution),
      datasets: [
        {
          data: Object.values(difficultyDistribution),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Quiz Difficulty Distribution",
        },
      },
    },
  });
}

function createAccuracyTrendChart(quizData) {
  const accuracyTrend = getAccuracyTrend(quizData);
  const ctx = document.getElementById("accuracyTrendChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: accuracyTrend.labels,
      datasets: [
        {
          label: "Accuracy",
          data: accuracyTrend.data,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Accuracy (%)",
          },
        },
      },
    },
  });
}

function getQuizzesPerDayData(quizData) {
  const dailyCounts = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };
  quizData.forEach((quiz) => {
    const date = new Date(); // You might want to use the actual date from the quiz data if available
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    dailyCounts[day]++;
  });

  return {
    labels: Object.keys(dailyCounts),
    data: Object.values(dailyCounts),
  };
}

function getTopicWiseScores(quizData) {
  return quizData.reduce((acc, quiz) => {
    const score = parseInt(quiz.Score.split("/")[0], 10);
    if (!acc[quiz.Topic] || score > acc[quiz.Topic]) {
      acc[quiz.Topic] = score;
    }
    return acc;
  }, {});
}

function getDifficultyDistribution(quizData) {
  return quizData.reduce((acc, quiz) => {
    acc[quiz.Difficulty] = (acc[quiz.Difficulty] || 0) + 1;
    return acc;
  }, {});
}

function getAccuracyTrend(quizData) {
  const accuracies = quizData.map((quiz) => parseFloat(quiz.Accuracy));
  return {
    labels: quizData.map((_, index) => `Quiz ${index + 1}`),
    data: accuracies,
  };
}
