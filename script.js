const quizDuration = 30 * 60;
let secondsLeft = quizDuration;
let timerId = null;
let startedAt = null;
let currentQuestion = 0;
let answers = [];

const graph = {
  basic: `
    <svg viewBox="0 0 420 220" role="img" aria-label="A bowed-out production possibility curve">
      <path d="M48 190H394M48 190V23" stroke="#94a3b8" stroke-width="2"/>
      <path d="M58 180 C124 172 155 146 202 105 C250 63 305 38 383 27" fill="none" stroke="#2563eb" stroke-width="4"/>
      <text x="356" y="210" fill="#64748b" font-size="12">Good X</text><text x="10" y="28" fill="#64748b" font-size="12">Good Y</text>
    </svg>`,
  points: `
    <svg viewBox="0 0 420 220" role="img" aria-label="Production possibility curve with points A, B and C">
      <path d="M48 190H394M48 190V23" stroke="#94a3b8" stroke-width="2"/>
      <path d="M58 180 C124 172 155 146 202 105 C250 63 305 38 383 27" fill="none" stroke="#2563eb" stroke-width="4"/>
      <circle cx="150" cy="140" r="6" fill="#f97316"/><text x="138" y="130" fill="#334155" font-weight="700" font-size="13">A</text>
      <circle cx="227" cy="84" r="6" fill="#10b981"/><text x="236" y="80" fill="#334155" font-weight="700" font-size="13">B</text>
      <circle cx="247" cy="145" r="6" fill="#dc2626"/><text x="257" y="150" fill="#334155" font-weight="700" font-size="13">C</text>
      <text x="356" y="210" fill="#64748b" font-size="12">Good X</text><text x="10" y="28" fill="#64748b" font-size="12">Good Y</text>
    </svg>`,
  shifts: `
    <svg viewBox="0 0 420 220" role="img" aria-label="Two production possibility curves">
      <path d="M48 190H394M48 190V23" stroke="#94a3b8" stroke-width="2"/>
      <path d="M57 181 C120 174 153 148 202 107 C250 66 309 39 383 27" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="7 6"/>
      <path d="M57 181 C124 166 178 125 223 77 C267 32 319 20 383 17" fill="none" stroke="#10b981" stroke-width="4"/>
      <text x="319" y="38" fill="#047857" font-size="12">PPC2</text><text x="316" y="64" fill="#64748b" font-size="12">PPC1</text>
      <text x="356" y="210" fill="#64748b" font-size="12">Good X</text><text x="10" y="28" fill="#64748b" font-size="12">Good Y</text>
    </svg>`,
  line: `
    <svg viewBox="0 0 420 220" role="img" aria-label="A straight-line production possibility curve">
      <path d="M48 190H394M48 190V23" stroke="#94a3b8" stroke-width="2"/>
      <path d="M61 178 L369 34" fill="none" stroke="#2563eb" stroke-width="4"/>
      <text x="356" y="210" fill="#64748b" font-size="12">Good X</text><text x="10" y="28" fill="#64748b" font-size="12">Good Y</text>
    </svg>`
};

const questions = [
  { type: "CONCEPT", question: "What does a production possibility curve (PPC) show?", options: ["The maximum profit a firm can earn", "The maximum combinations of two goods that can be produced with available resources and technology", "The total demand for two goods", "The combinations consumers prefer"], answer: 1, explanation: "A PPC is a boundary showing the maximum attainable combinations of two goods, given fixed resources and technology.", why: ["This describes profit, not the economy's production limit.", "Correct. It captures scarcity, resources, technology, and the tradeoff between two outputs.", "Demand is represented by a demand curve, not a PPC.", "Preferences help determine choice, but do not define the production frontier."] },
  { type: "GRAPH", question: "In the graph, a point on the PPC represents a combination that is...", visual: graph.basic, options: ["Unattainable with current resources", "Inefficient because resources are idle", "Productively efficient and attainable", "Always the socially preferred choice"], answer: 2, explanation: "Every point on the frontier is attainable and uses available resources efficiently. The PPC does not tell us which efficient point society prefers.", why: ["Points beyond the curve are unattainable, not points on it.", "Points inside the curve indicate inefficiency; points on it are efficient.", "Correct. The frontier marks maximum attainable output combinations.", "Efficiency does not automatically determine social preference or equity."] },
  { type: "CONCEPT", question: "A point inside a country's PPC most directly indicates...", options: ["Economic growth", "Underused resources or productive inefficiency", "An impossible production plan", "Full productive efficiency"], answer: 1, explanation: "An interior point is attainable, but the economy could produce more of at least one good without producing less of the other.", why: ["Growth shifts the PPC outward; it is not represented by an interior point.", "Correct. Idle labor, unemployment, or poor organization can place production inside the curve.", "Points outside the curve are currently unattainable.", "Full efficiency is represented by points on the PPC."] },
  { type: "GRAPH", question: "Point C lies outside the PPC shown. What is the best interpretation?", visual: graph.points, options: ["It is efficient and attainable today", "It is inefficient but attainable today", "It represents the economy's current equilibrium", "It is unattainable with current resources and technology"], answer: 3, explanation: "Point C is outside the frontier, so current resources and technology cannot produce that combination. It may become attainable after growth or technological progress.", why: ["A point on the curve, such as A or B, is efficient and attainable.", "Interior points are attainable but inefficient; C is beyond the frontier.", "The graph gives no information about equilibrium or market clearing.", "Correct. Outside the PPC means unattainable under current conditions."] },
  { type: "CONCEPT", question: "A bowed-out PPC usually reflects...", visual: graph.basic, options: ["Constant opportunity cost", "Increasing opportunity cost", "Zero opportunity cost", "A lack of scarcity"], answer: 1, explanation: "As more of one good is produced, increasingly less-suitable resources are pulled away from the other good. Its opportunity cost rises.", why: ["A straight-line PPC usually represents constant opportunity cost.", "Correct. The bowed-out shape reflects increasing opportunity cost.", "Scarcity means opportunity cost is generally not zero.", "The PPC exists precisely because resources are scarce."] },
  { type: "CALCULATION", question: "An economy moves from producing (0 computers, 20 tons of food) to (5 computers, 18 tons of food). What is the opportunity cost of the 5 computers?", options: ["2 tons of food", "5 tons of food", "18 tons of food", "23 tons of food"], answer: 0, explanation: "Opportunity cost is what is given up. Food falls from 20 to 18, so the cost of producing 5 computers is 2 tons of food.", why: ["Correct. The reduction in food is 20 - 18 = 2 tons.", "The 5 is the quantity of computers gained, not the food cost.", "18 is the final food output, not what was sacrificed.", "23 adds outputs; opportunity cost measures the forgone alternative."] },
  { type: "CONCEPT", question: "If a PPC is a straight line, the opportunity cost of one more unit of either good is...", visual: graph.line, options: ["Increasing", "Decreasing", "Constant", "Impossible to calculate"], answer: 2, explanation: "A straight-line PPC has a constant slope, so each additional unit of one good requires the same sacrifice of the other good.", why: ["Increasing opportunity cost produces a bowed-out curve.", "Decreasing opportunity cost would produce a bowed-in curve.", "Correct. A constant slope means a constant opportunity cost.", "The slope of the line allows the cost to be calculated."] },
  { type: "CONCEPT", question: "Which event would most likely shift a nation's entire PPC outward?", visual: graph.shifts, options: ["A temporary rise in unemployment", "A fall in worker productivity", "A discovery that improves technology for both goods", "Moving from an interior point to the curve"], answer: 2, explanation: "Technology that raises the productive capacity for both goods expands the entire set of attainable combinations, shifting the PPC outward.", why: ["Unemployment moves production toward the frontier; it does not expand the frontier.", "Lower productivity reduces capacity and may shift the PPC inward.", "Correct. Broad technological progress increases productive capacity.", "This is a movement to a point on the existing PPC, not a shift."] },
  { type: "CONCEPT", question: "A PPC shifts inward when...", options: ["The labor force becomes more skilled", "A natural disaster destroys factories and farmland", "Workers return from unemployment", "A new resource is discovered"], answer: 1, explanation: "An inward shift means the economy can produce less than before. Destruction of productive resources reduces capacity.", why: ["Skills generally expand productive capacity and shift the PPC outward.", "Correct. Destroyed resources lower the maximum possible output.", "Returning workers to production moves the economy toward the existing curve.", "A new resource expands the frontier rather than contracting it."] },
  { type: "CONCEPT", question: "Which statement best describes scarcity and the PPC?", options: ["Scarcity means every want can be satisfied", "Scarcity creates the need to choose among alternative uses of limited resources", "Scarcity exists only in poor countries", "Scarcity eliminates opportunity cost"], answer: 1, explanation: "Limited resources and unlimited wants force choices. The PPC makes those choices and their opportunity costs visible.", why: ["Scarcity means resources are insufficient for every want.", "Correct. Limited resources require choices between alternatives.", "Scarcity is a universal economic condition.", "Scarcity creates opportunity cost rather than eliminating it."] },
  { type: "CALCULATION", question: "A straight-line PPC has endpoints of 40 units of wheat and 20 units of cloth. What is the opportunity cost of 1 unit of cloth?", options: ["0.5 units of wheat", "2 units of wheat", "20 units of wheat", "40 units of wheat"], answer: 0, explanation: "Moving from all wheat to all cloth gives up 40 wheat for 20 cloth. Cost per cloth = 40 / 20 = 2 wheat, so the correct answer is 2 units of wheat.", why: ["0.5 is the reverse ratio: cloth per wheat, not wheat per cloth.", "Correct. 40 wheat / 20 cloth = 2 wheat per cloth.", "20 is the total cloth endpoint, not the cost of one cloth.", "40 is the total wheat forgone for all 20 cloth, not for one unit."] },
  { type: "CONCEPT", question: "Economic growth is represented on a PPC diagram by...", options: ["A movement from a point on the curve to an interior point", "A shift of the PPC outward", "A shift of the PPC inward", "A movement along the same curve only"], answer: 1, explanation: "Growth increases an economy's productive capacity, so the whole frontier shifts outward.", why: ["Moving inward reflects lower production or unused resources.", "Correct. An outward shift means more can be produced at every tradeoff.", "An inward shift indicates a loss of capacity.", "A movement along the same curve changes the mix, not total capacity."] },
  { type: "CALCULATION", question: "A PPC follows the equation 2X + Y = 20. If X = 6, what is the maximum Y?", options: ["6", "8", "12", "20"], answer: 1, explanation: "Substitute X = 6: 2(6) + Y = 20, so 12 + Y = 20 and Y = 8.", why: ["6 is the value of X, not the solved value of Y.", "Correct. Y = 20 - 12 = 8.", "12 is 2X, the amount of the constraint used by X.", "20 is the maximum Y only when X = 0."] },
  { type: "CONCEPT", question: "The slope of a PPC measures...", options: ["Total economic profit", "The opportunity cost of one good in terms of the other", "The level of consumer satisfaction", "The amount of money in circulation"], answer: 1, explanation: "The slope compares the change in one output with the change in the other output. In absolute value, it measures opportunity cost.", why: ["Profit requires revenue and cost information, not just output combinations.", "Correct. The PPC slope is the tradeoff between the two goods.", "Satisfaction is not measured by the production frontier.", "Money supply is a macroeconomic policy variable."] },
  { type: "CALCULATION", question: "At point A, an economy makes 10 cars and 30 buses. At point B, it makes 12 cars and 24 buses. What is the opportunity cost per additional car?", options: ["2 buses", "3 buses", "6 buses", "12 buses"], answer: 1, explanation: "The economy gains 2 cars and gives up 6 buses. The cost per car is 6 / 2 = 3 buses.", why: ["2 is the number of cars gained, not the buses sacrificed per car.", "Correct. 6 buses / 2 cars = 3 buses per car.", "6 is the total number of buses given up for both cars.", "12 is the final number of cars, not the opportunity cost."] },
  { type: "CONCEPT", question: "Why does the PPC illustrate a tradeoff?", options: ["Resources can produce unlimited amounts of both goods", "Resources used to produce one good cannot simultaneously produce as much of the other", "Prices are always fixed", "Consumers always buy both goods equally"], answer: 1, explanation: "With limited resources, producing more of one good generally means redirecting resources away from the other.", why: ["Unlimited resources would remove the tradeoff.", "Correct. Resource constraints force the economy to give up some alternative output.", "Prices are not required for a PPC tradeoff to exist.", "Consumer buying patterns do not define the production constraint."] },
  { type: "CONCEPT", question: "Which change would move an economy along its PPC rather than shift the PPC?", options: ["Choosing to produce more medical equipment and fewer cars", "An invention that improves both industries", "A larger labor force", "The destruction of capital"], answer: 0, explanation: "Changing the chosen mix of outputs, while resources and technology stay fixed, moves the economy to another point on the same frontier.", why: ["Correct. A different output mix is a movement along the same PPC.", "Broad innovation shifts the PPC outward.", "More labor expands productive capacity.", "Destroyed capital shifts the PPC inward."] },
  { type: "CALCULATION", question: "A country can produce either 100 units of food or 50 units of clothing, with a linear PPC. What is the opportunity cost of 25 units of clothing?", options: ["12.5 units of food", "25 units of food", "50 units of food", "100 units of food"], answer: 2, explanation: "The tradeoff is 100 food for 50 clothing, or 2 food per clothing. Therefore 25 clothing costs 25 x 2 = 50 food.", why: ["12.5 uses the reversed ratio.", "25 is the clothing quantity, not the forgone food.", "Correct. 25 clothing x 2 food per clothing = 50 food.", "100 food is the cost of producing all 50 clothing."] },
  { type: "CONCEPT", question: "Which assumption is commonly made when using a basic two-good PPC model?", options: ["Resources and technology are held constant", "All resources are unlimited", "The economy produces no goods", "Opportunity cost does not exist"], answer: 0, explanation: "Holding resources and technology constant lets the model focus on the tradeoff between the two outputs.", why: ["Correct. This ceteris paribus assumption defines the current frontier.", "Unlimited resources would make the frontier and scarcity irrelevant.", "The model describes possible production, not zero production.", "Opportunity cost is the central idea illustrated by a PPC."] },
  { type: "CONCEPT", question: "If resources are specialized, shifting resources between two goods will generally cause...", options: ["A constant opportunity cost", "An increasing opportunity cost", "No opportunity cost", "An inward shift in every case"], answer: 1, explanation: "Specialized resources are better suited to some tasks than others. As production expands, less-suitable resources must be reassigned, raising the opportunity cost.", why: ["Constant cost requires a straight-line PPC and interchangeable resources.", "Correct. Specialization helps explain the bowed-out PPC.", "Every choice among scarce resources has an opportunity cost.", "Reallocating resources changes the mix; it does not automatically shrink capacity."] },
  { type: "CALCULATION", question: "A PPC table shows: 0 bikes/60 helmets, 10 bikes/54 helmets, 20 bikes/44 helmets. What is the cost of the second 10 bikes?", options: ["6 helmets", "10 helmets", "12 helmets", "16 helmets"], answer: 1, explanation: "For the second 10 bikes, compare 10 bikes/54 helmets with 20 bikes/44 helmets. Helmets fall by 10, so the cost is 10 helmets.", why: ["6 helmets is the cost of the first 10 bikes, from 60 down to 54.", "Correct. The second 10 bikes cost 54 - 44 = 10 helmets.", "12 is the total helmet loss from 0 to 20 bikes, not the second increment.", "16 does not match either relevant change in the table."] },
  { type: "CONCEPT", question: "If an economy is operating at a point on its PPC, which statement must be true?", options: ["The economy is using resources productively efficiently", "Everyone receives equal income", "The output mix is socially fair", "The economy has no unemployment of any type"], answer: 0, explanation: "A point on the frontier indicates productive efficiency under the model. It does not establish fairness, equality, or the absence of frictional unemployment.", why: ["Correct. The economy cannot increase one output without reducing the other at that point.", "The PPC says nothing about income distribution.", "Productive efficiency is different from social fairness.", "The simple PPC does not identify every kind of unemployment."] },
  { type: "GRAPH", question: "The dashed curve is PPC1 and the solid curve is PPC2. What could cause the outward shift to PPC2?", visual: graph.shifts, options: ["A fall in productivity", "A war that destroys factories", "Investment in new productive capital", "A move from an interior point to PPC1"], answer: 2, explanation: "Investment adds capital and can increase the economy's maximum output, shifting the frontier outward.", why: ["Lower productivity reduces the frontier.", "Destroyed factories reduce productive capacity.", "Correct. New capital can expand productive capacity.", "A movement to PPC1 changes actual production but does not shift the frontier."] },
  { type: "CALCULATION", question: "If the PPC slope is -3, what is the opportunity cost of producing 4 additional units of Good X?", options: ["1 unit of Good Y", "3 units of Good Y", "7 units of Good Y", "12 units of Good Y"], answer: 3, explanation: "The absolute slope is 3, so each additional X costs 3 units of Y. Four X cost 4 x 3 = 12 Y.", why: ["1 is not the slope's tradeoff.", "3 is the cost of one X, not four X.", "7 has no basis in the given slope.", "Correct. 4 X x 3 Y per X = 12 Y."] },
  { type: "CONCEPT", question: "A country produces at an interior point during a recession. Which policy outcome would move production closer to the PPC without shifting it?", options: ["Using fiscal or monetary policy to support aggregate demand and employment", "Inventing a new production technology", "Discovering a large oil reserve", "Destroying obsolete factories"], answer: 0, explanation: "When capacity exists but resources are idle, stronger demand and employment can move actual output toward the existing frontier. Technology and resources shift the frontier.", why: ["Correct. It can activate idle resources and raise actual output toward capacity.", "New technology shifts the PPC outward.", "New resources shift the PPC outward.", "Destruction reduces the frontier's capacity."] },
  { type: "CALCULATION", question: "A country moves from 30 food and 5 machines to 24 food and 7 machines. What is the opportunity cost of each additional machine?", options: ["2 units of food", "3 units of food", "6 units of food", "12 units of food"], answer: 1, explanation: "The country gains 2 machines and gives up 6 food. The cost per machine is 6 / 2 = 3 food.", why: ["2 is the number of machines gained, not food per machine.", "Correct. 6 food / 2 machines = 3 food per machine.", "6 is the total food sacrificed for both machines.", "12 doubles the actual total sacrifice and is not supported by the data."] },
  { type: "GRAPH", question: "Which labeled location would be productively inefficient in the graph?", visual: graph.points, options: ["A, because it is inside the PPC", "B, because it is on the PPC", "C, because it is outside the PPC", "None of them; all locations have the same meaning"], answer: 0, explanation: "Point A is inside the frontier, so the economy could increase at least one output without reducing the other. B is efficient; C is unattainable.", why: ["Correct. Interior point A indicates unused resources or inefficiency.", "A point on the PPC is productively efficient.", "An outside point is unattainable, not inefficient production.", "The locations have different economic meanings."] },
  { type: "CALCULATION", question: "A PPC allows 80 units of Y when X = 0 and 20 units of X when Y = 0. If it is linear, what is the opportunity cost of 1 unit of X?", options: ["0.25 units of Y", "4 units of Y", "20 units of Y", "80 units of Y"], answer: 1, explanation: "The economy gives up 80 Y to gain 20 X. The cost per X is 80 / 20 = 4 Y.", why: ["0.25 is the reverse ratio: X per Y.", "Correct. 80 Y / 20 X = 4 Y per X.", "20 is the maximum X, not the cost of one X.", "80 is the total Y sacrificed for all 20 X."] },
  { type: "CONCEPT", question: "Which statement distinguishes productive efficiency from allocative efficiency?", options: ["Productive efficiency means being on the PPC; allocative efficiency means choosing the point that best matches society's preferences", "They are exactly the same concept", "Productive efficiency is inside the PPC; allocative efficiency is outside it", "Allocative efficiency concerns only a firm's accounting profit"], answer: 0, explanation: "Productive efficiency concerns whether resources are fully and effectively used. Allocative efficiency concerns whether the chosen mix reflects society's marginal benefits and costs.", why: ["Correct. The PPC identifies productive efficiency, while preferences help identify the allocatively best point.", "They are related but not identical.", "The locations are reversed: an interior point is productively inefficient, and an outside point is unattainable.", "Allocative efficiency is a broader social choice, not just accounting profit."] },
  { type: "CONCEPT", question: "If technology improves only the production of Good X, the PPC will most likely...", options: ["Shift outward equally along both axes", "Pivot outward on the X-axis side", "Shift inward equally along both axes", "Disappear because opportunity cost is zero"], answer: 1, explanation: "A technology improvement specific to X raises the maximum possible X and changes tradeoffs involving X, so the frontier pivots outward toward the X intercept.", why: ["Equal improvement for both goods would be needed for an equal outward shift.", "Correct. Only X's productive capacity improves, producing an asymmetric shift.", "The improvement does not reduce capacity.", "Opportunity cost remains because resources remain scarce."] },
];

const $ = (id) => document.getElementById(id);
const introPanel = $("intro-panel");
const quizPanel = $("quiz-panel");
const resultsPanel = $("results-panel");

function renderQuestion() {
  const item = questions[currentQuestion];
  $("question-count").textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  $("progress-percent").textContent = `${Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete`;
  $("progress-bar").style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  $("question-type").textContent = item.type;
  $("question-title").textContent = item.question;
  $("question-number").textContent = String(currentQuestion + 1).padStart(2, "0");
  $("prev-btn").disabled = currentQuestion === 0;
  $("next-btn").innerHTML = currentQuestion === questions.length - 1 ? "Finish quiz <span>✓</span>" : "Next question <span>→</span>";

  const visual = $("visual-container");
  if (item.visual) {
    visual.innerHTML = item.visual;
    visual.classList.remove("hidden");
  } else {
    visual.innerHTML = "";
    visual.classList.add("hidden");
  }

  $("options").innerHTML = item.options.map((option, index) => `
    <button class="option ${answers[currentQuestion] === index ? "selected" : ""}" data-index="${index}" role="radio" aria-checked="${answers[currentQuestion] === index}">
      <span class="option-letter">${String.fromCharCode(65 + index)}</span>
      <span class="option-text">${option}</span>
    </button>
  `).join("");

  document.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => {
      answers[currentQuestion] = Number(button.dataset.index);
      renderQuestion();
    });
  });
  renderQuestionGrid();
}

function renderQuestionGrid() {
  $("question-grid").innerHTML = questions.map((_, index) => `
    <button class="${index === currentQuestion ? "current" : ""} ${answers[index] !== null ? "answered" : ""}" aria-label="Go to question ${index + 1}">${index + 1}</button>
  `).join("");
  document.querySelectorAll("#question-grid button").forEach((button, index) => {
    button.addEventListener("click", () => {
      currentQuestion = index;
      renderQuestion();
    });
  });
  $("answered-count").textContent = `${answers.filter((answer) => answer !== null).length}/${questions.length}`;
}

function updateTimer() {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  $("timer").textContent = `${minutes}:${seconds}`;
  $("timer").classList.toggle("warning", secondsLeft <= 300 && secondsLeft > 60);
  $("timer").classList.toggle("danger", secondsLeft <= 60);
  if (secondsLeft <= 0) finishQuiz(true);
  secondsLeft -= 1;
}

function startTimer() {
  startedAt = Date.now();
  updateTimer();
  timerId = setInterval(updateTimer, 1000);
}

function finishQuiz(timeExpired = false) {
  if (timerId) clearInterval(timerId);
  timerId = null;
  const correct = answers.reduce((total, answer, index) => total + (answer === questions[index].answer ? 1 : 0), 0);
  const incorrect = questions.length - correct;
  const usedSeconds = quizDuration - Math.max(secondsLeft, 0);
  const usedMinutes = Math.floor(usedSeconds / 60).toString().padStart(2, "0");
  const usedRemainder = (usedSeconds % 60).toString().padStart(2, "0");
  $("score-value").textContent = `${Math.round((correct / questions.length) * 100)}%`;
  $("correct-stat").textContent = correct;
  $("incorrect-stat").textContent = incorrect;
  $("time-stat").textContent = `${usedMinutes}:${usedRemainder}`;
  $("results-title").textContent = timeExpired ? "Time is up." : correct >= 24 ? "Excellent work." : correct >= 18 ? "Good progress." : "Keep practicing.";
  $("results-summary").textContent = `You answered ${correct} out of ${questions.length} questions correctly. Review the explanations below to strengthen your PPC reasoning.`;
  const missed = questions.map((item, index) => ({ item, index })).filter(({ item, index }) => answers[index] !== item.answer);
  $("review-section").innerHTML = missed.length ? `
    <h3>Review missed questions</h3>
    ${missed.map(({ item, index }) => `
      <article class="review-card">
        <h3>${index + 1}. ${item.question}</h3>
        <p><strong>Your answer:</strong> ${answers[index] === null ? "Not answered" : `${String.fromCharCode(65 + answers[index])}. ${item.options[answers[index]]}`}</p>
        <p class="correct-answer"><strong>Correct answer:</strong> ${String.fromCharCode(65 + item.answer)}. ${item.options[item.answer]}</p>
        <p><strong>Why:</strong> ${item.explanation}</p>
        <div class="option-explanations">
          ${item.options.map((option, optionIndex) => `<p><strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${item.why[optionIndex]}</p>`).join("")}
        </div>
      </article>
    `).join("")}
  ` : "<h3>Perfect score - no answers to review.</h3>";
  quizPanel.classList.add("hidden");
  resultsPanel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("start-btn").addEventListener("click", () => {
  introPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  answers = Array(questions.length).fill(null);
  startTimer();
  renderQuestion();
});
$("prev-btn").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
});
$("next-btn").addEventListener("click", () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
});
$("restart-btn").addEventListener("click", () => {
  answers = Array(questions.length).fill(null);
  currentQuestion = 0;
  secondsLeft = quizDuration;
  resultsPanel.classList.add("hidden");
  introPanel.classList.remove("hidden");
  $("timer").textContent = "30:00";
  $("timer").className = "timer";
});
