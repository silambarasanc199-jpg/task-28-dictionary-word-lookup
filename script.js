const wordInput = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");

const result = document.getElementById("result");
const meaningsContainer = document.getElementById("meanings");
const wordTitle = document.getElementById("wordTitle");
const phonetic = document.getElementById("phonetic");

const audioBtn = document.getElementById("audioBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

let audioURL = "";


/* =========================
   SEARCH WORD
========================= */

async function searchWord(word = wordInput.value) {

    word = word.trim();

    if (!word) {
        showError("Please enter a word first.");
        return;
    }

    hideAll();

    loading.classList.remove("hidden");

    try {

        const apiURL =
            "https://en.wiktionary.org/api/rest_v1/page/definition/" +
            encodeURIComponent(word);

        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Word not found (${response.status})`
            );
        }

        const data = await response.json();

        if (!data.en) {
            throw new Error(
                "No English definition was found."
            );
        }

        displayResults(data.en, word);

    } catch (error) {

        console.error("Dictionary API Error:", error);

        showError(
            error.message ||
            "Unable to connect to the dictionary API."
        );

    } finally {

        loading.classList.add("hidden");

    }
}


/* =========================
   DISPLAY RESULTS
========================= */

function displayResults(entries, word) {

    result.classList.remove("hidden");

    wordTitle.textContent = word;

    phonetic.textContent = "";

    audioURL = "";

    audioBtn.classList.add("hidden");

    meaningsContainer.innerHTML = "";


    entries.forEach((entry) => {

        const card =
            document.createElement("div");

        card.className = "meaning-card";


        /* PART OF SPEECH */

        const partOfSpeech =
            document.createElement("div");

        partOfSpeech.className =
            "part-of-speech";

        partOfSpeech.textContent =
            entry.partOfSpeech ||
            "Definition";

        card.appendChild(partOfSpeech);


        /* DEFINITIONS */

        if (entry.definitions) {

            entry.definitions.forEach(
                (item, index) => {

                    const definitionBox =
                        document.createElement("div");

                    definitionBox.className =
                        "definition";


                    const number =
                        document.createElement("span");

                    number.className =
                        "definition-number";

                    number.textContent =
                        String(index + 1)
                            .padStart(2, "0");


                    const content =
                        document.createElement("div");


                    const definition =
                        document.createElement("p");

                    definition.textContent =
                        cleanText(
                            item.definition ||
                            "Definition unavailable."
                        );


                    content.appendChild(
                        definition
                    );


                    /* EXAMPLES */

                    if (item.examples) {

                        item.examples.forEach(
                            (exampleItem) => {

                                const example =
                                    document.createElement(
                                        "div"
                                    );

                                example.className =
                                    "example";

                                example.textContent =
                                    `"${cleanText(
                                        exampleItem.example ||
                                        ""
                                    )}"`;

                                content.appendChild(
                                    example
                                );

                            }
                        );

                    }


                    definitionBox.appendChild(
                        number
                    );

                    definitionBox.appendChild(
                        content
                    );

                    card.appendChild(
                        definitionBox
                    );

                }
            );

        }


        meaningsContainer.appendChild(
            card
        );

    });
}


/* =========================
   CLEAN WIKTIONARY TEXT
========================= */

function cleanText(text) {

    const temp =
        document.createElement("div");

    temp.innerHTML = text;

    return temp.textContent ||
           temp.innerText ||
           text;

}


/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
    "click",
    () => {
        searchWord();
    }
);


/* =========================
   ENTER KEY
========================= */

wordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchWord();

        }

    }
);


/* =========================
   SUGGESTIONS
========================= */

document
    .querySelectorAll(".suggestion")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const word =
                    button.textContent.trim();

                wordInput.value = word;

                searchWord(word);

            }
        );

    });


/* =========================
   ERROR
========================= */

function showError(message) {

    result.classList.add("hidden");

    audioBtn.classList.add("hidden");

    errorBox.classList.remove("hidden");

    errorMessage.textContent =
        message;

}


/* =========================
   HIDE UI STATES
========================= */

function hideAll() {

    result.classList.add("hidden");

    errorBox.classList.add("hidden");

    loading.classList.add("hidden");

    audioBtn.classList.add("hidden");

}                
