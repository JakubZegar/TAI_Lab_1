let preQuestions;
let questionCircles;
let questionBar = '';
let answeredQuestion= []

let next = document.querySelector('.next');
let previous = document.querySelector('.previous');

let question = document.querySelector('.question');
let answers = document.querySelectorAll('.list-group-item');

let questionNumber = document.querySelector('.questionNumber');

let pointsElem = document.querySelector('.score');

let results = document.querySelector('.results');
let restart = document.querySelector('.restart');
let index = 0;
let points = 0;

let firstQuestion = true;
let questionBarElem;


fetch('https://quiztai.herokuapp.com/api/quiz')
.then(resp => resp.json())
.then(resp => {
       preQuestions = resp;

       questionBarElem = document.querySelector(".questionBar");

       for(i = 0; i < preQuestions.length; ++i){
            questionBar += '<div class="circle" id=' + i + '></div>';
       }
       
        questionBarElem.innerHTML = questionBar;
            
        questionCircles = document.querySelectorAll('.circle');

        for( let i = 0; i < questionCircles.length; ++i ){
            questionCircles[i].addEventListener('click', function (event) {
                questionCircles[index].style.transform = "initial";
                index = parseInt(event.target.id);
                setQuestion(index);
                nextQuestion();
            });    
        }

        clearAnswers();
        nextQuestion();
        setQuestion(0);
});

function clearAnswers() {
     for(let i = 0; i <  20 ; ++i){
        answeredQuestion[i] = { "answerID":null,
                                "correct":null}
    }
}

function clearCirlcles() {
    for( let i = 0; i< questionCircles.length; ++i ){
        questionCircles[i].style.backgroundColor="white";
    }
}

function setQuestion(index) {
    
    questionNumber.innerHTML = (index + 1) + "/20";
    questionCircles[index].style.transform = "scale(1.4,1.4)";

    question.innerHTML = preQuestions[index].question;

    answers[0].innerHTML = preQuestions[index].answers[0];
    answers[1].innerHTML = preQuestions[index].answers[1];
    answers[2].innerHTML = preQuestions[index].answers[2];
    answers[3].innerHTML = preQuestions[index].answers[3];
    if (preQuestions[index].answers.length === 2) {
        answers[2].style.display = 'none';
        answers[3].style.display = 'none';
    } else {
        answers[2].style.display = 'block';
        answers[3].style.display = 'block';
    }
}

next.addEventListener('click', function (event) {
    if(index < 19){
        questionCircles[index].style.transform = "initial";
        index++;
        setQuestion(index);
        nextQuestion();
    } 
});

previous.addEventListener('click', function (event) {
    if( index > 0) {
        questionCircles[index].style.transform = "initial";
        index--;
        setQuestion(index);
        nextQuestion();
    }
});

function doAction(event) {
    if (event.target.innerHTML === preQuestions[index].correct_answer) {
        points++;
        pointsElem.innerText = points;
        paintAnswer(event.target,"green");
        questionCircles[index].style.backgroundColor="green";
        answeredQuestion[index].correct=true;

    } else {
        paintAnswer(event.target,"red");
        questionCircles[index].style.backgroundColor="red";
        answeredQuestion[index].correct=false;
    }
    answeredQuestion[index].answerId=event.target.id;
    disableAnswers();

    if( checkIfAnyQuestionsLeft() ) {
        results.style.display="inline"
        showResults(points);
    }
}

function nextQuestion(){
    disableAnswers();
    for (let i = 0; i < answers.length; i++) {

        answers[i].style.backgroundColor="white";

        if(answeredQuestion[index].correct == null || firstQuestion ){
            answers[i].addEventListener('click', doAction);
        }
    }

    if( answeredQuestion[index].correct == true){
        answers[answeredQuestion[index].answerId].style.backgroundColor="green";
    } else if ( answeredQuestion[index].correct == false ) {
        answers[answeredQuestion[index].answerId].style.backgroundColor="red";
    }

    if( firstQuestion ) {
        firstQuestion = false;
    }
}

function checkIfAnyQuestionsLeft() {

    for (answer of answeredQuestion) {
        if( answer.answerId == null){
            return false;
        }
    }
    return true;
}

function paintAnswer(clickedAnswer,color){
    clickedAnswer.style.backgroundColor=color;
}

function disableAnswers(){
    for (let i = 0; i < answers.length; i++) {
        answers[i].removeEventListener('click', doAction);
    }   
}

restart.addEventListener('click', function (event) {
    event.preventDefault();
    questionCircles[index].style.transform = "initial";
    index = 0;
    points = 0;
    firstQuestion = true;
    clearAnswers();
    clearCirlcles();
    let userScorePoint = document.querySelector('.score');
    userScorePoint.innerHTML = points;
    nextQuestion();
    setQuestion(index);
    //list.style.display = 'block';
    results.style.display = 'none';
});

function showResults(points) {

    if(JSON.parse(localStorage.getItem("avg") == null)){
        let firstResult = {
            "totalQuizFinished":0,
            "averageResult":0
        }
        localStorage.setItem("avg", JSON.stringify(firstResult));
    }

    let quizResult = JSON.parse(localStorage.getItem("avg"));

    nextAvg = (((quizResult.totalQuizFinished * quizResult.averageResult) + points)/(quizResult.totalQuizFinished+1));

    let quizResultUpdate = {
        "totalQuizFinished":quizResult.totalQuizFinished + 1,
        "averageResult": nextAvg
    }


    localStorage.setItem("avg", JSON.stringify(quizResultUpdate));

    let tableResult =   '<th scope="row">Your score</th>'+
                        '<td class="userScorePoint">'+ points +'</td>'+
                        '<td class="average">'+ nextAvg +'</td>'

    let tableElement = document.querySelector(".resultTable");
    tableElement.innerHTML = tableResult;

    console.log(quizResultUpdate.totalQuizFinished)
}