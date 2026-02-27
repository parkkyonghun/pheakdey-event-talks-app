
const fs = require('fs');
const path = require('path');

// Placeholder for talk data (will be imported later)
const talks = [
    // Dummy talks will go here
];

const eventStartTime = '10:00 AM'; // Event starts at 10:00 AM
const talkDuration = 60; // 1 hour in minutes
const transitionDuration = 10; // 10 minutes transition
const lunchBreakDuration = 60; // 1 hour lunch break

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function calculateSchedule() {
    let currentHour = parseInt(eventStartTime.split(':')[0]);
    let currentMinute = parseInt(eventStartTime.split(':')[1].split(' ')[0]);
    const isPM = eventStartTime.includes('PM');
    if (isPM && currentHour !== 12) currentHour += 12;
    if (!isPM && currentHour === 12) currentHour = 0; // Midnight case

    let currentTime = new Date(2026, 1, 27, currentHour, currentMinute); // Use a dummy date

    const schedule = [];
    let talkIndex = 0;

    for (let i = 0; i < talks.length; i++) {
        // Add talk
        const talk = talks[i];
        const talkStartTime = formatTime(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + talk.duration);
        const talkEndTime = formatTime(currentTime);

        schedule.push({
            type: 'talk',
            ...talk,
            startTime: talkStartTime,
            endTime: talkEndTime
        });

        // Add lunch break after the 3rd talk
        if (i === 2) {
            currentTime.setMinutes(currentTime.getMinutes() + transitionDuration); // Transition before lunch
            const lunchStartTime = formatTime(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + lunchBreakDuration);
            const lunchEndTime = formatTime(currentTime);
            schedule.push({
                type: 'break',
                name: 'Lunch Break',
                startTime: lunchStartTime,
                endTime: lunchEndTime,
                duration: lunchBreakDuration
            });
        }

        // Add transition if not the last talk
        if (i < talks.length - 1) {
            currentTime.setMinutes(currentTime.getMinutes() + transitionDuration);
        }
    }
    return schedule;
}

function generateHtml(schedule, css, js) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Talks Event</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <header>
        <h1>Technical Talks Event Schedule</h1>
    </header>
    <main>
        <section id="filter-section">
            <input type="text" id="category-search" placeholder="Search by category...">
            <div id="category-filters"></div>
        </section>
        <section id="schedule">
            <!-- Schedule will be dynamically loaded here -->
        </section>
    </main>
    <script>
        const talksData = ${JSON.stringify(schedule.filter(item => item.type === 'talk'), null, 2)};
        const fullSchedule = ${JSON.stringify(schedule, null, 2)};
        ${js}
    </script>
</body>
</html>`;
}

async function buildSite() {
    // Read CSS and JS files
    const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

    // Load talks (dummy data for now)
    const dummyTalks = [
        { id: 'talk-1', title: 'The Future of AI in Web Development', speakers: ['Dr. Ava Sharma'], category: ['AI', 'Web Development'], duration: 60, description: 'Explore how AI is transforming modern web development workflows and user experiences.' },
        { id: 'talk-2', title: 'Demystifying Blockchain: Beyond Cryptocurrencies', speakers: ['Ben Carter'], category: ['Blockchain', 'Security'], duration: 60, description: 'Understand the core concepts of blockchain technology and its potential applications outside of digital currencies.' },
        { id: 'talk-3', title: 'Mastering React Hooks for Performance', speakers: ['Chloe Davis', 'David Lee'], category: ['React', 'Frontend'], duration: 60, description: 'Learn advanced techniques for optimizing React component performance using hooks.' },
        { id: 'talk-4', title: 'Cloud-Native Architectures with Kubernetes', speakers: ['Dr. Ethan Miller'], category: ['Cloud', 'DevOps', 'Kubernetes'], duration: 60, description: 'Design and deploy scalable, resilient applications using Kubernetes in a cloud-native environment.' },
        { id: 'talk-5', title: 'Introduction to Quantum Computing', speakers: ['Fiona Green'], category: ['Quantum Computing', 'Physics'], duration: 60, description: 'An accessible overview of quantum computing principles and its potential to solve complex problems.' },
        { id: 'talk-6', title: 'Effective API Design with GraphQL', speakers: ['Grace Hall', 'Henry King'], category: ['API', 'Backend', 'GraphQL'], duration: 60, description: 'Best practices for designing flexible and efficient APIs using GraphQL.' },
    ];
    talks.push(...dummyTalks); // Populate the global talks array

    const schedule = calculateSchedule();
    const htmlOutput = generateHtml(schedule, cssContent, jsContent);

    fs.writeFileSync(path.join(__dirname, 'index.html'), htmlOutput);
    console.log('index.html generated successfully!');
}

buildSite();
