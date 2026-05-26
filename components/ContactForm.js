'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setStatus('Formulaire non connecté : aucune donnée n’a été envoyée. Branchez une API route ou un service d’email avant la mise en production.');
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>Nom<input name="name" placeholder="Votre nom" autoComplete="name" maxLength="80" /></label>
      <label>Email<input type="email" name="email" placeholder="vous@exemple.com" autoComplete="email" maxLength="120" /></label>
      <label>Message<textarea name="message" rows="5" placeholder="Votre message" maxLength="1200" /></label>
      <button type="submit" className="button">Envoyer</button>
      {status && <p className="form-note secure-note" role="status">{status}</p>}
    </form>
  );
}
