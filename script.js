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
   MAIN SEARCH
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

        /* PRIMARY API */

        const primaryURL =
            "https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(word);

        const response = await fetch(primaryURL);

        if (response.ok) {

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                displayFreeDictionary(data[0]);
                return;
            }
        }

        /* FALLBACK API */

        await searchWiktionary(word);

    } catch (error) {

        console.log("Primary API unavailable:", error);

        try {

            await searchWiktionary(word);

        } catch (fallbackError) {

            console.log(
                "Fallback API unavailable:",
                fallbackError
            );

            showError(
                "Dictionary services are currently unavailable. Please try again."
            );
        }

    } finally {

        loading.classList.add("hidden");

    }
}


/* =========================
   FREE DICTIONARY API
========================= */

function displayFreeDictionary(data) {

    result.classList.remove("hidden");

    wordTitle.textContent =
        data.word || "Unknown";

    phonetic.textContent =
        data.phonetic || "";

    audioURL = "";

    audioBtn.classList.add("hidden");

    if (data.phonetics) {

        const audioData =
            data.phonetics.find(
                item =>
                    item.audio &&
                    item.audio.trim() !== ""
            );

        if (audioData) {

            audioURL =
                audioData.audio.startsWith("//")
                    ? "https:" + audioData.audio
                    : audioData.audio;

            audioBtn.classList.remove("hidden");
        }
    }

    meaningsContainer.innerHTML = "";

    data.meanings.forEach(meaning => {

        const card =
            document.createElement("div");

        card.className =
            "meaning-card";

        const part =
            document.createElement("div");

        part.className =
            "part-of-speech";

        part.textContent =
            meaning.partOfSpeech || "Meaning";

        card.appendChild(part);

        meaning.definitions.forEach(
            (definition, index) => {

                const box =
                    document.createElement("div");

                box.className =
                    "definition";

                const number =
                    document.createElement("span");

                number.className =
                    "definition-number";

                number.textContent =
                    String(index + 1).padStart(2, "0");

                const content =
                    document.createElement("div");

                const text =
                    document.createElement("p");

                text.textContent =
                    definition.definition;

                content.appendChild(text);

                if (definition.example) {

                    const example =
                        document.createElement("div");

                    example.className =
                        "example";

                    example.textContent =
                        `"${definition.example}"`;

                    content.appendChild(example);
                }

                box.appendChild(number);
                box.appendChild(content);

                card.appendChild(box);
            }
        );

        meaningsContainer.appendChild(card);
    });
}


/* =========================
   WIKTIONARY FALLBACK
========================= */

async function searchWiktionary(word) {

    const url =
        "https://en.wiktionary.org/api/rest_v1/page/definition/" +
        encodeURIComponent(word);

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error("Fallback word not found");
    }

    const data =
        await response.json();

    if (!data.en) {
        throw new Error("No English definition found");
    }

    displayWiktionary(data, word);
}


/* =========================
   DISPLAY WIKTIONARY
========================= */

function displayWiktionary(data, word) {

    result.classList.remove("hidden");

    wordTitle.textContent =
        word;

    phonetic.textContent = "";

    audioURL = "";

    audioBtn.classList.add("hidden");

    meaningsContainer.innerHTML = "";

    const english =
        data.en;

    english.forEach(section => {

        const card =
            document.createElement("div");

        card.className =
            "meaning-card";

        const part =
            document.createElement("div");

        part.className =
            "part-of-speech";

        part.textContent =
            section.partOfSpeech ||
            "Definition";

        card.appendChild(part);

        if (section.definitions) {

            section.definitions.forEach(
                (definition, index) => {

                    const box =
                        document.createElement("div");

                    box.className =
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

                    const text =
                        document.createElement("p");

                    text.textContent =
                        definition.definition ||
                        "Definition unavailable.";

                    content.appendChild(text);

                    if (definition.examples) {

                        definition.examples.forEach(
                            exampleData => {

                                const example =
                                    document.createElement(
                                        "div"
                                    );

                                example.className =
                                    "example";

                                example.textContent =
                                    `"${exampleData.example}"`;

                                content.appendChild(
                                    example
                                );
                            }
                        );
                    }

                    box.appendChild(number);
                    box.appendChild(content);

                    card.appendChild(box);
                }
            );
        }

        meaningsContainer.appendChild(card);
    });
}


/* =========================
   AUDIO
========================= */

audioBtn.addEventListener(
    "click",
    () => {

        if (!audioURL) return;

        const audio =
            new Audio(audioURL);

        audio.play().catch(
            error => console.log(
                "Audio error:",
                error
            )
        );
    }
);


/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
    "click",
    () => searchWord()
);


/* =========================
   ENTER KEY
========================= */

wordInput.addEventListener(
    "keydown",
    event => {

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
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                wordInput.value =
                    button.textContent.trim();

                searchWord();
            }
        );
    });


/* =========================
   ERROR
========================= */

function showError(message) {

    result.classList.add("hidden");

    errorBox.classList.remove("hidden");

    errorMessage.textContent =
        message;
}


/* =========================
   HIDE UI
========================= */

function hideAll() {

    result.classList.add("hidden");

    errorBox.classList.add("hidden");

    loading.classList.add("hidden");

    audioBtn.classList.add("hidden");
}
