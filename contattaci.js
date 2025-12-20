// Utility per mostrare popup di conferma
function showThankYouPopup() {
    var thankYouModal = new bootstrap.Modal(document.getElementById('thankYouPopup'));
    thankYouModal.show();
}

// Elementi
const iscrizioneBtn = document.getElementById('iscrizioneSwitchBtn');
const iscrizioneSwitch = document.getElementById('iscrizioneSwitch');
const nome = document.getElementById('nome');
const cognome = document.getElementById('cognome');
const telefono = document.getElementById('telefono');
const codiceFiscale = document.getElementById('codiceFiscale');
const indirizzo = document.getElementById('indirizzo');
const email = document.getElementById('email');
const oggetto = document.getElementById('oggetto');
const messaggio = document.getElementById('message');
const privacy = document.getElementById('privacyConsent');
const sendBtn = document.getElementById('sendBtn');
const paypalBtn = document.getElementById('paypalBtn');
const form = document.getElementById('contactForm');

// Stato iniziale
function setSocioMode(active) {
    cognome.disabled = !active;
    telefono.disabled = !active;
    codiceFiscale.disabled = !active;
    indirizzo.disabled = !active;
    oggetto.disabled = active;
    messaggio.disabled = active;

    nome.disabled = false;
    email.disabled = false;

    if (active) {
        oggetto.value = "Iscrizione";
        messaggio.value = "Ciao mi sono iscritto!";
    } else {
        cognome.value = "";
        telefono.value = "";
        codiceFiscale.value = "";
        indirizzo.value = "";
        oggetto.value = "";
        messaggio.value = "";
        oggetto.disabled = false;
        messaggio.disabled = false;
    }
    updateButtons();
}

// Aggiorna stato bottoni in base a modalità e consenso privacy
function updateButtons() {
    const isSocio = iscrizioneSwitch.checked;
    const privacyOk = privacy.checked;

    // Abilita/disabilita bottoni
    if (isSocio) {
        paypalBtn.style.pointerEvents = (privacyOk && nome.value && cognome.value && telefono.value && codiceFiscale.value && indirizzo.value && email.value) ? 'auto' : 'none';
        paypalBtn.style.opacity = (paypalBtn.style.pointerEvents === 'auto') ? '1' : '0.5';
        sendBtn.disabled = true;
        sendBtn.style.opacity = '.5';
        sendBtn.style.pointerEvents = 'none';
    } else {
        sendBtn.disabled = !(privacyOk && nome.value && email.value && oggetto.value && messaggio.value);
        sendBtn.style.opacity = sendBtn.disabled ? '.5' : '1';
        sendBtn.style.pointerEvents = sendBtn.disabled ? 'none' : 'auto';
        paypalBtn.style.pointerEvents = 'none';
        paypalBtn.style.opacity = '0.5';
    }
}

// Toggle modalità socio
iscrizioneBtn.addEventListener('click', function() {
    iscrizioneSwitch.checked = !iscrizioneSwitch.checked;
    setSocioMode(iscrizioneSwitch.checked);
});

// Aggiorna bottoni e campi su input
[nome, cognome, telefono, codiceFiscale, indirizzo, email, oggetto, messaggio, privacy, iscrizioneSwitch].forEach(el => {
    el.addEventListener('input', updateButtons);
    el.addEventListener('change', updateButtons);
});

// Invio normale
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (sendBtn.disabled) return;
    const formData = new FormData(form);
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(function(response) {
        if (response.ok) {
            showThankYouPopup();
            form.reset();
            setSocioMode(false);
        } else {
            alert('Errore nell\'invio. Riprova più tardi.');
        }
    }).catch(function() {
        alert('Errore di connessione. Riprova più tardi.');
    });
});

// Invio PayPal
paypalBtn.addEventListener('click', function(e) {
    if (paypalBtn.style.pointerEvents === 'none') {
        e.preventDefault();
        return;
    }
    e.preventDefault();

    // Imposta i valori necessari nel form principale
    oggetto.value = "Iscrizione";
    messaggio.value = "Ciao mi sono iscritto!";

    // Crea una copia dei dati del form
    const formData = new FormData(form);
    formData.set('oggetto', "Iscrizione");
    formData.set('message', "Ciao mi sono iscritto!");

    // Log per debug
    console.log('Invio dati iscrizione socio:', Array.from(formData.entries()));

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(function(response) {
        console.log('Risposta fetch:', response.status, response.ok);
        if (response.ok) {
            showThankYouPopup();
            setTimeout(function() {
                window.open("https://www.paypal.com/paypalme/festivaldellafoto/8", "_blank");
                form.reset();
                setSocioMode(false);
            }, 1200);
        } else {
            response.text().then(text => {
                console.error('Body risposta errore:', text);
                alert('Errore nell\'invio. Riprova più tardi.');
            });
        }
    }).catch(function(error) {
        console.error('Errore di connessione:', error);
        alert('Errore di connessione. Riprova più tardi.');
    });
});

// Stato iniziale
setSocioMode(false);
