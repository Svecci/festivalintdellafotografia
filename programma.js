// === Modal poster: gestione fade-in immagine e cleanup ===
document.addEventListener('DOMContentLoaded', function () {
  var modalEl = document.getElementById('eventPosterModal');
  if (!modalEl) return;

  var imgEl = modalEl.querySelector('#modalPosterImg');
  var titleEl = modalEl.querySelector('#modalPosterTitle');
  var dateEl = modalEl.querySelector('#modalPosterDate');
  var descEl = modalEl.querySelector('#modalPosterDesc');

  modalEl.addEventListener('show.bs.modal', function (event) {
    var btn = event.relatedTarget; if (!btn) return;
    // Reset stato immagine per fade-in
    modalEl.classList.remove('img-ready');
    if (imgEl) { imgEl.removeAttribute('src'); }

    var title = btn.getAttribute('data-title') || 'Evento';
    var date = btn.getAttribute('data-date') || '';
    var img = btn.getAttribute('data-img') || '';
    var desc = btn.getAttribute('data-desc') || '';

    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = date;
    if (descEl) descEl.textContent = desc || 'Dettagli disponibili a breve.';

    if (imgEl) {
      imgEl.onload = function(){ modalEl.classList.add('img-ready'); };
      imgEl.onerror = function(){ modalEl.classList.add('img-ready'); };
      imgEl.src = img;
      imgEl.alt = title;
    }
  });

  modalEl.addEventListener('hidden.bs.modal', function(){
    // Cleanup per prossime aperture
    modalEl.classList.remove('img-ready');
    if (imgEl) { imgEl.removeAttribute('src'); }
  });
});
