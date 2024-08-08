document.addEventListener('DOMContentLoaded', function() {
    // Get the data from the script tag
    const dataScript = document.getElementById('data-script');
    let quizData = [];
    
    try {
        quizData = JSON.parse(dataScript.textContent);
    } catch (error) {
        console.error('Error parsing data:', error);
    }

    if (!Array.isArray(quizData)) {
        console.error('Invalid data format');
        return;
    }

    // Handle empty data
    if (quizData.length === 0) {
        document.getElementById('quizCardsContainer').innerHTML = '<p>No quiz data available.</p>';
        document.getElementById('maxAccuracy').textContent = '--%';
        document.getElementById('minAccuracy').textContent = '--%';
        return;
    }

    // Generate quiz cards
    const quizCardsContainer = document.getElementById('quizCardsContainer');
    quizData.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${quiz.Topic || 'No Topic'}</h3>
            <p><strong>Difficulty:</strong> ${quiz.Difficulty || 'N/A'}</p>
            <p><strong>Time Taken:</strong> ${quiz.TimeTaken || 'N/A'}</p>
            <p><strong>Score:</strong> ${quiz.Score || 'N/A'}</p>
            <p><strong>Accuracy:</strong> ${quiz.Accuracy || 'N/A'}</p>
        `;
        quizCardsContainer.appendChild(card);
    });

    // Calculate and display accuracy
    const accuracies = quizData.map(q => parseFloat(q.Accuracy));
    if (accuracies.length > 0) {
        const maxAccuracy = Math.max(...accuracies);
        const minAccuracy = Math.min(...accuracies);
        document.getElementById('maxAccuracy').textContent = `${maxAccuracy.toFixed(2)}%`;
        document.getElementById('minAccuracy').textContent = `${minAccuracy.toFixed(2)}%`;
    } else {
        document.getElementById('maxAccuracy').textContent = '--%';
        document.getElementById('minAccuracy').textContent = '--%';
    }

    // Line graph for quizzes taken per day
    const quizzesPerDayData = getQuizzesPerDayData(quizData);
    const quizzesPerDayChart = document.getElementById('quizzesPerDayChart').getContext('2d');
    new Chart(quizzesPerDayChart, {
        type: 'line',
        data: {
            labels: quizzesPerDayData.labels,
            datasets: [{
                label: 'Quizzes Taken Per Day',
                data: quizzesPerDayData.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        }
    });

    // Bar plot for topic-wise maximum score
    const topicScores = getTopicWiseScores(quizData);
    const topicWiseScoreChart = document.getElementById('topicWiseScoreChart').getContext('2d');
    new Chart(topicWiseScoreChart, {
        type: 'bar',
        data: {
            labels: Object.keys(topicScores),
            datasets: [{
                label: 'Maximum Score Attained',
                data: Object.values(topicScores),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    function getQuizzesPerDayData(quizData) {
        // Generate quizzes per day data
        const dailyCounts = {};
        quizData.forEach(quiz => {
            const date = new Date(); // Use current date as fallback if date is not available
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });

        const labels = Object.keys(dailyCounts);
        const data = Object.values(dailyCounts);
        return { labels, data };
    }

    function getTopicWiseScores(quizData) {
        // Aggregate scores by topic
        return quizData.reduce((acc, quiz) => {
            const score = parseInt(quiz.Score.split('/')[0], 10); // Parse the numeric score
            if (!acc[quiz.Topic] || score > acc[quiz.Topic]) {
                acc[quiz.Topic] = score;
            }
            return acc;
        }, {});
    }
});
