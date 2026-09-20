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
            "https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(word);

        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {

            if (response.status === 404) {
                throw new Error(
                    `No dictionary entry found for "${word}".`
                );
            }

            throw new Error(
                `Dictionary API returned status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No dictionary data was returned.");
        }

        displayWord(data[0]);

    } catch (error) {

        console.error("Dictionary API Error:", error);

        showError(
            error.message ||
            "Unable to connect to the dictionary service."
        );

    } finally {

        loading.classList.add("hidden");

    }
}


/* =========================
   DISPLAY WORD
========================= */

function displayWord(data) {

    result.classList.remove("hidden");

    wordTitle.textContent =
        data.word || "Unknown";

    phonetic.textContent = "";

    audioURL = "";

    /* PHONETIC */

    if (data.phonetic) {

        phonetic.textContent =
            data.phonetic;

    } else if (data.phonetics) {

        const phoneticData =
            data.phonetics.find(
                item => item.text
            );

        if (phoneticData) {

            phonetic.textContent =
                phoneticData.text;

        }

    }


    /* AUDIO */

    if (data.phonetics) {

        const audioData =
            data.phonetics.find(
                item =>
                    item.audio &&
                    item.audio.trim() !== ""
            );

        if (audioData) {

            audioURL =
                audioData.audio;

            audioBtn.classList.remove(
                "hidden"
            );

        }

    }


    /* CLEAR OLD RESULTS */

    meaningsContainer.innerHTML = "";


    /* MEANINGS */

    if (!data.meanings ||
        data.meanings.length === 0) {

        showError(
            "The word was found, but no definitions were returned."
        );

        return;
    }


    data.meanings.forEach(
        (meaning) => {

            const card =
                document.createElement("div");

            card.className =
                "meaning-card";


            /* PART OF SPEECH */

            const partOfSpeech =
                document.createElement("div");

            partOfSpeech.className =
                "part-of-speech";

            partOfSpeech.textContent =
                meaning.partOfSpeech ||
                "Meaning";


            card.appendChild(
                partOfSpeech
            );


            /* DEFINITIONS */

            if (meaning.definitions) {

                meaning.definitions.forEach(
                    (definition, index) => {

                        const definitionBox =
                            document.createElement(
                                "div"
                            );

                        definitionBox.className =
                            "definition";


                        const number =
                            document.createElement(
                                "span"
                            );

                        number.className =
                            "definition-number";

                        number.textContent =
                            String(index + 1)
                                .padStart(2, "0");


                        const content =
                            document.createElement(
                                "div"
                            );


                        const text =
                            document.createElement(
                                "p"
                            );

                        text.textContent =
                            definition.definition ||
                            "Definition unavailable.";


                        content.appendChild(
                            text
                        );


                        /* EXAMPLE */

                        if (definition.example) {

                            const example =
                                document.createElement(
                                    "div"
                                );

                            example.className =
                                "example";

                            example.textContent =
                                `"${definition.example}"`;

                            content.appendChild(
                                example
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

        }
    );
}


/* =========================
   AUDIO
========================= */

audioBtn.addEventListener(
    "click",
    function () {

        if (!audioURL) {
            return;
        }

        const audio =
            new Audio(audioURL);

        audio.play().catch(
            error => {
                console.log(
                    "Audio playback failed:",
                    error
                );
            }
        );

    }
);


/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
    "click",
    function () {

        searchWord();

    }
);


/* =========================
   ENTER KEY
========================= */

wordInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchWord();

        }

    }
);


/* =========================
   SUGGESTION BUTTONS
========================= */

document
    .querySelectorAll(".suggestion")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                wordInput.value =
                    this.textContent.trim();

                searchWord();

            }
        );

    });


/* =========================
   ERROR MESSAGE
========================= */

function showError(message) {

    result.classList.add("hidden");

    loading.classList.add("hidden");

    audioBtn.classList.add("hidden");

    errorBox.classList.remove(
        "hidden"
    );

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
