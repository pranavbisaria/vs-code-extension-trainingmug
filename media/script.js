var submissions;
const mainContainer = document.querySelector(".main-container");

submissions.forEach((submission) => {
    console.log(submission);
    const submissionContainer = document.createElement("div");
    submissionContainer.className = "submissionContainer";

    const circularProgress = document.createElement("div");
    circularProgress.className = "circular-progress";
    const successCount = submission.testCases.filter(testCase => testCase.success === true).length;
    const successPercentage = Math.round((successCount / submission.testCases.length) * 100);
    const progressColor = successPercentage >= 80 ? "#A4C739" : successPercentage >= 40 ? "#FAA356" : "#FA7970";

    circularProgress.setAttribute("data-inner-circle-color", "#242D36");
    circularProgress.setAttribute("data-percentage", successPercentage);
    circularProgress.setAttribute("data-progress-color", progressColor);
    circularProgress.setAttribute("data-bg-color", "#6B7B8B");

    const innerCircle = document.createElement("div");
    innerCircle.className = "inner-circle";

    const progressValue = document.createElement("p");
    progressValue.className = "percentage";

    circularProgress.appendChild(innerCircle);
    innerCircle.appendChild(progressValue);

    const submissionInfo = document.createElement("div");
    submissionInfo.className = "submissionInfo";

    const submissionInfoInner = document.createElement("div");
    submissionInfoInner.className = "submissionInfoInner";

    const submissionInfoInnerInner = document.createElement("div");
    submissionInfoInnerInner.className = "submissionInfoInnerInner";

    const submissionTitle = document.createElement("b");
    submissionTitle.style.fontSize = "18px";
    submissionTitle.textContent = submission.submissionTitle;

    const submissionDate = document.createElement("p");
    submissionDate.style.fontSize = "12px";
    submissionDate.textContent = `Submitted: ${submission.submittedAt}`;

    submissionInfoInnerInner.appendChild(submissionTitle);
    submissionInfoInnerInner.appendChild(submissionDate);

    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("width", "11");
    svgIcon.setAttribute("height", "12");
    svgIcon.setAttribute("viewBox", "0 0 11 12");
    svgIcon.setAttribute("fill", "none");
    const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svgPath.setAttribute("d", "M1.41667 11.25C1.09583 11.25 0.821181 11.1358 0.592708 10.9073C0.364236 10.6788 0.25 10.4042 0.25 10.0833V1.91667C0.25 1.59583 0.364236 1.32118 0.592708 1.09271C0.821181 0.864236 1.09583 0.75 1.41667 0.75H5.5V1.91667H1.41667V10.0833H9.58333V6H10.75V10.0833C10.75 10.4042 10.6358 10.6788 10.4073 10.9073C10.1788 11.1358 9.90417 11.25 9.58333 11.25H1.41667ZM4.15833 8.15833L3.34167 7.34167L8.76667 1.91667H6.66667V0.75H10.75V4.83333H9.58333V2.73333L4.15833 8.15833Z");
    svgPath.setAttribute("fill", "white");
    svgIcon.appendChild(svgPath);

    const viewSolutionButton = document.createElement("button");
    viewSolutionButton.className = "view-sol-btn";
    viewSolutionButton.textContent = "View solution ";
    viewSolutionButton.appendChild(svgIcon);
    viewSolutionButton.addEventListener('click', () => {
        tsvscode.postMessage({ type: 'openPanel', value:  data = {
          title: submission.testCases[0].caseTitle,
          more: submission.testCases[0].more
        }});
    });

    submissionInfoInner.appendChild(submissionInfoInnerInner);
    submissionInfoInner.appendChild(viewSolutionButton);

    const testCaseContainer = document.createElement("div");
    testCaseContainer.className = "test-case-container";

    submission.testCases.forEach((testCase) => {
        const testCaseDiv = document.createElement("div");
        testCaseDiv.className = "test-case";
        testCaseDiv.textContent = testCase.caseTitle;
        testCaseDiv.style.backgroundColor = testCase.success === true ? "#A4C739" : "#FA7970";
        testCaseDiv.addEventListener('click', () => {
            tsvscode.postMessage({ type: 'openPanel', value:  data = {
              title: testCase.caseTitle,
              more: testCase.more
            }});
        });
        testCaseContainer.appendChild(testCaseDiv);
    });

    submissionInfo.appendChild(submissionInfoInner);
    submissionInfo.appendChild(testCaseContainer);

    submissionContainer.appendChild(circularProgress);
    submissionContainer.appendChild(submissionInfo);

    mainContainer.appendChild(submissionContainer);
});

const circularProgress = document.querySelectorAll(".circular-progress");

Array.from(circularProgress).forEach((progressBar) => {
const progressValue = progressBar.querySelector(".percentage");
const innerCircle = progressBar.querySelector(".inner-circle");
let startValue = 0,
    endValue = Number(progressBar.getAttribute("data-percentage")),
    speed = 20,
    progressColor = progressBar.getAttribute("data-progress-color");
    
const progress = setInterval(() => {
    if (endValue !== 0) {
        startValue++;
    }
    progressValue.textContent = `${startValue}%`;
    
    innerCircle.style.backgroundColor = `${progressBar.getAttribute(
        "data-inner-circle-color"
    )}`;
    
    progressBar.style.background = `conic-gradient(${progressColor} ${
        startValue * 3.6
    }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;

    if (startValue === endValue) {
        clearInterval(progress);
    }
}, speed);
});
