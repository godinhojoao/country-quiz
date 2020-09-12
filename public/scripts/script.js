(async function () {
    const countries = await getCountries();
    let usefulDataCountries = countries.map((country) => {
        return {
            name: country.name,
            capital: country.capital,
            flag: country.flag,
            region: country.region
        };
    });
    const divContent = document.querySelector('div.content');
    let buttonNext;
    let isWrong;
    let points = 0;

    async function getCountries() {
        const options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        };
        const url = 'https://restcountries.eu/rest/v2/all';

        let response = await fetch(url, options);

        return response.json();
    };

    function generateQuests() {
        let keys = Object.keys(usefulDataCountries[0]);
        let capitalQuestsAndAnswers = usefulDataCountries.map(country => {
            if (country[keys[1]]) {
                let capitalQuests = `What is ${keys[1]} of the ${country.name}?`;
                let capitalAnswers = country[keys[1]];
                let capitalQuestsAndAnswers = [capitalQuests, capitalAnswers];

                return capitalQuestsAndAnswers;
            };
        });

        capitalQuestsAndAnswers = capitalQuestsAndAnswers.filter(element => element != undefined);

        let flagQuestsAndAnswers = usefulDataCountries.map(country => {
            if (country[keys[2]]) {
                let flagQuests = `${country[keys[2]]} Which country does this flag belong to?`;
                let flagAnswers = country.name;
                let flagQuestsAndAnswers = [flagQuests, flagAnswers];

                return flagQuestsAndAnswers;
            };
        });

        return {
            capitalQuestsAndAnswers: capitalQuestsAndAnswers[generateRandomIndex(capitalQuestsAndAnswers)],
            flagQuestsAndAnswers: flagQuestsAndAnswers[generateRandomIndex(flagQuestsAndAnswers)]
        };
    };

    function generateAlternatives(numberOfAlternatives, alternativeType, answer) {
        let allCapitals = usefulDataCountries.map(country => country.capital);
        let allNames = usefulDataCountries.map(country => country.name);
        let alternatives = [answer];

        allCapitals = allCapitals.filter(element => element != '');

        for (let i = 0; i < numberOfAlternatives; i++) {
            if (alternativeType == 'names') {
                allNames = shuffle(allNames);
                let name = allNames[generateRandomIndex(allNames)];

                alternatives.push(name);
            }
            else if (alternativeType == 'capitals') {
                allCapitals = shuffle(allCapitals);
                let capital = allCapitals[generateRandomIndex(allCapitals)];

                alternatives.push(capital);
            };
        };

        return alternatives;
    };

    function shuffle(array) {
        for (let index = array.length; index; index--) {
            const randomIndex = Math.floor(Math.random() * index);

            [array[index - 1], array[randomIndex]] = [array[randomIndex], array[index - 1]];
        };

        return array;
    };

    function generateRandomIndex(array) {
        return Math.round(Math.random() * (array.length - 1));
    };

    function renderQuiz(current = 'capital') {
        divContent.classList.contains('lose') ? divContent.classList.remove('lose') : 0;

        divContent.innerHTML = `
        <img src="./public/images/undraw_adventure_4hum 1.svg" class="logo">
        <h2 class="quests"></h2>
        <div class="alternatives notranslate">
            <button><span class="alternative-letters">A</span> </button>
            <button><span class="alternative-letters">B</span> </button>
            <button><span class="alternative-letters">C</span> </button>
            <button><span class="alternative-letters">D</span> </button>
        </div>
        <button class="next vertical-translate">Next</button>`;

        let h2Quest = document.querySelector('h2.quests');
        let alternativeButtons = document.querySelectorAll('div.alternatives button');
        let questsAndAnswers = generateQuests();
        buttonNext = document.querySelector('button.next');

        buttonNext.addEventListener('click', function () {
            nextQuestion(isWrong);
        });

        if (current == 'capital') {
            let capitalQuestsAndAnswers = questsAndAnswers.capitalQuestsAndAnswers;
            let alternativeContents = shuffle(generateAlternatives(3, 'capitals', capitalQuestsAndAnswers[1]
            ));

            renderAlternatives(h2Quest, alternativeButtons, alternativeContents, capitalQuestsAndAnswers[0], false, capitalQuestsAndAnswers[1]);

        } else if (current = 'flag') {
            let flagQuestsAndAnswers = questsAndAnswers.flagQuestsAndAnswers;
            let alternativeContents = shuffle(generateAlternatives(3, 'names', flagQuestsAndAnswers[1]
            ));

            renderAlternatives(h2Quest, alternativeButtons, alternativeContents, flagQuestsAndAnswers[0], true, flagQuestsAndAnswers[1]);
        };
    };

    function renderAlternatives(h2Quest, alternativeButtons, alternativeContents, quest, img = false, answer) {
        let count = 0;

        if (img) {
            let flagLink = quest.split(' ')[0];
            let question = quest.split(' ');

            buttonNext.style.height = '19%';
            divContent.style.padding = '3rem 3.2rem';
            divContent.classList.add('flag');

            question.splice(0, 1);
            question = question.join(' ');

            h2Quest.innerHTML = `<img src='${flagLink}' class='flag'></img> ${question}`
        } else {
            buttonNext.style.height = '15%';
            divContent.style.padding = '4rem 3.2rem';
            divContent.classList.remove('flag');

            h2Quest.innerText = quest;
        };

        alternativeButtons.forEach(alternativeButton => {
            let span = document.createElement('span');
            let div = document.createElement('div');

            span.classList.add('alternative');

            alternativeContents[count].length > 17 ? span.style.fontSize = '1.6rem' : 0;
            alternativeContents[count].length > 25 ? span.style.fontSize = '1.4rem' : 0;
            alternativeContents[count].length > 35 ? span.style.fontSize = '1rem' : 0;

            span.innerText = alternativeContents[count];
            div.appendChild(span);
            alternativeButton.insertAdjacentElement('beforeend', div);

            count++;

            alternativeButton.addEventListener('click', receivingResponse);

        });

        function receivingResponse() {
            let button = this;

            evaluatingResponse(button, answer, alternativeButtons);
            alternativeButtons.forEach(button => button.removeEventListener('click', receivingResponse));
        };
    };

    function evaluatingResponse(button, answer, alternativeButtons) {
        let imgWrong = document.createElement('img');
        let imgRight = document.createElement('img');

        imgWrong.src = './public/images/highlight_off-white-18dp.svg';
        imgRight.src = './public/images/check_circle_outline-white-18dp.svg';

        alternativeButtons.forEach(button => {
            if (!!button.classList.value) {
                button.classList.remove(`${button.classList.value}`);
                !!button.querySelector('img') == true ? !!button.querySelector('img').remove() : 0;
            };
            button.querySelector('.alternative').innerText == answer ? button.classList.add('is-right') : 0;
            button.classList.contains('is-right') ? button.querySelector('div').insertAdjacentElement('beforeend', imgRight) : 0;
        });

        if (button.querySelector('.alternative').innerText != answer) {
            button.classList.add('is-wrong');
            button.querySelector('div').insertAdjacentElement('beforeend', imgWrong);
            isWrong = true;

        } else {
            isWrong = false;
        };

        buttonNext.style.opacity = '1';
        buttonNext.classList.remove('vertical-translate');
    };

    function nextQuestion(isWrong) {
        if (isWrong) {
            divContent.classList.add('lose');
            divContent.innerHTML = `
            <img src="./public/images/undraw_winners_ao2o 2.svg">
            <div class="results">
                <h2>Results</h2>
                <p>You got <span class="points">${points}</span> correct answers</p>
            </div>
            <button class="try-again">Try again</button>`;

            let buttonTryAgain = document.querySelector('button.try-again');

            buttonTryAgain.addEventListener('click', renderQuiz);

            points = 0;
        } else {
            let questType = 'flag';

            divContent.classList.contains('flag') ? questType = 'capital' : questType = 'flag';

            renderNewQuestion(questType);
            points++;
        };
    };

    function renderNewQuestion(type) {
        buttonNext.style.opacity = '0';
        buttonNext.classList.add('vertical-translate');

        let alternativeButtons = document.querySelectorAll('div.alternatives button');

        alternativeButtons.forEach((button) => {
            !!button.classList.value ? button.classList.remove(`${button.classList.value}`) : 0;
            button.childNodes[2].remove();
        });
        renderQuiz(type);
    };

    renderQuiz();
})();