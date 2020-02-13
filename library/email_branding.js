
const myDomain = process.env.DOMAIN


module.exports.getSignatureLine = (brand) => {
  switch (brand) {
    default:
      return `
      <strong>Remit FX</strong>
      <br/>
      <br/><br/>
              ABN 22 147 363 175<br/>
              AFSL 401379<br/>
              Level 5, 250 Queen Street<br/>
              Melbourne Vic 3000<br/>
              <br/>
              www.ctin.com.au | www.remitfx.io
      <br/>
      CTIN Financial Services Pty Ltd | ABN 72 622 577 440 | AFSL 504151
      <br/>
      <br/>
      <em>
        Disclaimer: This message is intended for the exclusive use of, and access by, the intended recipient only. Accidental or unintended recipients are expressly notified that neither you nor any person or entity associated with you may copy, distribute, transmit or forward this email. Neither the sender nor the intended recipient waive any legal right or privilege available to them which protects the exclusivity, confidentiality, privacy or privilege of the sender, the intended recipient, the information contained in this correspondence, and any and all attachments hereto. If you are not the intended recipient, we respectfully request that you reply to the sender of this email to notify us of its delivery to you in error, after which you may delete the sent email, and then delete it permanently from your deleted items.
      </em>
      </p>      `;
  }
}
