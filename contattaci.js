document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    }).then(function(response) {
        if (response.ok) {
            var thankYouModal = new bootstrap.Modal(document.getElementById('thankYouPopup'));
            thankYouModal.show();
            form.reset();
            document.getElementById('paypalBtn').style.pointerEvents = 'none';
            document.getElementById('paypalBtn').style.opacity = '0.5';
        } else {
            alert('Errore nell\'invio. Riprova più tardi.');
        }
    }).catch(function() {
        alert('Errore di connessione. Riprova più tardi.');
    });
});

// Bottone iscriviti dinamico
const iscrizioneSwitchBtn = document.getElementById('iscrizioneSwitchBtn');
const iscrizioneSwitch = document.getElementById('iscrizioneSwitch');
iscrizioneSwitchBtn.addEventListener('click', function() {
    iscrizioneSwitch.checked = !iscrizioneSwitch.checked;
    this.classList.toggle('active', iscrizioneSwitch.checked);
    document.getElementById('cognome').disabled = !iscrizioneSwitch.checked;
    document.getElementById('telefono').disabled = !iscrizioneSwitch.checked;
    document.getElementById('codiceFiscale').disabled = !iscrizioneSwitch.checked;
    // ABILITA / DISABILITA INDIRIZZO SOLO IN MODALITÀ SOCIO
    document.getElementById('indirizzo').disabled = !iscrizioneSwitch.checked;

    // Disabilita oggetto e messaggio se iscrizione attiva
    document.getElementById('oggetto').disabled = iscrizioneSwitch.checked;
    document.getElementById('message').disabled = iscrizioneSwitch.checked;
    if (!iscrizioneSwitch.checked) {
        document.getElementById('cognome').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('codiceFiscale').value = '';
        document.getElementById('indirizzo').value = ''; // reset indirizzo
        document.getElementById('oggetto').value = '';
        document.getElementById('message').value = '';
    }
    checkPaypalFields();
    controlSendButton(); // NEW
});

// Modifica checkPaypalFields per abilitare PayPal solo se switch attivo e campi compilati
function checkPaypalFields() {
    const iscrizione = document.getElementById('iscrizioneSwitch').checked;
    const nome = document.getElementById('nome').value.trim();
    const cognome = document.getElementById('cognome').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const codiceFiscale = document.getElementById('codiceFiscale').value.trim();
    const indirizzo = document.getElementById('indirizzo').value.trim();
    const paypalBtn = document.getElementById('paypalBtn');
    const consent = document.getElementById('privacyConsent'); // nuovo controllo consenso
    // Se manca consenso privacy disabilita sempre
    if (!consent || !consent.checked) {
        paypalBtn.style.pointerEvents = 'none';
        paypalBtn.style.opacity = '0.5';
        return;
    }
    if (iscrizione && nome && cognome && telefono && email && codiceFiscale && indirizzo) {
        paypalBtn.style.pointerEvents = 'auto';
        paypalBtn.style.opacity = '1';
    } else {
        paypalBtn.style.pointerEvents = 'none';
        paypalBtn.style.opacity = '0.5';
    }
}

// NEW: gestione stato bottone Invia (disabilitato se iscrizione attiva)
function controlSendButton() {
    const sendBtn = document.getElementById('sendBtn');
    const consent = document.getElementById('privacyConsent');
    const membership = document.getElementById('iscrizioneSwitch').checked;
    if (!sendBtn) return;
    if (consent && consent.checked && !membership) {
        sendBtn.disabled = false;
        sendBtn.style.opacity = '';
        sendBtn.style.pointerEvents = '';
    } else {
        sendBtn.disabled = true;
        sendBtn.style.opacity = '.5';
        sendBtn.style.pointerEvents = 'none';
    }
}

// Aggiorna listeners includendo indirizzo
['nome', 'cognome', 'telefono', 'email', 'codiceFiscale', 'indirizzo', 'iscrizioneSwitch'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', checkPaypalFields);
    document.getElementById(id).addEventListener('change', checkPaypalFields);
});

// PayPal automatic mail + prefilled redirect
document.getElementById('paypalBtn').addEventListener('click', function(e) {
    const nome = document.getElementById('nome').value.trim();
    const cognome = document.getElementById('cognome').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const codiceFiscale = document.getElementById('codiceFiscale').value.trim();
    const indirizzo = document.getElementById('indirizzo').value.trim(); // include indirizzo

    // Blocca se non tutti i campi sono compilati
    if (!(nome && cognome && telefono && email && codiceFiscale && indirizzo)) {
        e.preventDefault();
        return;
    }

    // Disabilita subito il bottone Invia per prevenire doppio invio
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.style.opacity = '.5';
        sendBtn.style.pointerEvents = 'none';
    }

    // Precompila i dati PayPal (solo nota, prezzo già impostato)
    const paypalUrl = "https://www.paypal.com/paypalme/festivaldellafoto/8";
    const note = encodeURIComponent(
        `Iscrizione socio:\nNome: ${nome}\nCognome: ${cognome}\nTelefono: ${telefono}\nEmail: ${email}\nCodice Fiscale: ${codiceFiscale}\nIndirizzo: ${indirizzo}`
    );
    this.href = `${paypalUrl}?note=${note}`;

    // Invia la mail di sicurezza tramite FormSubmit e poi reindirizza a PayPal
    e.preventDefault();
    fetch("https://formsubmit.co/festivaldellafotografia@gmail.com", {
        method: "POST",
        body: JSON.stringify({
            nome: nome,
            cognome: cognome,
            telefono: telefono,
            email: email,
            codiceFiscale: codiceFiscale,
            indirizzo: indirizzo,
            oggetto: "Richiesta iscrizione socio tramite PayPal",
            message: "Richiesta iscrizione socio. Dati:\nNome: " + nome + "\nCognome: " + cognome + "\nTelefono: " + telefono + "\nEmail: " + email + "\nCodice Fiscale: " + codiceFiscale + "\nIndirizzo: " + indirizzo + "\nPagamento: 15 euro tramite PayPal."
        }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        // Mostra popup di conferma anche per PayPal
        if (response.ok) {
            var thankYouModal = new bootstrap.Modal(document.getElementById('thankYouPopup'));
            thankYouModal.show();
            setTimeout(function() {
                window.location.href = `${paypalUrl}?note=${note}`;
            }, 1500);
        } else {
            alert('Errore nell\'invio. Riprova più tardi.');
        }
    }).catch(function() {
        alert('Errore di connessione. Riprova più tardi.');
    });
});

iscrizioneSwitch.addEventListener('change', function() {
    iscrizioneSwitchBtn.classList.toggle('active', this.checked);
    document.getElementById('cognome').disabled = !this.checked;
    document.getElementById('telefono').disabled = !this.checked;
    document.getElementById('codiceFiscale').disabled = !this.checked;
    document.getElementById('indirizzo').disabled = !this.checked; // toggle indirizzo
    // Disabilita oggetto e messaggio se iscrizione attiva
    document.getElementById('oggetto').disabled = this.checked;
    document.getElementById('message').disabled = this.checked;
    if (!this.checked) {
        document.getElementById('cognome').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('codiceFiscale').value = '';
        document.getElementById('indirizzo').value = ''; // reset indirizzo
        document.getElementById('oggetto').value = '';
        document.getElementById('message').value = '';
    }
    checkPaypalFields();
    controlSendButton(); // NEW
});

// Gating bottoni su consenso privacy (aggiornato per usare controlSendButton)
(function () {
    const consent = document.getElementById('privacyConsent');
    const paypalBtn = document.getElementById('paypalBtn');

    function applyState() {
        const ok = consent.checked;
        if (!ok) {
            paypalBtn.style.opacity = '.5';
            paypalBtn.style.pointerEvents = 'none';
        }
        controlSendButton(); // delega stato "Invia"
        checkPaypalFields(); // mantiene logica PayPal
    }
    consent.addEventListener('change', applyState);
    applyState();
})();